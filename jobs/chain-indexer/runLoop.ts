/**
 * P3-06 인덱서 프로세스 진입점. indexer.ts(순수 로직)를 HTTP 요청 생명주기와 분리된
 * 별도 프로세스에서 주기 실행한다 (03-onchain-system.md: "수집과 인덱서는 API 요청의
 * 생명주기에 묶지 않는다").
 *
 * 실행 방법 (로컬 개발):
 *   node --import tsx jobs/chain-indexer/runLoop.ts
 *
 * 환경변수:
 *   INDEXER_RPC_URL              (필수) 체인 RPC 엔드포인트. 로컬은 http://127.0.0.1:8545
 *   INDEXER_DEPLOYMENT_FILE      (선택) chain 패키지가 생성한 배포 메타데이터 JSON 경로.
 *                                 기본값 chain/deployments/local-<chainId>.json.
 *                                 chainId/contractAddress/deploymentBlockNumber/abi를 담고
 *                                 있어야 한다 (chain/scripts/generateDeploymentMetadata.ts).
 *   INDEXER_CHAIN_ID             (선택) 배포 메타데이터의 chainId와 대조 검증에 사용. 기본
 *                                 31337(로컬 Hardhat).
 *   INDEXER_CONFIRMATIONS        (선택) 기본 0 (로컬). 공개 테스트넷 배포 시 반드시 체인
 *                                 재조직 특성에 맞게 상향 조정할 것 (03-onchain-system.md 6절).
 *   INDEXER_MAX_BLOCK_RANGE      (선택) 기본 2000.
 *   INDEXER_POLL_INTERVAL_MS     (선택) 기본 5000.
 *   INDEXER_REPOSITORY_MODULE    (필수, 실제 운영 시) IndexerRepository를 만들어 내는 모듈
 *                                 경로. 기본 export가 `() => Promise<IndexerRepository> |
 *                                 IndexerRepository` 형태의 팩토리여야 한다.
 *                                 *** 03(DB 담당)의 실제 구현이 아직 accepted 되지 않았으므로
 *                                 (docs/reports/handoffs/agent_01/ 비어있음 - C0 단계),
 *                                 이 값을 지정하지 않으면 in-memory repository로 fallback한다.
 *                                 이 fallback은 "메모리 fake는 영속성 통과 증거가 아니다"
 *                                 (api-v1.md) - 프로세스 재시작 시 커서/이벤트가 모두
 *                                 소실되므로 개발/시연 전용이며 운영에는 절대 쓰면 안 된다.
 *                                 이 경고는 기동 로그에도 매 사이클 남긴다. ***
 *
 * 종료: SIGINT/SIGTERM 수신 시 진행 중인 한 사이클을 끝까지 마치고 정지한다(중간에 끊어
 * 부분 배치를 만들지 않는다).
 *
 * DeepReorgError(창 안에서 공통 조상을 못 찾은 깊은 재조직)는 자동 복구 대상이 아니므로
 * 루프를 멈추고 비정상 종료(exit code 1)한다 - 운영자가 deployment_block부터 재구축 도구로
 * 수동 복구해야 한다 (03-onchain-system.md 6절 6번, ports.ts DeepReorgError 참고).
 */
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import type { Address } from "viem";
import { ChainIndexer, type ChainIndexerConfig } from "./indexer.js";
import { DeepReorgError, type IndexerRepository } from "./ports.js";
import { InMemoryIndexerRepository } from "./testing/inMemoryIndexerRepository.js";
import { ChainRpcProvider } from "../../src/server/providers/rpc/chainClient.js";

/**
 * chain/scripts/generateDeploymentMetadata.ts가 쓰는 실제 필드명(address, not
 * contractAddress)에 맞춘다 - "각 모듈에 계약 주소를 수동 중복 입력하지 않는다"는
 * 03-onchain-system.md 7절 원칙에 따라 이 파일이 유일한 출처이며 여기서 이름을 바꿔
 * 옮겨 적지 않는다.
 */
interface DeploymentMetadata {
  chainId: number;
  address: Address;
  deploymentBlockNumber: number | string;
  abi: readonly unknown[];
}

function envInt(name: string, fallback: number): number {
  const raw = process.env[name];
  if (raw === undefined || raw === "") return fallback;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) {
    throw new Error(`환경변수 ${name}가 올바른 숫자가 아니다: ${raw}`);
  }
  return parsed;
}

async function loadDeploymentMetadata(chainId: number): Promise<DeploymentMetadata> {
  const path =
    process.env.INDEXER_DEPLOYMENT_FILE ?? resolve(process.cwd(), `chain/deployments/local-${chainId}.json`);
  let raw: string;
  try {
    raw = await readFile(path, "utf8");
  } catch (err) {
    throw new Error(
      `배포 메타데이터 파일을 읽을 수 없다: ${path}. ` +
        `chain 패키지에서 scripts/generateDeploymentMetadata.ts를 먼저 실행했는지 확인하라. (원인: ${
          err instanceof Error ? err.message : String(err)
        })`,
    );
  }
  const parsed = JSON.parse(raw) as DeploymentMetadata;
  if (parsed.chainId !== chainId) {
    throw new Error(
      `배포 메타데이터의 chainId(${parsed.chainId})가 INDEXER_CHAIN_ID(${chainId})와 다르다.`,
    );
  }
  return parsed;
}

async function loadRepository(): Promise<{ repo: IndexerRepository; isRealPersistence: boolean }> {
  const modulePath = process.env.INDEXER_REPOSITORY_MODULE;
  if (!modulePath) {
    return { repo: new InMemoryIndexerRepository(), isRealPersistence: false };
  }
  const mod = (await import(modulePath)) as {
    default: () => IndexerRepository | Promise<IndexerRepository>;
  };
  if (typeof mod.default !== "function") {
    throw new Error(
      `INDEXER_REPOSITORY_MODULE(${modulePath})의 default export는 IndexerRepository 팩토리 함수여야 한다.`,
    );
  }
  const repo = await mod.default();
  return { repo, isRealPersistence: true };
}

function nowIso(): string {
  return new Date().toISOString();
}

async function main(): Promise<void> {
  const rpcUrl = process.env.INDEXER_RPC_URL;
  if (!rpcUrl) {
    throw new Error("환경변수 INDEXER_RPC_URL이 필요하다 (예: http://127.0.0.1:8545).");
  }
  const chainId = envInt("INDEXER_CHAIN_ID", 31337);
  const confirmations = BigInt(envInt("INDEXER_CONFIRMATIONS", 0));
  const maxBlockRange = BigInt(envInt("INDEXER_MAX_BLOCK_RANGE", 2000));
  const pollIntervalMs = envInt("INDEXER_POLL_INTERVAL_MS", 5000);

  const deployment = await loadDeploymentMetadata(chainId);
  const { repo, isRealPersistence } = await loadRepository();

  if (!isRealPersistence) {
    console.warn(
      `[chain-indexer] 경고: INDEXER_REPOSITORY_MODULE이 설정되지 않아 in-memory repository로 ` +
        `동작한다. 프로세스가 재시작되면 커서/이벤트/projection이 모두 소실된다. ` +
        `개발/시연 전용이며 운영 배포 전 반드시 03(DB 담당)의 실제 구현으로 교체해야 한다.`,
    );
  }

  const chain = new ChainRpcProvider({
    rpcUrl,
    chainId,
    contractAddress: deployment.address,
    deploymentBlockNumber: BigInt(deployment.deploymentBlockNumber),
    abi: deployment.abi,
  });
  await chain.assertChainId();

  const config: ChainIndexerConfig = {
    chainId,
    contractAddress: deployment.address,
    deploymentBlockNumber: BigInt(deployment.deploymentBlockNumber),
    confirmations,
    maxBlockRange,
  };
  const indexer = new ChainIndexer(chain, repo, config);

  let stopping = false;
  const requestStop = (signal: string) => {
    if (stopping) return;
    stopping = true;
    console.log(`[chain-indexer] ${signal} 수신 - 진행 중인 사이클을 마친 뒤 정지한다.`);
  };
  process.on("SIGINT", () => requestStop("SIGINT"));
  process.on("SIGTERM", () => requestStop("SIGTERM"));

  console.log(
    `[chain-indexer] 시작: chainId=${chainId} contract=${deployment.address} ` +
      `confirmations=${confirmations} maxBlockRange=${maxBlockRange} pollIntervalMs=${pollIntervalMs} ` +
      `persistence=${isRealPersistence ? "real" : "in-memory(dev-only)"}`,
  );

  while (!stopping) {
    const startedAt = Date.now();
    try {
      const outcome = await indexer.syncOnce();
      switch (outcome.status) {
        case "advanced":
          console.log(
            `[chain-indexer] ${nowIso()} advanced fromBlock=${outcome.fromBlock} toBlock=${outcome.toBlock} ` +
              `eventCount=${outcome.eventCount}`,
          );
          break;
        case "up_to_date":
          console.log(`[chain-indexer] ${nowIso()} up_to_date processedBlockNumber=${outcome.processedBlockNumber}`);
          break;
        case "reorg_recovered":
          console.warn(`[chain-indexer] ${nowIso()} reorg_recovered rolledBackTo=${outcome.rolledBackTo}`);
          break;
        case "rpc_unavailable":
          console.error(`[chain-indexer] ${nowIso()} rpc_unavailable: ${outcome.message}`);
          break;
      }
    } catch (err) {
      if (err instanceof DeepReorgError) {
        console.error(
          `[chain-indexer] ${nowIso()} DeepReorgError - 자동 복구 범위를 벗어났다. 루프를 멈춘다: ${err.message}`,
        );
        process.exitCode = 1;
        return;
      }
      console.error(`[chain-indexer] ${nowIso()} 예상하지 못한 오류 - 루프를 멈춘다.`, err);
      process.exitCode = 1;
      return;
    }

    if (stopping) break;
    const elapsed = Date.now() - startedAt;
    const waitMs = Math.max(0, pollIntervalMs - elapsed);
    await new Promise((r) => setTimeout(r, waitMs));
  }

  console.log(`[chain-indexer] ${nowIso()} 정지 완료.`);
}

const isDirectRun = (() => {
  const entry = process.argv[1];
  if (!entry) return false;
  try {
    return import.meta.url === new URL(`file://${resolve(entry)}`).href;
  } catch {
    return false;
  }
})();

if (isDirectRun) {
  main().catch((err) => {
    console.error("[chain-indexer] 기동 실패:", err);
    process.exitCode = 1;
  });
}

export { main };

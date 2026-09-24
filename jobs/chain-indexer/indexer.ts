/**
 * P3-06 이벤트 동기화 job의 핵심 로직. HTTP 요청 생명주기에 묶지 않는 별도 프로세스로
 * 주기 실행하는 것을 전제로 한다 (README "수집과 인덱서는 API 요청의 생명주기에 묶지
 * 않는다"). 이 파일은 순수 로직만 담고, 프로세스 진입점(주기 실행 루프/스케줄러)은
 * runLoop.ts에 둔다.
 */
import type { Address, Hex } from "viem";
import {
  DeepReorgError,
  type BlockRef,
  type IndexerChainReader,
  type IndexerCursor,
  type IndexerRepository,
} from "./ports.js";

export interface ChainIndexerConfig {
  chainId: number;
  contractAddress: Address;
  deploymentBlockNumber: bigint;
  /** 로컬 1, 공개 테스트넷은 선택한 체인 특성에 맞춰 확정 (03-onchain-system.md 6절). */
  confirmations: bigint;
  /** 한 번에 RPC로 요청할 최대 블록 범위. */
  maxBlockRange: bigint;
}

export type SyncOutcome =
  | { status: "up_to_date"; processedBlockNumber: bigint | null }
  | { status: "advanced"; fromBlock: bigint; toBlock: bigint; eventCount: number }
  | { status: "reorg_recovered"; rolledBackTo: bigint }
  | { status: "rpc_unavailable"; message: string };

export class ChainIndexer {
  constructor(
    private readonly chain: IndexerChainReader,
    private readonly repo: IndexerRepository,
    private readonly config: ChainIndexerConfig,
  ) {}

  /**
   * 한 번의 동기화 사이클. 재시작해도 같은 구간을 다시 읽을 수 있고(멱등), reorg를
   * 감지하면 공통 조상까지 되돌린 뒤 그 결과를 반환한다(다음 호출에서 정방향 진행).
   */
  async syncOnce(): Promise<SyncOutcome> {
    let latestBlockNumber: bigint;
    try {
      latestBlockNumber = await this.chain.getLatestBlockNumber();
    } catch (err) {
      return { status: "rpc_unavailable", message: this.#describeError(err) };
    }

    const confirmedTip = latestBlockNumber - this.config.confirmations;
    if (confirmedTip < this.config.deploymentBlockNumber) {
      return { status: "up_to_date", processedBlockNumber: null };
    }

    const cursor = await this.repo.getCursor(this.config.chainId, this.config.contractAddress);

    if (cursor) {
      const reorg = await this.#detectAndRecoverReorg(cursor);
      if (reorg) {
        return reorg;
      }
    }

    const freshCursor = await this.repo.getCursor(this.config.chainId, this.config.contractAddress);
    const fromBlock = freshCursor ? freshCursor.processedBlockNumber + 1n : this.config.deploymentBlockNumber;

    if (fromBlock > confirmedTip) {
      return { status: "up_to_date", processedBlockNumber: freshCursor?.processedBlockNumber ?? null };
    }

    const toBlock =
      confirmedTip - fromBlock + 1n > this.config.maxBlockRange
        ? fromBlock + this.config.maxBlockRange - 1n
        : confirmedTip;

    let logs: Awaited<ReturnType<IndexerChainReader["getStampClaimedLogs"]>>;
    const processedBlocks: BlockRef[] = [];
    try {
      logs = await this.chain.getStampClaimedLogs(fromBlock, toBlock);
      // reorg 감지를 위해 이번에 처리하는 구간의 모든 블록 해시를 수집한다. 이벤트가
      // 있는 블록은 로그의 blockHash를 재사용하고, 없는 블록만 별도 조회한다.
      const hashesFromLogs = new Map<bigint, Hex>();
      for (const log of logs) hashesFromLogs.set(log.blockNumber, log.blockHash);
      for (let n = fromBlock; n <= toBlock; n += 1n) {
        const cached = hashesFromLogs.get(n);
        if (cached) {
          processedBlocks.push({ number: n, hash: cached });
        } else {
          const block = await this.chain.getBlock(n);
          processedBlocks.push({ number: n, hash: block.hash });
        }
      }
    } catch (err) {
      return { status: "rpc_unavailable", message: this.#describeError(err) };
    }

    const tip = processedBlocks[processedBlocks.length - 1];
    const newCursor: IndexerCursor = {
      chainId: this.config.chainId,
      contractAddress: this.config.contractAddress,
      processedBlockNumber: tip.number,
      processedBlockHash: tip.hash,
    };

    await this.repo.applyCanonicalBatch({
      chainId: this.config.chainId,
      contractAddress: this.config.contractAddress,
      events: logs.map((log) => ({
        transactionHash: log.transactionHash,
        logIndex: log.logIndex,
        blockNumber: log.blockNumber,
        blockHash: log.blockHash,
        recipient: log.recipient,
        campaignId: log.campaignId,
        spotId: log.spotId,
        nonce: log.nonce.toString(),
      })),
      newCursor,
      processedBlocks,
    });

    return { status: "advanced", fromBlock, toBlock, eventCount: logs.length };
  }

  /**
   * 커서가 가리키는 블록의 해시가 현재 체인과 다르면 reorg다. 저장된 최근 블록해시 창을
   * 최신부터 훑어 현재 체인과 일치하는 첫 블록(공통 조상)을 찾아 그 지점까지 되돌린다.
   * 창 안에서 못 찾으면 DeepReorgError를 던져 동기화를 멈춘다(03-onchain-system.md 6절 6번).
   */
  async #detectAndRecoverReorg(cursor: IndexerCursor): Promise<SyncOutcome | null> {
    let liveBlock;
    try {
      liveBlock = await this.chain.getBlock(cursor.processedBlockNumber);
    } catch (err) {
      return { status: "rpc_unavailable", message: this.#describeError(err) };
    }

    if (liveBlock.hash === cursor.processedBlockHash) {
      return null; // reorg 없음
    }

    const window = await this.repo.getRecentBlockHashes(this.config.chainId, this.config.contractAddress);
    let commonAncestor: BlockRef | undefined;
    for (const candidate of window) {
      let liveCandidateBlock;
      try {
        liveCandidateBlock = await this.chain.getBlock(candidate.number);
      } catch (err) {
        return { status: "rpc_unavailable", message: this.#describeError(err) };
      }
      if (liveCandidateBlock.hash === candidate.hash) {
        commonAncestor = candidate;
        break;
      }
    }

    if (!commonAncestor) {
      // 저장된 최근 블록해시 창 안에서 현재 체인과 일치하는 블록을 찾지 못했다 - 창
      // 범위보다 깊은 재조직으로 판단해 자동 복구를 멈춘다.
      throw new DeepReorgError(window.length);
    }

    await this.repo.rollbackToBlock(this.config.chainId, this.config.contractAddress, commonAncestor);
    return { status: "reorg_recovered", rolledBackTo: commonAncestor.number };
  }

  #describeError(err: unknown): string {
    return err instanceof Error ? err.message : String(err);
  }
}

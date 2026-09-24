import { describe, expect, it } from "vitest";
import type { Address, Hex } from "viem";
import { ChainIndexer } from "../indexer.js";
import { InMemoryIndexerRepository } from "../testing/inMemoryIndexerRepository.js";
import { FakeIndexerChain } from "../testing/fakeIndexerChain.js";

const CHAIN_ID = 31337;
const CONTRACT: Address = "0x1111111111111111111111111111111111111111";
const RECIPIENT: Address = "0x2222222222222222222222222222222222222222";
const CAMPAIGN: Hex = `0x${"aa".repeat(32)}` as Hex;
const SPOT_A: Hex = `0x${"bb".repeat(32)}` as Hex;
const SPOT_B: Hex = `0x${"cc".repeat(32)}` as Hex;

function makeIndexer(chain: FakeIndexerChain, repo: InMemoryIndexerRepository, overrides: Partial<{ confirmations: bigint; maxBlockRange: bigint }> = {}) {
  return new ChainIndexer(chain, repo, {
    chainId: CHAIN_ID,
    contractAddress: CONTRACT,
    deploymentBlockNumber: 1n,
    confirmations: overrides.confirmations ?? 0n,
    maxBlockRange: overrides.maxBlockRange ?? 1000n,
  });
}

describe("ChainIndexer", () => {
  it("정상 이벤트를 읽어 projection과 커서를 전진시킨다", async () => {
    const chain = new FakeIndexerChain();
    chain.mineBlock(); // block 1: deployment
    chain.mineBlock([{ recipient: RECIPIENT, campaignId: CAMPAIGN, spotId: SPOT_A, nonce: 1n }]); // block 2

    const repo = new InMemoryIndexerRepository();
    const indexer = makeIndexer(chain, repo);

    const outcome = await indexer.syncOnce();
    expect(outcome.status).toBe("advanced");
    if (outcome.status === "advanced") {
      expect(outcome.eventCount).toBe(1);
    }

    const projection = await repo.getProjection(CHAIN_ID, CONTRACT, RECIPIENT, CAMPAIGN, SPOT_A);
    expect(projection?.blockNumber).toBe(2n);
  });

  it("재시작 후 같은 구간을 다시 읽어도 중복을 만들지 않는다", async () => {
    const chain = new FakeIndexerChain();
    chain.mineBlock();
    chain.mineBlock([{ recipient: RECIPIENT, campaignId: CAMPAIGN, spotId: SPOT_A, nonce: 1n }]);
    const repo = new InMemoryIndexerRepository();

    const indexerA = makeIndexer(chain, repo);
    await indexerA.syncOnce();

    // "재시작" - 완전히 새 인덱서 인스턴스가 같은 repo를 이어받는다.
    const indexerB = makeIndexer(chain, repo);
    const secondOutcome = await indexerB.syncOnce();
    expect(secondOutcome.status).toBe("up_to_date");

    const events = await repo.listCanonicalEvents(CHAIN_ID, CONTRACT);
    expect(events).toHaveLength(1); // 중복 수집 없음
  });

  it("confirmations 설정만큼의 최신 블록은 아직 처리하지 않는다", async () => {
    const chain = new FakeIndexerChain();
    chain.mineBlock(); // 1
    chain.mineBlock([{ recipient: RECIPIENT, campaignId: CAMPAIGN, spotId: SPOT_A, nonce: 1n }]); // 2
    const repo = new InMemoryIndexerRepository();
    const indexer = makeIndexer(chain, repo, { confirmations: 1n });

    const outcome = await indexer.syncOnce();
    // confirmedTip = latest(2) - confirmations(1) = 1 이므로 아직 block 1까지만 처리
    // 대상이다. 커서는 block 1까지 전진하지만 block 2의 이벤트는 이 사이클에 포함되지
    // 않는다.
    expect(outcome.status).toBe("advanced");
    expect(await repo.listCanonicalEvents(CHAIN_ID, CONTRACT)).toHaveLength(0);

    chain.mineBlock(); // 3 - 이제 block 2가 1 confirmation을 얻는다
    const outcome2 = await indexer.syncOnce();
    expect(outcome2.status).toBe("advanced");
    expect(await repo.listCanonicalEvents(CHAIN_ID, CONTRACT)).toHaveLength(1);
  });

  it("RPC 장애 시 예외를 던지지 않고 rpc_unavailable 상태를 반환한다", async () => {
    const chain = new FakeIndexerChain();
    chain.mineBlock();
    chain.setRpcDown(true);
    const repo = new InMemoryIndexerRepository();
    const indexer = makeIndexer(chain, repo);

    const outcome = await indexer.syncOnce();
    expect(outcome.status).toBe("rpc_unavailable");
  });

  it("로컬 블록 되돌림(reorg)을 감지하고 공통 조상으로 복구한 뒤 새 canonical 상태를 반영한다", async () => {
    const chain = new FakeIndexerChain();
    chain.mineBlock(); // 1: deployment
    chain.mineBlock([{ recipient: RECIPIENT, campaignId: CAMPAIGN, spotId: SPOT_A, nonce: 1n }]); // 2
    chain.mineBlock([{ recipient: RECIPIENT, campaignId: CAMPAIGN, spotId: SPOT_B, nonce: 2n }]); // 3 (orphan 예정)

    const repo = new InMemoryIndexerRepository();
    const indexer = makeIndexer(chain, repo);
    await indexer.syncOnce();

    expect(await repo.getProjection(CHAIN_ID, CONTRACT, RECIPIENT, CAMPAIGN, SPOT_B)).not.toBeNull();

    // block 2 이후를 되돌리고, 이번에는 SPOT_B claim이 아예 없는 다른 블록 3'를 채굴한다.
    chain.reorgAfter(2n);
    chain.mineBlock([]); // 새로운 block 3' - SPOT_B claim 없음

    const reorgOutcome = await indexer.syncOnce();
    expect(reorgOutcome.status).toBe("reorg_recovered");
    if (reorgOutcome.status === "reorg_recovered") {
      expect(reorgOutcome.rolledBackTo).toBe(2n);
    }

    // 되돌린 뒤 다음 호출에서 새 canonical 상태로 정방향 진행한다.
    const followUp = await indexer.syncOnce();
    expect(followUp.status === "advanced" || followUp.status === "up_to_date").toBe(true);

    // 이전 branch에서만 존재했던 SPOT_B projection은 사라져야 한다(취소).
    expect(await repo.getProjection(CHAIN_ID, CONTRACT, RECIPIENT, CAMPAIGN, SPOT_B)).toBeNull();
    // block 2의 SPOT_A claim은 두 branch에 공통이므로 여전히 유효해야 한다.
    expect(await repo.getProjection(CHAIN_ID, CONTRACT, RECIPIENT, CAMPAIGN, SPOT_A)).not.toBeNull();
  });
});

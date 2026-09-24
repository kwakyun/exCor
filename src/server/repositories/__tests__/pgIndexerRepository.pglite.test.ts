/**
 * P3-DB 실제 검증: PgIndexerRepository를 @electric-sql/pglite 위에서 실행해, upsert 기반
 * applyCanonicalBatch/reorg rollback을 진짜 UNIQUE 제약·transaction으로 확인한다.
 * agent_04 dependency_request STAMPS-DB-04 (jobs/chain-indexer/ports.ts IndexerRepository).
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { Address, Hex } from 'viem';
import { PgIndexerRepository } from '../pgIndexerRepository';
import { createPgliteTestClient, isPgliteAvailable, type PgliteTestClient } from '../testing/pgliteSqlClient';

const available = await isPgliteAvailable();

const CHAIN_ID = 84532;
const CONTRACT = '0x00000000000000000000000000000000000abc' as Address;
const RECIPIENT = '0x0000000000000000000000000000000000dead' as Address;
const CAMPAIGN = '0x01' as Hex;
const SPOT = '0x02' as Hex;

function blockHash(n: number): Hex {
  return `0x${n.toString(16).padStart(64, '0')}` as Hex;
}
function txHash(n: number): Hex {
  return `0x${n.toString(16).padStart(63, '0')}f` as Hex;
}

describe.skipIf(!available)('PgIndexerRepository (pglite 실제 DB)', () => {
  let client: PgliteTestClient;
  let repo: PgIndexerRepository;

  beforeEach(async () => {
    const created = await createPgliteTestClient();
    if (!created) throw new Error('pglite unexpectedly unavailable after availability check');
    client = created;
    repo = new PgIndexerRepository(client.sql);
  });

  afterEach(async () => {
    await client.close();
  });

  it('applyCanonicalBatch: 커서 전진 + projection 생성 + 최근 블록창 갱신', async () => {
    await repo.applyCanonicalBatch({
      chainId: CHAIN_ID,
      contractAddress: CONTRACT,
      events: [
        {
          transactionHash: txHash(1),
          logIndex: 0,
          blockNumber: 100n,
          blockHash: blockHash(100),
          recipient: RECIPIENT,
          campaignId: CAMPAIGN,
          spotId: SPOT,
          nonce: 'n1',
        },
      ],
      newCursor: {
        chainId: CHAIN_ID,
        contractAddress: CONTRACT,
        processedBlockNumber: 100n,
        processedBlockHash: blockHash(100),
      },
      processedBlocks: [{ number: 100n, hash: blockHash(100) }],
    });

    const cursor = await repo.getCursor(CHAIN_ID, CONTRACT);
    expect(cursor?.processedBlockNumber).toBe(100n);

    const projection = await repo.getProjection(CHAIN_ID, CONTRACT, RECIPIENT, CAMPAIGN, SPOT);
    expect(projection?.blockNumber).toBe(100n);
    expect(projection?.claimTransactionHash).toBe(txHash(1));

    const recent = await repo.getRecentBlockHashes(CHAIN_ID, CONTRACT);
    expect(recent).toEqual([{ number: 100n, hash: blockHash(100) }]);

    const events = await repo.listCanonicalEvents(CHAIN_ID, CONTRACT);
    expect(events).toHaveLength(1);
    expect(events[0].canonical).toBe(true);
  });

  it('applyCanonicalBatch: 같은 (txHash,logIndex) 재수집해도 중복 행이 생기지 않는다 (upsert)', async () => {
    const evt = {
      transactionHash: txHash(1),
      logIndex: 0,
      blockNumber: 100n,
      blockHash: blockHash(100),
      recipient: RECIPIENT,
      campaignId: CAMPAIGN,
      spotId: SPOT,
      nonce: 'n1',
    };
    const cursor = {
      chainId: CHAIN_ID,
      contractAddress: CONTRACT,
      processedBlockNumber: 100n,
      processedBlockHash: blockHash(100),
    };
    await repo.applyCanonicalBatch({
      chainId: CHAIN_ID,
      contractAddress: CONTRACT,
      events: [evt],
      newCursor: cursor,
      processedBlocks: [{ number: 100n, hash: blockHash(100) }],
    });
    // 동일 구간 재수집 (예: 재시도)
    await repo.applyCanonicalBatch({
      chainId: CHAIN_ID,
      contractAddress: CONTRACT,
      events: [evt],
      newCursor: cursor,
      processedBlocks: [{ number: 100n, hash: blockHash(100) }],
    });

    const events = await repo.listCanonicalEvents(CHAIN_ID, CONTRACT);
    expect(events).toHaveLength(1);
  });

  it('rollbackToBlock: 공통 조상 이후 이벤트는 canonical=false, projection은 남은 이벤트로 재계산', async () => {
    // block 100: 최초 claim. block 200: reorg로 사라질 더 최신 claim(같은 projection 키).
    await repo.applyCanonicalBatch({
      chainId: CHAIN_ID,
      contractAddress: CONTRACT,
      events: [
        {
          transactionHash: txHash(1),
          logIndex: 0,
          blockNumber: 100n,
          blockHash: blockHash(100),
          recipient: RECIPIENT,
          campaignId: CAMPAIGN,
          spotId: SPOT,
          nonce: 'n1',
        },
      ],
      newCursor: {
        chainId: CHAIN_ID,
        contractAddress: CONTRACT,
        processedBlockNumber: 100n,
        processedBlockHash: blockHash(100),
      },
      processedBlocks: [{ number: 100n, hash: blockHash(100) }],
    });

    await repo.applyCanonicalBatch({
      chainId: CHAIN_ID,
      contractAddress: CONTRACT,
      events: [
        {
          transactionHash: txHash(2),
          logIndex: 0,
          blockNumber: 200n,
          blockHash: blockHash(200),
          recipient: RECIPIENT,
          campaignId: CAMPAIGN,
          spotId: SPOT,
          nonce: 'n2',
        },
      ],
      newCursor: {
        chainId: CHAIN_ID,
        contractAddress: CONTRACT,
        processedBlockNumber: 200n,
        processedBlockHash: blockHash(200),
      },
      processedBlocks: [{ number: 200n, hash: blockHash(200) }],
    });

    let projection = await repo.getProjection(CHAIN_ID, CONTRACT, RECIPIENT, CAMPAIGN, SPOT);
    expect(projection?.blockNumber).toBe(200n);

    // reorg: block 100을 공통 조상으로 롤백 -> block 200 이벤트는 non-canonical, projection은 block 100으로 복원
    await repo.rollbackToBlock(CHAIN_ID, CONTRACT, { number: 100n, hash: blockHash(100) });

    const events = await repo.listCanonicalEvents(CHAIN_ID, CONTRACT);
    expect(events).toHaveLength(1);
    expect(events[0].blockNumber).toBe(100n);

    projection = await repo.getProjection(CHAIN_ID, CONTRACT, RECIPIENT, CAMPAIGN, SPOT);
    expect(projection?.blockNumber).toBe(100n);
    expect(projection?.claimTransactionHash).toBe(txHash(1));

    const cursor = await repo.getCursor(CHAIN_ID, CONTRACT);
    expect(cursor?.processedBlockNumber).toBe(100n);

    const recent = await repo.getRecentBlockHashes(CHAIN_ID, CONTRACT);
    expect(recent.every((b) => b.number <= 100n)).toBe(true);
  });

  it('rollbackToBlock: 대체할 canonical 이벤트가 없으면 projection을 제거한다', async () => {
    // 공통 조상(block 50) 이후에만 존재하는 유일한 claim -> 롤백 시 projection이 사라져야 함
    await repo.applyCanonicalBatch({
      chainId: CHAIN_ID,
      contractAddress: CONTRACT,
      events: [
        {
          transactionHash: txHash(3),
          logIndex: 0,
          blockNumber: 60n,
          blockHash: blockHash(60),
          recipient: RECIPIENT,
          campaignId: CAMPAIGN,
          spotId: SPOT,
          nonce: 'n3',
        },
      ],
      newCursor: {
        chainId: CHAIN_ID,
        contractAddress: CONTRACT,
        processedBlockNumber: 60n,
        processedBlockHash: blockHash(60),
      },
      processedBlocks: [
        { number: 50n, hash: blockHash(50) },
        { number: 60n, hash: blockHash(60) },
      ],
    });

    await repo.rollbackToBlock(CHAIN_ID, CONTRACT, { number: 50n, hash: blockHash(50) });

    const projection = await repo.getProjection(CHAIN_ID, CONTRACT, RECIPIENT, CAMPAIGN, SPOT);
    expect(projection).toBeNull();

    const events = await repo.listCanonicalEvents(CHAIN_ID, CONTRACT);
    expect(events).toHaveLength(0);
  });
});

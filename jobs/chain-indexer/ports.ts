/**
 * P3-06 이벤트 동기화가 의존하는 repository/체인 판독 포트.
 *
 * 03에게 요구하는 실제 DB 계약 (db/migrations: chain_events, stamp_projections,
 * indexer_cursors - docs/architecture/implementation/03-onchain-system.md 5절).
 * ./testing/inMemoryIndexerRepository.ts는 테스트 전용 대체 구현이다.
 */
import type { Address, Hex } from "viem";

export interface IndexerCursor {
  chainId: number;
  contractAddress: Address;
  processedBlockNumber: bigint;
  processedBlockHash: Hex;
}

export interface ChainEventInput {
  transactionHash: Hex;
  logIndex: number;
  blockNumber: bigint;
  blockHash: Hex;
  recipient: Address;
  campaignId: Hex;
  spotId: Hex;
  nonce: string;
}

export interface ChainEventRecord extends ChainEventInput {
  chainId: number;
  contractAddress: Address;
  canonical: boolean;
}

export interface StampProjectionRecord {
  chainId: number;
  contractAddress: Address;
  recipient: Address;
  campaignId: Hex;
  spotId: Hex;
  claimTransactionHash: Hex;
  blockNumber: bigint;
}

export interface BlockRef {
  number: bigint;
  hash: Hex;
}

/**
 * P3-06 인덱서 repository 계약.
 *
 * - applyCanonicalBatch: 이벤트 저장 + projection 갱신 + 커서 전진 + 최근 블록해시 창
 *   갱신을 하나의 원자적 연산으로 수행한다 (03-onchain-system.md 6절: "이벤트 저장·
 *   projection 갱신·커서 전진을 하나의 DB transaction에서 수행한다"). 같은 구간을
 *   재수집해도 (chainId,contract,txHash,logIndex) UNIQUE + upsert로 중복이 생기지
 *   않아야 한다.
 * - rollbackToBlock: reorg 감지 시 공통 조상 블록 이후의 이벤트를 canonical=false로
 *   표시하고 해당 이벤트가 만든 projection을 재계산(취소)한 뒤 커서를 되돌린다.
 */
export interface IndexerRepository {
  getCursor(chainId: number, contractAddress: Address): Promise<IndexerCursor | null>;

  /** 최근 처리한 블록 해시 창(reorg 감지용). 최신 순서로 반환한다. */
  getRecentBlockHashes(chainId: number, contractAddress: Address): Promise<BlockRef[]>;

  applyCanonicalBatch(input: {
    chainId: number;
    contractAddress: Address;
    events: ChainEventInput[];
    newCursor: IndexerCursor;
    /**
     * 이번 배치가 처리한 구간(fromBlock..toBlock)의 블록 해시 전체. reorg 감지 시 공통
     * 조상을 찾는 "최근 재조회 창"으로 누적 저장된다 (커서 tip 하나만으로는 조상을
     * 찾을 수 없다).
     */
    processedBlocks: BlockRef[];
  }): Promise<void>;

  rollbackToBlock(
    chainId: number,
    contractAddress: Address,
    commonAncestor: BlockRef,
  ): Promise<void>;

  getProjection(
    chainId: number,
    contractAddress: Address,
    recipient: Address,
    campaignId: Hex,
    spotId: Hex,
  ): Promise<StampProjectionRecord | null>;

  listCanonicalEvents(chainId: number, contractAddress: Address): Promise<ChainEventRecord[]>;
}

/**
 * indexer.ts가 의존하는 좁은 체인 판독 인터페이스. src/server/providers/rpc/chainClient.ts의
 * ChainRpcProvider가 이 인터페이스를 만족한다(중복 구현하지 않고 재사용한다).
 */
export interface IndexerChainReader {
  getLatestBlockNumber(): Promise<bigint>;
  getBlock(blockNumber: bigint): Promise<{ hash: Hex; timestamp: bigint }>;
  getStampClaimedLogs(fromBlock: bigint, toBlock: bigint): Promise<
    Array<{
      recipient: Address;
      campaignId: Hex;
      spotId: Hex;
      nonce: bigint;
      blockNumber: bigint;
      blockHash: Hex;
      transactionHash: Hex;
      logIndex: number;
    }>
  >;
}

export class DeepReorgError extends Error {
  constructor(windowSize: number) {
    super(
      `최근 ${windowSize}블록 창 안에서 공통 조상을 찾지 못했다. 더 깊은 재조직으로 판단해 ` +
        `동기화를 멈춘다. deployment_block부터 재구축 도구로 복구해야 한다 ` +
        `(03-onchain-system.md 6절 6번).`,
    );
    this.name = "DeepReorgError";
  }
}

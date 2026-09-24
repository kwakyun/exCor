/**
 * P3-DB: IndexerRepository의 PostgreSQL(호환) 구현.
 * 계약: jobs/chain-indexer/ports.ts (04 작성, agent_04 dependency_request STAMPS-DB-04).
 * 참조 동작: jobs/chain-indexer/testing/inMemoryIndexerRepository.ts와 동일한 의미를
 * 실제 UNIQUE 제약(PRIMARY KEY)/transaction/UPSERT로 재현한다
 * ("메모리 fake는 영속성 통과 증거가 아니다").
 * SQL 실행은 db/migrations/0031_chain_indexer.sql이 만든 테이블을 전제로 한다.
 *
 * 알려진 편차(in-memory 대비): 이 구현은 contract_address/recipient를 저장·조회 시
 * 항상 소문자로 정규화한다 (in-memory의 key()/projectionKey()가 대소문자를 무시하고
 * 매칭하는 것과 동일한 효과를 얻기 위함이며, 0031 migration에는 LOWER() 기반 UNIQUE
 * 인덱스를 별도로 걸지 않았기 때문). 따라서 getCursor 등이 반환하는 Address 값은 항상
 * 소문자 표기이며, 호출자가 checksum 표기를 그대로 돌려받는 것은 보장하지 않는다.
 * applyCanonicalBatch의 projection 갱신은 in-memory와 동일하게 "배치 내 이벤트 처리
 * 순서상 마지막 값으로 무조건 덮어쓰기"이며 블록 번호 비교를 하지 않는다(호출자가 항상
 * 오름차순 블록 구간을 배치로 넘긴다는 전제는 in-memory와 동일).
 */
import type { Address, Hex } from 'viem';
import type {
  BlockRef,
  ChainEventInput,
  ChainEventRecord,
  IndexerCursor,
  IndexerRepository,
  StampProjectionRecord,
} from '../../../jobs/chain-indexer/ports';
import type { SqlClient } from '../storage/sqlClient';

const RECENT_BLOCK_WINDOW = 256;

function lc(addr: Address): string {
  return addr.toLowerCase();
}

interface IndexerCursorRow {
  chain_id: string | number;
  contract_address: string;
  processed_block_number: string;
  processed_block_hash: string;
}
function toCursor(row: IndexerCursorRow): IndexerCursor {
  return {
    chainId: Number(row.chain_id),
    contractAddress: row.contract_address as Address,
    processedBlockNumber: BigInt(row.processed_block_number),
    processedBlockHash: row.processed_block_hash as Hex,
  };
}

interface RecentBlockRow {
  block_number: string;
  block_hash: string;
}
function toBlockRef(row: RecentBlockRow): BlockRef {
  return { number: BigInt(row.block_number), hash: row.block_hash as Hex };
}

interface ChainEventRow {
  chain_id: string | number;
  contract_address: string;
  transaction_hash: string;
  log_index: number;
  block_number: string;
  block_hash: string;
  recipient: string;
  campaign_id: string;
  spot_id: string;
  nonce: string;
  canonical: boolean;
}
function toChainEvent(row: ChainEventRow): ChainEventRecord {
  return {
    chainId: Number(row.chain_id),
    contractAddress: row.contract_address as Address,
    transactionHash: row.transaction_hash as Hex,
    logIndex: Number(row.log_index),
    blockNumber: BigInt(row.block_number),
    blockHash: row.block_hash as Hex,
    recipient: row.recipient as Address,
    campaignId: row.campaign_id as Hex,
    spotId: row.spot_id as Hex,
    nonce: row.nonce,
    canonical: row.canonical,
  };
}

interface StampProjectionRow {
  chain_id: string | number;
  contract_address: string;
  recipient: string;
  campaign_id: string;
  spot_id: string;
  claim_transaction_hash: string;
  block_number: string;
}
function toProjection(row: StampProjectionRow): StampProjectionRecord {
  return {
    chainId: Number(row.chain_id),
    contractAddress: row.contract_address as Address,
    recipient: row.recipient as Address,
    campaignId: row.campaign_id as Hex,
    spotId: row.spot_id as Hex,
    claimTransactionHash: row.claim_transaction_hash as Hex,
    blockNumber: BigInt(row.block_number),
  };
}

export class PgIndexerRepository implements IndexerRepository {
  constructor(private readonly sql: SqlClient) {}

  async getCursor(chainId: number, contractAddress: Address): Promise<IndexerCursor | null> {
    const { rows } = await this.sql.query<IndexerCursorRow>(
      `SELECT * FROM indexer_cursors WHERE chain_id = $1 AND contract_address = $2`,
      [chainId, lc(contractAddress)]
    );
    return rows[0] ? toCursor(rows[0]) : null;
  }

  async getRecentBlockHashes(chainId: number, contractAddress: Address): Promise<BlockRef[]> {
    const { rows } = await this.sql.query<RecentBlockRow>(
      `SELECT block_number, block_hash FROM indexer_recent_blocks
       WHERE chain_id = $1 AND contract_address = $2
       ORDER BY block_number DESC`,
      [chainId, lc(contractAddress)]
    );
    return rows.map(toBlockRef);
  }

  async applyCanonicalBatch(input: {
    chainId: number;
    contractAddress: Address;
    events: ChainEventInput[];
    newCursor: IndexerCursor;
    processedBlocks: BlockRef[];
  }): Promise<void> {
    const contractAddress = lc(input.contractAddress);
    await this.sql.withTransaction(async (tx) => {
      for (const evt of input.events) {
        await tx.query(
          `INSERT INTO chain_events
             (chain_id, contract_address, transaction_hash, log_index, block_number, block_hash,
              recipient, campaign_id, spot_id, nonce, canonical)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,TRUE)
           ON CONFLICT (chain_id, contract_address, transaction_hash, log_index)
           DO UPDATE SET
             block_number = EXCLUDED.block_number,
             block_hash = EXCLUDED.block_hash,
             recipient = EXCLUDED.recipient,
             campaign_id = EXCLUDED.campaign_id,
             spot_id = EXCLUDED.spot_id,
             nonce = EXCLUDED.nonce,
             canonical = TRUE`,
          [
            input.chainId,
            contractAddress,
            evt.transactionHash,
            evt.logIndex,
            evt.blockNumber.toString(),
            evt.blockHash,
            lc(evt.recipient),
            evt.campaignId,
            evt.spotId,
            evt.nonce,
          ]
        );

        await tx.query(
          `INSERT INTO stamp_projections
             (chain_id, contract_address, recipient, campaign_id, spot_id, claim_transaction_hash, block_number)
           VALUES ($1,$2,$3,$4,$5,$6,$7)
           ON CONFLICT (chain_id, contract_address, recipient, campaign_id, spot_id)
           DO UPDATE SET
             claim_transaction_hash = EXCLUDED.claim_transaction_hash,
             block_number = EXCLUDED.block_number`,
          [
            input.chainId,
            contractAddress,
            lc(evt.recipient),
            evt.campaignId,
            evt.spotId,
            evt.transactionHash,
            evt.blockNumber.toString(),
          ]
        );
      }

      await tx.query(
        `INSERT INTO indexer_cursors (chain_id, contract_address, processed_block_number, processed_block_hash)
         VALUES ($1,$2,$3,$4)
         ON CONFLICT (chain_id, contract_address)
         DO UPDATE SET processed_block_number = EXCLUDED.processed_block_number,
                        processed_block_hash = EXCLUDED.processed_block_hash`,
        [
          input.chainId,
          contractAddress,
          input.newCursor.processedBlockNumber.toString(),
          input.newCursor.processedBlockHash,
        ]
      );

      for (const block of input.processedBlocks) {
        await tx.query(
          `INSERT INTO indexer_recent_blocks (chain_id, contract_address, block_number, block_hash)
           VALUES ($1,$2,$3,$4)
           ON CONFLICT (chain_id, contract_address, block_number)
           DO UPDATE SET block_hash = EXCLUDED.block_hash`,
          [input.chainId, contractAddress, block.number.toString(), block.hash]
        );
      }

      // 최근 블록해시 창을 RECENT_BLOCK_WINDOW개로 유지 (in-memory와 동일한 트리밍 정책).
      await tx.query(
        `DELETE FROM indexer_recent_blocks
         WHERE chain_id = $1 AND contract_address = $2
           AND block_number NOT IN (
             SELECT block_number FROM indexer_recent_blocks
             WHERE chain_id = $1 AND contract_address = $2
             ORDER BY block_number DESC
             LIMIT $3
           )`,
        [input.chainId, contractAddress, RECENT_BLOCK_WINDOW]
      );
    });
  }

  async rollbackToBlock(
    chainId: number,
    contractAddress: Address,
    commonAncestor: BlockRef
  ): Promise<void> {
    const addr = lc(contractAddress);
    await this.sql.withTransaction(async (tx) => {
      await tx.query(
        `UPDATE chain_events SET canonical = FALSE
         WHERE chain_id = $1 AND contract_address = $2 AND block_number > $3 AND canonical = TRUE`,
        [chainId, addr, commonAncestor.number.toString()]
      );

      // 무효화된 이벤트가 만든 projection 재계산: 각 (recipient,campaign,spot)마다 남아있는
      // canonical 이벤트 중 가장 높은 block_number를 최신값으로 채택한다.
      await tx.query(
        `UPDATE stamp_projections sp
         SET claim_transaction_hash = r.transaction_hash, block_number = r.block_number
         FROM (
           SELECT DISTINCT ON (recipient, campaign_id, spot_id)
             recipient, campaign_id, spot_id, transaction_hash, block_number
           FROM chain_events
           WHERE chain_id = $1 AND contract_address = $2 AND canonical = TRUE
           ORDER BY recipient, campaign_id, spot_id, block_number DESC
         ) r
         WHERE sp.chain_id = $1 AND sp.contract_address = $2
           AND sp.recipient = r.recipient AND sp.campaign_id = r.campaign_id AND sp.spot_id = r.spot_id`,
        [chainId, addr]
      );

      // 대체할 canonical 이벤트가 전혀 남지 않은 projection은 제거한다.
      await tx.query(
        `DELETE FROM stamp_projections sp
         WHERE sp.chain_id = $1 AND sp.contract_address = $2
           AND NOT EXISTS (
             SELECT 1 FROM chain_events ce
             WHERE ce.chain_id = $1 AND ce.contract_address = $2 AND ce.canonical = TRUE
               AND ce.recipient = sp.recipient AND ce.campaign_id = sp.campaign_id AND ce.spot_id = sp.spot_id
           )`,
        [chainId, addr]
      );

      await tx.query(
        `INSERT INTO indexer_cursors (chain_id, contract_address, processed_block_number, processed_block_hash)
         VALUES ($1,$2,$3,$4)
         ON CONFLICT (chain_id, contract_address)
         DO UPDATE SET processed_block_number = EXCLUDED.processed_block_number,
                        processed_block_hash = EXCLUDED.processed_block_hash`,
        [chainId, addr, commonAncestor.number.toString(), commonAncestor.hash]
      );

      await tx.query(
        `DELETE FROM indexer_recent_blocks
         WHERE chain_id = $1 AND contract_address = $2 AND block_number > $3`,
        [chainId, addr, commonAncestor.number.toString()]
      );
    });
  }

  async getProjection(
    chainId: number,
    contractAddress: Address,
    recipient: Address,
    campaignId: Hex,
    spotId: Hex
  ): Promise<StampProjectionRecord | null> {
    const { rows } = await this.sql.query<StampProjectionRow>(
      `SELECT * FROM stamp_projections
       WHERE chain_id = $1 AND contract_address = $2 AND recipient = $3 AND campaign_id = $4 AND spot_id = $5`,
      [chainId, lc(contractAddress), lc(recipient), campaignId, spotId]
    );
    return rows[0] ? toProjection(rows[0]) : null;
  }

  async listCanonicalEvents(chainId: number, contractAddress: Address): Promise<ChainEventRecord[]> {
    const { rows } = await this.sql.query<ChainEventRow>(
      `SELECT * FROM chain_events WHERE chain_id = $1 AND contract_address = $2 AND canonical = TRUE`,
      [chainId, lc(contractAddress)]
    );
    return rows.map(toChainEvent);
  }
}

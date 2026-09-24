/**
 * P3-DB: StampsRepository의 PostgreSQL(호환) 구현.
 * 계약: src/server/application/stamps/ports.ts (04 작성, agent_04 P3-01/P3-04 handoff).
 * 참조 동작: src/server/application/stamps/testing/inMemoryStampsRepository.ts와 동일한
 * 의미를 실제 UNIQUE 제약/transaction으로 재현한다("메모리 fake는 영속성 통과 증거가 아니다").
 * SQL 실행은 db/migrations/0030_stamps_core.sql이 만든 테이블을 전제로 한다.
 */
import type { Address, Hex } from 'viem';
import type {
  CreateAuthorizationInput,
  CreateAuthorizationResult,
  CreateVisitRequestInput,
  StampAuthorizationRecord,
  StampsRepository,
  VisitRequestRecord,
  WalletChallengeRecord,
  WalletSessionRecord,
} from '../application/stamps/ports';
import type { SqlClient } from '../storage/sqlClient';
import { isUniqueViolation } from '../storage/sqlClient';
import { randomUUID } from 'node:crypto';

function nextId(prefix: string): string {
  return `${prefix}_${randomUUID()}`;
}

interface WalletChallengeRow {
  id: string;
  address: string;
  nonce: string;
  message: string;
  expires_at: string | number;
  consumed_at: string | number | null;
}
function toWalletChallenge(row: WalletChallengeRow): WalletChallengeRecord {
  return {
    id: row.id,
    address: row.address as Address,
    nonce: row.nonce,
    message: row.message,
    expiresAt: Number(row.expires_at),
    consumedAt: row.consumed_at === null ? null : Number(row.consumed_at),
  };
}

interface WalletSessionRow {
  id: string;
  address: string;
  expires_at: string | number;
}
function toWalletSession(row: WalletSessionRow): WalletSessionRecord {
  return { id: row.id, address: row.address as Address, expiresAt: Number(row.expires_at) };
}

interface VisitRequestRow {
  id: string;
  wallet: string;
  campaign_namespace: string;
  canonical_spot_id: string;
  state: string;
  expires_at: string | number;
  verifier_id: string | null;
  approved_at: string | number | null;
  created_at: string | number;
}
function toVisitRequest(row: VisitRequestRow): VisitRequestRecord {
  return {
    id: row.id,
    wallet: row.wallet as Address,
    campaignNamespace: row.campaign_namespace,
    canonicalSpotId: row.canonical_spot_id,
    state: row.state as VisitRequestRecord['state'],
    expiresAt: Number(row.expires_at),
    verifierId: row.verifier_id,
    approvedAt: row.approved_at === null ? null : Number(row.approved_at),
    createdAt: Number(row.created_at),
  };
}

interface StampAuthorizationRow {
  id: string;
  visit_id: string;
  recipient: string;
  chain_id: string | number;
  contract_address: string;
  campaign_id: string;
  spot_id: string;
  nonce: string;
  deadline: string;
  request_body_hash: string;
  signature: string;
  idempotency_scope: string;
  idempotency_key: string;
  state: string;
  created_at: string | number;
}
function toAuthorization(row: StampAuthorizationRow): StampAuthorizationRecord {
  return {
    id: row.id,
    visitId: row.visit_id,
    recipient: row.recipient as Address,
    chainId: Number(row.chain_id),
    contractAddress: row.contract_address as Address,
    campaignId: row.campaign_id as Hex,
    spotId: row.spot_id as Hex,
    nonce: row.nonce,
    deadline: row.deadline,
    requestBodyHash: row.request_body_hash as Hex,
    signature: row.signature as Hex,
    idempotencyScope: row.idempotency_scope,
    idempotencyKey: row.idempotency_key,
    state: row.state as StampAuthorizationRecord['state'],
    createdAt: Number(row.created_at),
  };
}

export class PgStampsRepository implements StampsRepository {
  constructor(private readonly sql: SqlClient) {}

  async createWalletChallenge(input: {
    address: Address;
    nonce: string;
    message: string;
    expiresAt: number;
  }): Promise<WalletChallengeRecord> {
    const id = nextId('wc');
    const { rows } = await this.sql.query<WalletChallengeRow>(
      `INSERT INTO wallet_challenges (id, address, nonce, message, expires_at, consumed_at)
       VALUES ($1, $2, $3, $4, $5, NULL) RETURNING *`,
      [id, input.address, input.nonce, input.message, input.expiresAt]
    );
    return toWalletChallenge(rows[0]);
  }

  async consumeWalletChallenge(id: string): Promise<WalletChallengeRecord | null> {
    // 원자적 1회 소비: consumed_at IS NULL일 때만 갱신. 행이 갱신되지 않으면(이미 소비/미존재) null.
    const { rows } = await this.sql.query<WalletChallengeRow>(
      `UPDATE wallet_challenges SET consumed_at = $2
       WHERE id = $1 AND consumed_at IS NULL RETURNING *`,
      [id, Math.floor(Date.now() / 1000)]
    );
    return rows[0] ? toWalletChallenge(rows[0]) : null;
  }

  async createWalletSession(input: { address: Address; expiresAt: number }): Promise<WalletSessionRecord> {
    const id = nextId('ws');
    const { rows } = await this.sql.query<WalletSessionRow>(
      `INSERT INTO wallet_sessions (id, address, expires_at) VALUES ($1, $2, $3) RETURNING *`,
      [id, input.address, input.expiresAt]
    );
    return toWalletSession(rows[0]);
  }

  async getWalletSession(id: string): Promise<WalletSessionRecord | null> {
    const { rows } = await this.sql.query<WalletSessionRow>(
      `SELECT * FROM wallet_sessions WHERE id = $1`,
      [id]
    );
    return rows[0] ? toWalletSession(rows[0]) : null;
  }

  async createVisitRequest(input: CreateVisitRequestInput): Promise<VisitRequestRecord> {
    const id = nextId('visit');
    const createdAt = Math.floor(Date.now() / 1000);
    const { rows } = await this.sql.query<VisitRequestRow>(
      `INSERT INTO visit_requests
         (id, wallet, campaign_namespace, canonical_spot_id, state, expires_at, verifier_id, approved_at, created_at)
       VALUES ($1, $2, $3, $4, 'requested', $5, NULL, NULL, $6) RETURNING *`,
      [id, input.wallet, input.campaignNamespace, input.canonicalSpotId, input.expiresAt, createdAt]
    );
    return toVisitRequest(rows[0]);
  }

  async getVisitRequest(id: string): Promise<VisitRequestRecord | null> {
    const { rows } = await this.sql.query<VisitRequestRow>(
      `SELECT * FROM visit_requests WHERE id = $1`,
      [id]
    );
    return rows[0] ? toVisitRequest(rows[0]) : null;
  }

  async approveVisitRequest(id: string, verifierId: string): Promise<VisitRequestRecord | null> {
    // 'requested' 상태에서만 성공 - 이미 처리된 행은 영향받지 않아 rows가 비고 null을 반환한다.
    const { rows } = await this.sql.query<VisitRequestRow>(
      `UPDATE visit_requests SET state = 'approved', verifier_id = $2, approved_at = $3
       WHERE id = $1 AND state = 'requested' RETURNING *`,
      [id, verifierId, Math.floor(Date.now() / 1000)]
    );
    return rows[0] ? toVisitRequest(rows[0]) : null;
  }

  async findAuthorizationByIdempotencyKey(
    scope: string,
    key: string
  ): Promise<StampAuthorizationRecord | null> {
    const { rows } = await this.sql.query<StampAuthorizationRow>(
      `SELECT * FROM stamp_authorizations WHERE idempotency_scope = $1 AND idempotency_key = $2`,
      [scope, key]
    );
    return rows[0] ? toAuthorization(rows[0]) : null;
  }

  async createAuthorizationIdempotent(input: CreateAuthorizationInput): Promise<CreateAuthorizationResult> {
    // 선행 조회 후 INSERT하지만, 동시 요청 레이스는 DB UNIQUE 제약이 최종 방어선이다
    // (existing repository.md 계약: "동시 요청이 먼저 커밋되면 안전하게 conflict로 보고").
    const existing = await this.findAuthorizationByIdempotencyKey(input.idempotencyScope, input.idempotencyKey);
    if (existing) {
      if (existing.requestBodyHash !== input.requestBodyHash) {
        return { kind: 'conflict' };
      }
      return { kind: 'replayed', record: existing };
    }

    const id = nextId('auth');
    const createdAt = Math.floor(Date.now() / 1000);
    try {
      const { rows } = await this.sql.query<StampAuthorizationRow>(
        `INSERT INTO stamp_authorizations
           (id, visit_id, recipient, chain_id, contract_address, campaign_id, spot_id,
            nonce, deadline, request_body_hash, signature, idempotency_scope, idempotency_key,
            state, created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,'issued',$14)
         RETURNING *`,
        [
          id,
          input.visitId,
          input.recipient,
          input.chainId,
          input.contractAddress,
          input.campaignId,
          input.spotId,
          input.nonce,
          input.deadline,
          input.requestBodyHash,
          input.signature,
          input.idempotencyScope,
          input.idempotencyKey,
          createdAt,
        ]
      );
      return { kind: 'created', record: toAuthorization(rows[0]) };
    } catch (err) {
      if (isUniqueViolation(err)) {
        // 두 가지 경우: (a) idempotency_scope+key 레이스 -> 방금 커밋된 레코드를 재조회해 replayed/conflict.
        //             (b) recipient+nonce UNIQUE 위반 -> nonce 재사용, conflict.
        const raced = await this.findAuthorizationByIdempotencyKey(input.idempotencyScope, input.idempotencyKey);
        if (raced) {
          return raced.requestBodyHash === input.requestBodyHash
            ? { kind: 'replayed', record: raced }
            : { kind: 'conflict' };
        }
        return { kind: 'conflict' };
      }
      throw err;
    }
  }
}

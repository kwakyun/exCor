/**
 * 테스트 전용 in-memory StampsRepository 구현.
 *
 * 경고: 이 구현은 프로세스 재시작 시 모든 상태를 잃고, 여러 프로세스 간 공유되지 않으며,
 * DB UNIQUE 제약과 동등한 동시성 보장을 제공하지 않는다 (단일 이벤트 루프의 동기 Map
 * 연산에 기대는 근사치일 뿐이다). "메모리 fake는 영속성 통과 증거가 아니다" (api-v1.md).
 * P3-DB(03)의 PostgreSQL 구현이 accepted 되기 전까지 단위 테스트에만 사용한다.
 */
import type {
  CreateAuthorizationInput,
  CreateAuthorizationResult,
  CreateVisitRequestInput,
  StampAuthorizationRecord,
  StampsRepository,
  VisitRequestRecord,
  WalletChallengeRecord,
  WalletSessionRecord,
} from "../ports.js";
import type { Address } from "viem";

let idCounter = 0;
function nextId(prefix: string): string {
  idCounter += 1;
  return `${prefix}_${idCounter}_${Math.random().toString(36).slice(2, 8)}`;
}

export class InMemoryStampsRepository implements StampsRepository {
  #walletChallenges = new Map<string, WalletChallengeRecord>();
  #walletSessions = new Map<string, WalletSessionRecord>();
  #visitRequests = new Map<string, VisitRequestRecord>();
  #authorizationsById = new Map<string, StampAuthorizationRecord>();
  #authorizationsByIdemKey = new Map<string, string>(); // `${scope}:${key}` -> authorization id
  #usedNonces = new Set<string>(); // `${recipient}:${nonce}`

  async createWalletChallenge(input: {
    address: Address;
    nonce: string;
    message: string;
    expiresAt: number;
  }): Promise<WalletChallengeRecord> {
    const record: WalletChallengeRecord = {
      id: nextId("wc"),
      address: input.address,
      nonce: input.nonce,
      message: input.message,
      expiresAt: input.expiresAt,
      consumedAt: null,
    };
    this.#walletChallenges.set(record.id, record);
    return record;
  }

  async consumeWalletChallenge(id: string): Promise<WalletChallengeRecord | null> {
    const record = this.#walletChallenges.get(id);
    if (!record) return null;
    if (record.consumedAt !== null) return null; // 이미 소비됨 - 원자적 1회 소비
    const consumed: WalletChallengeRecord = { ...record, consumedAt: Math.floor(Date.now() / 1000) };
    this.#walletChallenges.set(id, consumed);
    return consumed;
  }

  async createWalletSession(input: { address: Address; expiresAt: number }): Promise<WalletSessionRecord> {
    const record: WalletSessionRecord = { id: nextId("ws"), address: input.address, expiresAt: input.expiresAt };
    this.#walletSessions.set(record.id, record);
    return record;
  }

  async getWalletSession(id: string): Promise<WalletSessionRecord | null> {
    return this.#walletSessions.get(id) ?? null;
  }

  async createVisitRequest(input: CreateVisitRequestInput): Promise<VisitRequestRecord> {
    const record: VisitRequestRecord = {
      id: nextId("visit"),
      wallet: input.wallet,
      campaignNamespace: input.campaignNamespace,
      canonicalSpotId: input.canonicalSpotId,
      state: "requested",
      expiresAt: input.expiresAt,
      verifierId: null,
      approvedAt: null,
      createdAt: Math.floor(Date.now() / 1000),
    };
    this.#visitRequests.set(record.id, record);
    return record;
  }

  async getVisitRequest(id: string): Promise<VisitRequestRecord | null> {
    return this.#visitRequests.get(id) ?? null;
  }

  async approveVisitRequest(id: string, verifierId: string): Promise<VisitRequestRecord | null> {
    const record = this.#visitRequests.get(id);
    if (!record) return null;
    if (record.state !== "requested") return null; // 이미 처리됨
    const approved: VisitRequestRecord = {
      ...record,
      state: "approved",
      verifierId,
      approvedAt: Math.floor(Date.now() / 1000),
    };
    this.#visitRequests.set(id, approved);
    return approved;
  }

  async findAuthorizationByIdempotencyKey(
    scope: string,
    key: string,
  ): Promise<StampAuthorizationRecord | null> {
    const id = this.#authorizationsByIdemKey.get(`${scope}:${key}`);
    if (!id) return null;
    return this.#authorizationsById.get(id) ?? null;
  }

  async createAuthorizationIdempotent(
    input: CreateAuthorizationInput,
  ): Promise<CreateAuthorizationResult> {
    const idemKey = `${input.idempotencyScope}:${input.idempotencyKey}`;
    const existingId = this.#authorizationsByIdemKey.get(idemKey);
    if (existingId) {
      const existing = this.#authorizationsById.get(existingId);
      if (!existing) throw new Error("invariant: idempotency index without record");
      if (existing.requestBodyHash === input.requestBodyHash) {
        return { kind: "replayed", record: existing };
      }
      return { kind: "conflict" };
    }

    const nonceKey = `${input.recipient.toLowerCase()}:${input.nonce}`;
    if (this.#usedNonces.has(nonceKey)) {
      // nonce UNIQUE 위반 - 실제 DB의 UNIQUE 제약과 동일한 의미로 conflict 처리
      return { kind: "conflict" };
    }

    const record: StampAuthorizationRecord = {
      id: nextId("auth"),
      visitId: input.visitId,
      recipient: input.recipient,
      chainId: input.chainId,
      contractAddress: input.contractAddress,
      campaignId: input.campaignId,
      spotId: input.spotId,
      nonce: input.nonce,
      deadline: input.deadline,
      requestBodyHash: input.requestBodyHash,
      signature: input.signature,
      idempotencyScope: input.idempotencyScope,
      idempotencyKey: input.idempotencyKey,
      state: "issued",
      createdAt: Math.floor(Date.now() / 1000),
    };
    this.#authorizationsById.set(record.id, record);
    this.#authorizationsByIdemKey.set(idemKey, record.id);
    this.#usedNonces.add(nonceKey);
    return { kind: "created", record };
  }
}

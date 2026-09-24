/**
 * P3-04 stamps 유스케이스가 의존하는 repository/시계/난수 포트.
 *
 * 이 인터페이스가 03에게 보내는 실제 DB 구현 요구사항이다
 * (docs/reports/handoffs/agent_04/P3-01-*.md의 dependency_request 참고).
 * 03이 db/migrations + src/server/repositories/**에 PostgreSQL 구현을 제공하기 전까지는
 * ./testing/inMemoryStampsRepository.ts (테스트 전용 대체 구현)로 단위 테스트만 진행한다.
 * "메모리 fake는 영속성 통과 증거가 아니다" (api-v1.md) - accepted 상태로 표시하지 않는다.
 */
import type { Address, Hex } from "viem";

export type VisitState = "requested" | "approved" | "rejected" | "expired";
export type AuthorizationState = "issued" | "expired" | "consumed";

export interface WalletChallengeRecord {
  id: string;
  address: Address;
  nonce: string;
  message: string;
  expiresAt: number; // unix seconds
  consumedAt: number | null;
}

export interface WalletSessionRecord {
  id: string;
  address: Address;
  expiresAt: number;
}

export interface VisitRequestRecord {
  id: string;
  wallet: Address;
  campaignNamespace: string;
  canonicalSpotId: string;
  state: VisitState;
  expiresAt: number;
  verifierId: string | null;
  approvedAt: number | null;
  createdAt: number;
}

export interface StampAuthorizationRecord {
  id: string;
  visitId: string;
  recipient: Address;
  chainId: number;
  contractAddress: Address;
  campaignId: Hex;
  spotId: Hex;
  nonce: string; // decimal string - recipient당 UNIQUE
  deadline: string; // unix seconds, decimal string
  requestBodyHash: Hex; // 멱등 키 재사용 시 본문 변조 감지용
  signature: Hex;
  idempotencyScope: string;
  idempotencyKey: string;
  state: AuthorizationState;
  createdAt: number;
}

export interface CreateVisitRequestInput {
  wallet: Address;
  campaignNamespace: string;
  canonicalSpotId: string;
  expiresAt: number;
}

export interface CreateAuthorizationInput {
  visitId: string;
  recipient: Address;
  chainId: number;
  contractAddress: Address;
  campaignId: Hex;
  spotId: Hex;
  nonce: string;
  deadline: string;
  requestBodyHash: Hex;
  signature: Hex;
  idempotencyScope: string;
  idempotencyKey: string;
}

export type CreateAuthorizationResult =
  | { kind: "created"; record: StampAuthorizationRecord }
  | { kind: "replayed"; record: StampAuthorizationRecord }
  | { kind: "conflict" };

/**
 * 04가 P3-01/P3-04에서 03에게 요구하는 온체인 repository 계약.
 * (api-v1.md: "온체인 repository는 challenge 1회 소비, 방문/recipient 결합, 승인 멱등
 * 저장 및 nonce UNIQUE... 제공한다")
 */
export interface StampsRepository {
  createWalletChallenge(input: {
    address: Address;
    nonce: string;
    message: string;
    expiresAt: number;
  }): Promise<WalletChallengeRecord>;

  /** 원자적 1회 소비: 이미 소비되었거나 없으면 null. */
  consumeWalletChallenge(id: string): Promise<WalletChallengeRecord | null>;

  createWalletSession(input: { address: Address; expiresAt: number }): Promise<WalletSessionRecord>;
  getWalletSession(id: string): Promise<WalletSessionRecord | null>;

  createVisitRequest(input: CreateVisitRequestInput): Promise<VisitRequestRecord>;
  getVisitRequest(id: string): Promise<VisitRequestRecord | null>;

  /** requested 상태에서만 성공. 그 외 상태/만료/존재하지 않으면 null. */
  approveVisitRequest(id: string, verifierId: string): Promise<VisitRequestRecord | null>;

  findAuthorizationByIdempotencyKey(
    scope: string,
    key: string,
  ): Promise<StampAuthorizationRecord | null>;

  /**
   * nonce 발급과 승인 저장을 한 번에 원자적으로 수행한다 (03-onchain-system.md 5절:
   * "nonce는 서버에서 암호학적으로 생성하고 DB UNIQUE 제약으로 충돌을 감지한다").
   * 이미 같은 scope+key로 저장된 레코드가 있으면 requestBodyHash를 비교해
   * replayed(동일 본문) 또는 conflict(다른 본문)를 반환한다.
   */
  createAuthorizationIdempotent(input: CreateAuthorizationInput): Promise<CreateAuthorizationResult>;
}

export interface Clock {
  nowSeconds(): number;
}

export interface NonceGenerator {
  /** 십진수 문자열 nonce. 반드시 CSPRNG 기반이어야 한다 (예측 가능한 값 금지). */
  generate(): string;
}

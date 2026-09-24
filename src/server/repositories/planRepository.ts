/**
 * P1-05 repository 경계 — 인터페이스 정의만 포함한다.
 * 실제 PostgreSQL 구현은 P1-06(선행: P1-05 본 파일, P1-02 엔진 계약, ENV-01)에서 만든다.
 * 여기서는 계약(docs/contracts/api-v1.md §저장소 경계)을 코드로 고정하는 것이 목적이며,
 * 어떤 구현도 이 파일 자체만으로는 영속성을 보장하지 않는다.
 */
import type { CatalogSnapshotDTO, PlanV2DTO } from '../../shared/api/dto';

export interface CatalogRepository {
  get(version?: string): Promise<CatalogSnapshotDTO | null>;
}

/**
 * Idempotency-Key 보존 TTL (03 제안, 로컬 mock 후보 — production 정책 승인 아님, 01 확인 대기).
 * 근거: 익명 공유 링크 생성 재시도는 대개 같은 세션(수분~수시간) 내에 일어나고, 24시간이면
 * "다음날 새로고침 후 재제출" 같은 흔한 실패도 커버하면서 키 테이블이 무한정 커지지 않는다.
 *
 * 경계 규칙(명시):
 *  - expiresAt = createdAt + IDEMPOTENCY_KEY_TTL_HOURS (정확히 이 시각 포함 이후는 만료로 취급, 즉 now >= expiresAt).
 *  - 만료 전: 같은 scope+key + 같은 requestHash -> replayed(같은 slug/snapshot/createdAt).
 *            같은 scope+key + 다른 requestHash -> conflict(409 IDEMPOTENCY_CONFLICT), 시간과 무관.
 *  - 만료 후: 기존 레코드는 조회에서 즉시 배제한다. 같은 key로 다시 오면(본문이 같든 다르든)
 *            완전히 새 요청으로 처리해 새 slug/createdAt를 발급한다(conflict 아님).
 *  - 이 상수/경계는 fixture(requestHash 정규화 포함)로 InMemoryPlanRepository 테스트에서 검증한다.
 */
export const IDEMPOTENCY_KEY_TTL_HOURS = 24;

export interface SavedPlanRecord {
  slug: string;
  snapshot: PlanV2DTO;
  createdAt: string;
  expiresAt: string; // ISO 8601, createdAt + IDEMPOTENCY_KEY_TTL_HOURS
  idempotencyScope: string;
  idempotencyKey: string;
  requestHash: string;
}

export type SaveIdempotentInput = {
  scope: string; // 예: 'plans' — api-v1.md: 익명 plans와 인증 stamps는 scope를 공유하지 않는다
  key: string; // Idempotency-Key 헤더 값
  requestHash: string; // 정규화된 요청 본문의 해시 (같은 키 + 다른 본문 판별용)
  snapshot: PlanV2DTO;
};

export type SaveIdempotentResult =
  | { kind: 'created'; record: SavedPlanRecord }
  | { kind: 'replayed'; record: SavedPlanRecord }
  | { kind: 'conflict' }; // 같은 키, 다른 requestHash -> 409 IDEMPOTENCY_CONFLICT

export interface PlanRepository {
  /**
   * 저장 snapshot과 idempotency dedup 응답을 한 transaction에서 커밋해야 한다.
   * 실패 시 둘 다 남지 않아야 하며, DB 장애를 null/not-found로 삼키지 않는다
   * (구현체는 장애 시 반드시 throw하고, 호출자는 STORAGE_UNAVAILABLE(503)로 매핑한다).
   */
  saveIdempotent(input: SaveIdempotentInput): Promise<SaveIdempotentResult>;
  findBySlug(slug: string): Promise<SavedPlanRecord | null>;
}

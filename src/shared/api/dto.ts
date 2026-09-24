/**
 * src/shared/api — 브라우저 안전 DTO 계약 (P1-05)
 *
 * 이 파일은 docs/contracts/core-v1.md + docs/contracts/api-v1.md +
 * docs/architecture/implementation/02-rag-system.md §5 의 타입 초안을 그대로 옮긴 것이다.
 * C0 상태는 ready_for_review이며 아직 accepted_handoffs로 기록되지 않았으므로,
 * 여기 정의된 필드/버전 문자열은 draft로 취급한다 (가격 정책 등 사람 승인 사항 아님).
 *
 * 규칙(반드시 지킬 것):
 *  - 이 디렉터리는 src/server/** 를 import하지 않는다 (브라우저 번들에 서버 전용 코드가
 *    섞이는 것을 막기 위함). scripts/check-no-server-import.mjs 로 정적 검사한다.
 *  - 여기 있는 타입은 순수 데이터 형태만 표현하며 런타임 로직(SQL, fetch 등)을 포함하지 않는다.
 */

// ── 공통 envelope (docs/contracts/api-v1.md) ────────────────────────────────

export interface ApiSuccessEnvelope<T> {
  data: T;
  requestId: string;
}

export interface ApiErrorBody {
  code: ApiErrorCode;
  message: string;
  fields?: Record<string, string>;
}

export interface ApiErrorEnvelope {
  error: ApiErrorBody;
  requestId: string;
}

export type ApiEnvelope<T> = ApiSuccessEnvelope<T> | ApiErrorEnvelope;

export function isApiError<T>(envelope: ApiEnvelope<T>): envelope is ApiErrorEnvelope {
  return (envelope as ApiErrorEnvelope).error !== undefined;
}

/** docs/contracts/api-v1.md 표의 code 전체 목록. 임의로 새 코드를 추가하지 않는다. */
export const API_ERROR_CODES = [
  'INVALID_INPUT',
  'UNAUTHENTICATED',
  'FORBIDDEN',
  'PLAN_NOT_FOUND',
  'CATALOG_VERSION_UNAVAILABLE',
  'IDEMPOTENCY_CONFLICT',
  'PLAN_INFEASIBLE',
  'RATE_LIMITED',
  'STORAGE_UNAVAILABLE',
  'MODEL_UNAVAILABLE',
  'RETRIEVAL_UNAVAILABLE',
  'RPC_UNAVAILABLE',
  'INTERNAL_ERROR',
] as const;

export type ApiErrorCode = (typeof API_ERROR_CODES)[number];

/** code -> 기본 HTTP status (api-v1.md 표 기준). 컨트롤러 구현 시 참조용. */
export const API_ERROR_HTTP_STATUS: Record<ApiErrorCode, number> = {
  INVALID_INPUT: 400,
  UNAUTHENTICATED: 401,
  FORBIDDEN: 403,
  PLAN_NOT_FOUND: 404,
  CATALOG_VERSION_UNAVAILABLE: 409,
  IDEMPOTENCY_CONFLICT: 409,
  PLAN_INFEASIBLE: 422,
  RATE_LIMITED: 429,
  STORAGE_UNAVAILABLE: 503,
  MODEL_UNAVAILABLE: 503,
  RETRIEVAL_UNAVAILABLE: 503,
  RPC_UNAVAILABLE: 503,
  INTERNAL_ERROR: 500,
};

export function buildSuccessEnvelope<T>(data: T, requestId: string): ApiSuccessEnvelope<T> {
  return { data, requestId };
}

export function buildErrorEnvelope(
  code: ApiErrorCode,
  message: string,
  requestId: string,
  fields?: Record<string, string>
): ApiErrorEnvelope {
  return { error: fields ? { code, message, fields } : { code, message }, requestId };
}

// ── 도메인 입력/카탈로그 (docs/contracts/core-v1.md) ────────────────────────

export type DistrictIdOrAll = 'jeonpo' | 'yeongdo' | 'haeridan' | 'bosu' | 'mangmi' | 'all';

/** 기존 src/types의 TravelTheme과 동일 값 집합. 여기서는 순환 참조를 피하려고 리터럴로 재선언한다. */
export type TravelThemeDTO = 'all' | 'cafe_dessert' | 'local_food' | 'retro_culture' | 'ocean_healing';

export type TransitTypeDTO = 'transit_walk' | 'comfort_taxi';

export interface PlannerInputDTO {
  budgetKRW: number; // 1..1,000,000 정수 (core-v1.md draft 범위, 정책 미확정)
  partySize: number; // 1..8 정수
  districtId: DistrictIdOrAll;
  theme: TravelThemeDTO;
  transitType: TransitTypeDTO;
  candidateSpotIds?: string[];
}

export type SpotCategoryDTO = 'food' | 'cafe' | 'admission' | 'snack';

export interface CatalogSpotDTO {
  id: string;
  districtId: Exclude<DistrictIdOrAll, 'all'>;
  name: string;
  category: SpotCategoryDTO;
  active: boolean;
  unitPriceKRW: number;
  pricingUnit: 'perPerson';
  tags: string[];
}

export interface CatalogTransitOptionDTO {
  type: TransitTypeDTO;
  perPersonLegKRW: number;
  perVehicleLegKRW: number;
  vehicleCapacity: number;
}

export interface CatalogSnapshotDTO {
  version: string; // catalogVersion
  pricingPolicyVersion: string;
  spots: CatalogSpotDTO[];
  transit: CatalogTransitOptionDTO[];
}

// ── 계획 산출물 (core-v1.md PlanV2) ─────────────────────────────────────────

export interface PlanV2ItemDTO {
  order: number; // 1부터 연속
  spotId: string;
  name: string;
  category: SpotCategoryDTO;
  unitPriceKRW: number;
  pricingUnit: 'perPerson';
  costKRW: number;
}

export interface PlanV2DTO {
  schemaVersion: 2;
  catalogVersion: string;
  pricingPolicyVersion: string;
  preference: PlannerInputDTO;
  districtId: Exclude<DistrictIdOrAll, 'all'>;
  items: PlanV2ItemDTO[];
  transitCostKRW: number;
  totalSpent: number;
  remainingBudget: number;
}

export type PlanningResultDTO =
  | { status: 'ok'; plan: PlanV2DTO; diagnostics: { approximation: boolean } }
  | { status: 'invalid'; fields: Record<string, string> }
  | {
      status: 'infeasible';
      reason: string;
      minimumRequiredKRW?: number;
      minimumScope: 'catalog' | 'candidates';
      additionalBudgetKRW?: number;
    };

// ── POST /api/v1/plans (docs/contracts/api-v1.md §계획 API) ────────────────

export interface CreatePlanRequestDTO {
  preference: PlannerInputDTO;
  orderedSpotIds: string[];
  catalogVersion: string;
}

export interface SavedPlanDTO {
  slug: string;
  snapshot: PlanV2DTO;
  createdAt: string; // ISO 8601
}

export type CreatePlanResponseDataDTO = SavedPlanDTO;

// ── RAG: POST /api/v1/recommendations (02-rag-system.md §5) ────────────────

export interface RecommendationRequestDTO {
  query: string; // 최대 1000자
  /**
   * api-v1.0.0-rc3: 부분 조건만 전송 가능. 누락 필드는 clarify(200), 제공된 필드의
   * 형식/범위 오류는 INVALID_INPUT(400). 자연어(query)와 explicit 값의 충돌 판정은
   * 조건 추출(P2-04, extractConstraints) 책임이며 이 타입 자체는 판단하지 않는다.
   */
  constraints?: Partial<PlannerInputDTO>;
  catalogVersion: string;
}

export interface CitedClaimDTO {
  text: string;
  spotId?: string;
  sourceIds: string[];
}

export type SourceKindDTO = 'internal' | 'external';

export interface SourceReferenceDTO {
  id: string;
  title: string;
  url?: string;
  sourceKind: SourceKindDTO;
  publishedAt?: string;
  fetchedAt: string;
  verifiedAt?: string;
}

export type RecommendationResultDTO =
  | {
      status: 'ok';
      plan: PlanV2DTO;
      claims: CitedClaimDTO[];
      sources: SourceReferenceDTO[];
      catalogVersion: string;
      corpusVersion: string;
    }
  | { status: 'clarify'; question: string; fields: string[] }
  | { status: 'insufficient_evidence'; reason: string }
  | { status: 'infeasible'; reason: string; suggestedChanges: string[] };

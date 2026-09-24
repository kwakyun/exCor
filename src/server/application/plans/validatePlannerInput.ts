/**
 * P1-05 범위의 "형식 검증"만 담당한다 (400 INVALID_INPUT).
 * 예산 실현가능성(422 PLAN_INFEASIBLE)은 예산 엔진(P1-02, agent_02 소유) 책임이며 여기서 판단하지 않는다.
 * 범위 값(budgetKRW 1..1,000,000, partySize 1..8)은 docs/contracts/core-v1.md의 draft 범위이며
 * "이 범위의 제품 정책 확정은 미결정"이라고 문서에 명시된 값을 그대로 코드로 옮긴 것이다.
 * 정책이 확정되면 이 파일만 수정하면 되도록 상수를 분리해 둔다.
 */
import type { PlannerInputDTO } from '../../../shared/api/dto';

export const BUDGET_KRW_MIN = 1;
export const BUDGET_KRW_MAX = 1_000_000;
export const PARTY_SIZE_MIN = 1;
export const PARTY_SIZE_MAX = 8;

export type ValidationResult = { valid: true } | { valid: false; fields: Record<string, string> };

function isSafeInteger(n: unknown): n is number {
  return typeof n === 'number' && Number.isFinite(n) && Number.isInteger(n);
}

export function validatePlannerInput(input: PlannerInputDTO): ValidationResult {
  const fields: Record<string, string> = {};

  if (!isSafeInteger(input.budgetKRW) || input.budgetKRW < BUDGET_KRW_MIN || input.budgetKRW > BUDGET_KRW_MAX) {
    fields.budgetKRW = 'OUT_OF_RANGE';
  }
  if (!isSafeInteger(input.partySize) || input.partySize < PARTY_SIZE_MIN || input.partySize > PARTY_SIZE_MAX) {
    fields.partySize = 'OUT_OF_RANGE';
  }

  if (Object.keys(fields).length > 0) {
    return { valid: false, fields };
  }
  return { valid: true };
}

// ── RAG 요청(constraints)의 부분 검증 (api-v1.0.0-rc3) ──────────────────────
//
// POST /api/v1/recommendations의 constraints는 Partial<PlannerInputDTO>다.
// 필요 필드가 "없으면" clarify(200), "있는데 형식/범위가 틀리면" INVALID_INPUT(400).
// 자연어 query와 explicit 값의 충돌(예: 질문엔 "5만원"인데 constraints.budgetKRW=30000)은
// 조건 추출(extractConstraints, P2-04)이 query를 파싱해야 판단 가능하므로 이 함수의 책임 밖이다.

const REQUIRED_PLANNER_FIELDS = ['budgetKRW', 'partySize', 'districtId', 'theme', 'transitType'] as const;
type RequiredPlannerField = (typeof REQUIRED_PLANNER_FIELDS)[number];

export type RecommendationConstraintsCheck =
  | { status: 'complete'; constraints: PlannerInputDTO }
  | { status: 'clarify'; missingFields: RequiredPlannerField[] }
  | { status: 'invalid'; fields: Record<string, string> };

export function checkRecommendationConstraints(
  constraints: Partial<PlannerInputDTO> | undefined
): RecommendationConstraintsCheck {
  const input = constraints ?? {};
  const fields: Record<string, string> = {};

  if ('budgetKRW' in input) {
    const v = input.budgetKRW;
    if (!isSafeInteger(v) || v < BUDGET_KRW_MIN || v > BUDGET_KRW_MAX) {
      fields.budgetKRW = typeof v === 'number' ? 'OUT_OF_RANGE' : 'INVALID_TYPE';
    }
  }
  if ('partySize' in input) {
    const v = input.partySize;
    if (!isSafeInteger(v) || v < PARTY_SIZE_MIN || v > PARTY_SIZE_MAX) {
      fields.partySize = typeof v === 'number' ? 'OUT_OF_RANGE' : 'INVALID_TYPE';
    }
  }
  // districtId/theme/transitType 형식(허용값) 검증은 P1-02 도메인 타입 인계 후
  // 리터럴 유니온을 공유하는 시점에 강화한다 (지금은 현재 draft 타입 형태만 확인).
  if ('districtId' in input && typeof input.districtId !== 'string') {
    fields.districtId = 'INVALID_TYPE';
  }
  if ('theme' in input && typeof input.theme !== 'string') {
    fields.theme = 'INVALID_TYPE';
  }
  if ('transitType' in input && typeof input.transitType !== 'string') {
    fields.transitType = 'INVALID_TYPE';
  }

  if (Object.keys(fields).length > 0) {
    return { status: 'invalid', fields };
  }

  const missingFields = REQUIRED_PLANNER_FIELDS.filter((f) => !(f in input));
  if (missingFields.length > 0) {
    return { status: 'clarify', missingFields };
  }

  return { status: 'complete', constraints: input as PlannerInputDTO };
}

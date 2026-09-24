/**
 * P1-02 입력 형식 검증. src/server/application/plans/validatePlannerInput.ts(03 소유)와
 * 동일한 범위 상수를 쓰되 별도 파일로 둔다 — 서버 DTO 검증과 순수 엔진 검증은
 * 소유 경계가 다르며(src/server vs src/domain), 값만 core-v1.md 기준으로 맞춘다.
 */
import type { PlannerInput } from './types';

export const BUDGET_KRW_MIN = 1;
export const BUDGET_KRW_MAX = 1_000_000;
export const PARTY_SIZE_MIN = 1;
export const PARTY_SIZE_MAX = 8;

function isSafeInteger(n: unknown): n is number {
  return typeof n === 'number' && Number.isFinite(n) && Number.isInteger(n);
}

/** 통과 시 null, 실패 시 field -> 코드 레코드. 입력을 변경하지 않는다. */
export function validatePlannerInput(input: PlannerInput): Record<string, string> | null {
  const fields: Record<string, string> = {};

  if (!isSafeInteger(input.budgetKRW) || input.budgetKRW < BUDGET_KRW_MIN || input.budgetKRW > BUDGET_KRW_MAX) {
    fields.budgetKRW = 'OUT_OF_RANGE';
  }
  if (!isSafeInteger(input.partySize) || input.partySize < PARTY_SIZE_MIN || input.partySize > PARTY_SIZE_MAX) {
    fields.partySize = 'OUT_OF_RANGE';
  }

  return Object.keys(fields).length > 0 ? fields : null;
}

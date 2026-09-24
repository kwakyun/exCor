/**
 * P1-02 — docs/contracts/fixtures/core-v1.json의 모든 case/swapCase를 buildPlan/swapPlanSpot
 * 참조 구현으로 검증한다. fixture 자체의 산술 검사(tests/e2e/c0-fixtures.check.mjs)와는 달리
 * 여기서는 "엔진 구현"이 fixture 정답을 실제로 만들어내는지 교차 검토한다.
 */
import { describe, expect, it } from 'vitest';
import { buildPlan } from '../budgetEngine';
import { swapPlanSpot } from '../swapPlanSpot';
import type { CatalogSnapshot, PlannerInput, PlanV2 } from '../types';
import fixture from '../../../docs/contracts/fixtures/core-v1.json';

const catalog = fixture.catalog as unknown as CatalogSnapshot;

describe('core-v1 fixture — buildPlan', () => {
  for (const testCase of fixture.cases) {
    it(`${testCase.id}`, () => {
      const input = testCase.input as unknown as PlannerInput;
      const result = buildPlan(input, catalog);
      const expected = testCase.expected as Record<string, unknown>;

      expect(result.status).toBe(expected.status);

      if (result.status === 'ok' && expected.status === 'ok') {
        const orderedSpotIds = result.plan.items.map((item) => item.spotId);
        expect(orderedSpotIds).toEqual(expected.orderedSpotIds);
        expect(result.plan.transitCostKRW).toBe(expected.transitCostKRW);
        expect(result.plan.totalSpent).toBe(expected.totalSpent);
        expect(result.plan.remainingBudget).toBe(expected.remainingBudget);
        // 불변식 확인: 명세된 sum/총합 관계.
        const itemSum = result.plan.items.reduce((sum, item) => sum + item.costKRW, 0);
        expect(itemSum + result.plan.transitCostKRW).toBe(result.plan.totalSpent);
        expect(result.plan.totalSpent + result.plan.remainingBudget).toBe(input.budgetKRW);
      }

      if (result.status === 'infeasible' && expected.status === 'infeasible') {
        expect(result.minimumScope).toBe(expected.minimumScope);
        if ('minimumRequiredKRW' in expected) {
          expect(result.minimumRequiredKRW).toBe(expected.minimumRequiredKRW);
        } else {
          expect(result.minimumRequiredKRW).toBeUndefined();
        }
      }

      if (result.status === 'invalid' && expected.status === 'invalid') {
        expect(result.fields).toEqual(expected.fields);
      }
    });
  }

  it('입력과 catalog를 변경하지 않는다', () => {
    const input: PlannerInput = { ...(fixture.cases[0].input as unknown as PlannerInput) };
    const frozenInput = JSON.parse(JSON.stringify(input));
    const frozenCatalog = JSON.parse(JSON.stringify(catalog));
    buildPlan(input, catalog);
    expect(input).toEqual(frozenInput);
    expect(catalog).toEqual(frozenCatalog);
  });

  it('동일 입력·버전·후보에서 항상 같은 선택과 금액을 반환한다 (결정론)', () => {
    const input = fixture.cases[0].input as unknown as PlannerInput;
    const first = buildPlan(input, catalog);
    const second = buildPlan(input, catalog);
    expect(first).toEqual(second);
  });
});

describe('core-v1 fixture — swapPlanSpot', () => {
  const baseCases = new Map(fixture.cases.map((c) => [c.id, c]));

  for (const swapCase of fixture.swapCases) {
    it(`${swapCase.id}`, () => {
      const baseCase = baseCases.get(swapCase.baseCase)!;
      const baseInput = baseCase.input as unknown as PlannerInput;

      // swapComposition: 케이스별로 catalog를 독립 복제하고, replacement가 있으면 버전을
      // 바꾸지 않은 채 append한 뒤, baseCase plan은 "원본" catalog로 만들고 swap에는
      // "케이스" catalog를 전달한다.
      const caseCatalog: CatalogSnapshot = JSON.parse(JSON.stringify(catalog));
      const swapCaseAny = swapCase as { replacement?: Record<string, unknown>; spotId?: string; order: number };
      if (swapCaseAny.replacement) {
        caseCatalog.spots.push(swapCaseAny.replacement as unknown as CatalogSnapshot['spots'][number]);
      }

      const baseResult = buildPlan(baseInput, catalog);
      expect(baseResult.status).toBe('ok');
      const basePlan = (baseResult as { status: 'ok'; plan: PlanV2 }).plan;
      const basePlanSnapshot = JSON.parse(JSON.stringify(basePlan));

      const spotId = swapCaseAny.replacement ? (swapCaseAny.replacement.id as string) : (swapCaseAny.spotId as string);
      const result = swapPlanSpot(basePlan, swapCaseAny.order, spotId, caseCatalog);
      const expected = swapCase.expected as Record<string, unknown>;

      expect(result.status).toBe(expected.status);
      if (result.status === 'infeasible' && 'additionalBudgetKRW' in expected) {
        expect(result.additionalBudgetKRW).toBe(expected.additionalBudgetKRW);
      }
      if (expected.originalUnchanged) {
        expect(basePlan).toEqual(basePlanSnapshot);
      }
    });
  }
});

/**
 * core-v1.json fixture에 없는 경로(다권역 'all' 취합, 빈 candidateSpotIds, swap 부가 오류)를
 * 작은 합성 catalog로 검증한다. fixture 교차 검토와 별개로 02가 결정한 참조 구현의 동작을
 * 문서화하는 테스트다 (docs/reports/performance/engine-contract.md 참조).
 */
import { describe, expect, it } from 'vitest';
import { buildCheapestPlan, buildPlan } from '../budgetEngine';
import { swapPlanSpot } from '../swapPlanSpot';
import type { CatalogSnapshot, PlannerInput, PlanV2 } from '../types';

const catalog: CatalogSnapshot = {
  version: 'test-v1',
  pricingPolicyVersion: 'test-pricing-v1',
  spots: [
    { id: 'a-food', districtId: 'jeonpo', name: 'A식당', category: 'food', active: true, unitPriceKRW: 5000, pricingUnit: 'perPerson', tags: [] },
    { id: 'a-cafe', districtId: 'jeonpo', name: 'A카페', category: 'cafe', active: true, unitPriceKRW: 4000, pricingUnit: 'perPerson', tags: [] },
    { id: 'a-adm', districtId: 'jeonpo', name: 'A입장', category: 'admission', active: true, unitPriceKRW: 2000, pricingUnit: 'perPerson', tags: [] },
    { id: 'b-food', districtId: 'yeongdo', name: 'B식당', category: 'food', active: true, unitPriceKRW: 6000, pricingUnit: 'perPerson', tags: [] },
    { id: 'b-cafe', districtId: 'yeongdo', name: 'B카페', category: 'cafe', active: true, unitPriceKRW: 4500, pricingUnit: 'perPerson', tags: [] },
    { id: 'b-adm', districtId: 'yeongdo', name: 'B입장', category: 'admission', active: true, unitPriceKRW: 2500, pricingUnit: 'perPerson', tags: [] },
    { id: 'c-inactive-food', districtId: 'bosu', name: 'C비활성', category: 'food', active: false, unitPriceKRW: 1000, pricingUnit: 'perPerson', tags: [] },
  ],
  transit: [
    { type: 'transit_walk', perPersonLegKRW: 1000, perVehicleLegKRW: 0, vehicleCapacity: 4 },
    { type: 'comfort_taxi', perPersonLegKRW: 500, perVehicleLegKRW: 3000, vehicleCapacity: 4 },
  ],
};

describe('buildPlan — all 권역 취합', () => {
  it('예산이 충분하면 총지출이 더 큰 권역(yeongdo)을 선택한다', () => {
    const input: PlannerInput = { budgetKRW: 20000, partySize: 1, districtId: 'all', theme: 'all', transitType: 'transit_walk' };
    const result = buildPlan(input, catalog);
    expect(result.status).toBe('ok');
    if (result.status === 'ok') {
      // jeonpo: 5000+4000+2000+1000=12000, yeongdo: 6000+4500+2500+1000=14000 — 더 비싼 쪽(예산 내 최대 지출) 선택
      expect(result.plan.districtId).toBe('yeongdo');
      expect(result.plan.totalSpent).toBe(14000);
    }
  });

  it('비활성 스팟만 있는 권역은 카테고리 미충족으로 취급하고, 활성 권역만으로 계속 진행한다', () => {
    const input: PlannerInput = { budgetKRW: 5000, partySize: 1, districtId: 'bosu', theme: 'all', transitType: 'transit_walk' };
    const result = buildPlan(input, catalog);
    expect(result.status).toBe('infeasible');
    if (result.status === 'infeasible') {
      expect(result.reason).toBe('MISSING_REQUIRED_CATEGORY');
      expect(result.minimumRequiredKRW).toBeUndefined();
    }
  });
});

describe('buildPlan — candidateSpotIds', () => {
  it('빈 배열은 후보 없음이며 infeasible이다 (전체 catalog로 해석하지 않는다)', () => {
    const input: PlannerInput = {
      budgetKRW: 100000,
      partySize: 1,
      districtId: 'jeonpo',
      theme: 'all',
      transitType: 'transit_walk',
      candidateSpotIds: [],
    };
    const result = buildPlan(input, catalog);
    expect(result.status).toBe('infeasible');
    if (result.status === 'infeasible') {
      expect(result.minimumScope).toBe('candidates');
    }
  });

  it('존재하지 않는 후보 ID는 invalid다', () => {
    const input: PlannerInput = {
      budgetKRW: 100000,
      partySize: 1,
      districtId: 'jeonpo',
      theme: 'all',
      transitType: 'transit_walk',
      candidateSpotIds: ['a-food', 'does-not-exist'],
    };
    const result = buildPlan(input, catalog);
    expect(result.status).toBe('invalid');
    if (result.status === 'invalid') {
      expect(result.fields.candidateSpotIds).toBe('UNKNOWN_ID');
    }
  });
});

describe('buildCheapestPlan — ENGINE-FIX-02 fallback 전용 확장', () => {
  it('예산을 무시하고 가장 저렴한 조합을 반환하며 remainingBudget이 음수일 수 있다', () => {
    const input: PlannerInput = { budgetKRW: 1, partySize: 1, districtId: 'jeonpo', theme: 'all', transitType: 'transit_walk' };
    const result = buildCheapestPlan(input, catalog);
    expect(result.status).toBe('ok');
    if (result.status === 'ok') {
      expect(result.plan.totalSpent).toBe(12000);
      expect(result.plan.remainingBudget).toBe(1 - 12000);
    }
  });
});

describe('swapPlanSpot — 추가 오류 경로', () => {
  const basePlan: PlanV2 = {
    schemaVersion: 2,
    catalogVersion: catalog.version,
    pricingPolicyVersion: catalog.pricingPolicyVersion,
    preference: { budgetKRW: 20000, partySize: 1, districtId: 'jeonpo', theme: 'all', transitType: 'transit_walk' },
    districtId: 'jeonpo',
    items: [
      { order: 1, spotId: 'a-food', name: 'A식당', category: 'food', unitPriceKRW: 5000, pricingUnit: 'perPerson', costKRW: 5000 },
      { order: 2, spotId: 'a-cafe', name: 'A카페', category: 'cafe', unitPriceKRW: 4000, pricingUnit: 'perPerson', costKRW: 4000 },
      { order: 3, spotId: 'a-adm', name: 'A입장', category: 'admission', unitPriceKRW: 2000, pricingUnit: 'perPerson', costKRW: 2000 },
    ],
    transitCostKRW: 1000,
    totalSpent: 12000,
    remainingBudget: 8000,
  };

  it('catalog 버전이 다르면 invalid다', () => {
    const staleCatalog: CatalogSnapshot = { ...catalog, version: 'other-version' };
    const result = swapPlanSpot(basePlan, 1, 'b-food', staleCatalog);
    expect(result.status).toBe('invalid');
  });

  it('존재하지 않는 order는 invalid다', () => {
    const result = swapPlanSpot(basePlan, 99, 'b-food', catalog);
    expect(result.status).toBe('invalid');
  });

  it('비활성 스팟으로의 교체는 invalid다', () => {
    const result = swapPlanSpot(basePlan, 1, 'c-inactive-food', catalog);
    expect(result.status).toBe('invalid');
  });
});

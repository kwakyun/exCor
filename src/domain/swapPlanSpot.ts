/**
 * src/domain/swapPlanSpot.ts — P1-02 참조 구현 (agent_02 소유)
 *
 * docs/contracts/core-v1.md의 swapPlanSpot을 구현한다. 같은 권역·카테고리·활성 ID만
 * 허용하고, catalog 버전이 plan과 다르면 invalid, 예산 초과는 infeasible/additionalBudgetKRW로
 * 보고하며 원본 plan은 절대 변경하지 않는다(새 객체만 반환).
 */
import type { CatalogSnapshot, PlanV2, SwapResult } from './types';

export function swapPlanSpot(plan: PlanV2, order: number, spotId: string, catalog: CatalogSnapshot): SwapResult {
  if (catalog.version !== plan.catalogVersion) {
    return { status: 'invalid', reason: 'CATALOG_VERSION_MISMATCH' };
  }

  const targetItem = plan.items.find((item) => item.order === order);
  if (!targetItem) {
    return { status: 'invalid', reason: 'ORDER_NOT_FOUND' };
  }

  const replacement = catalog.spots.find((spot) => spot.id === spotId);
  if (!replacement) {
    return { status: 'invalid', reason: 'UNKNOWN_ID' };
  }
  if (!replacement.active) {
    return { status: 'invalid', reason: 'INACTIVE_SPOT' };
  }
  if (replacement.districtId !== plan.districtId) {
    return { status: 'invalid', reason: 'DISTRICT_MISMATCH' };
  }
  if (replacement.category !== targetItem.category) {
    return { status: 'invalid', reason: 'CATEGORY_MISMATCH' };
  }

  const newItemCostKRW = replacement.unitPriceKRW * plan.preference.partySize;
  const newTotalSpent = plan.totalSpent - targetItem.costKRW + newItemCostKRW;

  if (newTotalSpent > plan.preference.budgetKRW) {
    return {
      status: 'infeasible',
      reason: 'OVER_BUDGET',
      additionalBudgetKRW: newTotalSpent - plan.preference.budgetKRW,
    };
  }

  const items = plan.items.map((item) =>
    item.order === order
      ? {
          ...item,
          spotId: replacement.id,
          name: replacement.name,
          unitPriceKRW: replacement.unitPriceKRW,
          costKRW: newItemCostKRW,
        }
      : item
  );

  const newPlan: PlanV2 = {
    ...plan,
    catalogVersion: catalog.version,
    pricingPolicyVersion: catalog.pricingPolicyVersion,
    items,
    totalSpent: newTotalSpent,
    remainingBudget: plan.preference.budgetKRW - newTotalSpent,
  };

  return { status: 'ok', plan: newPlan };
}

/** src/domain 배럴 export (agent_02 소유, P1-02). */
export * from './types';
export { validatePlannerInput, BUDGET_KRW_MIN, BUDGET_KRW_MAX, PARTY_SIZE_MIN, PARTY_SIZE_MAX } from './validation';
export { buildPlan, buildCheapestPlan } from './budgetEngine';
export { swapPlanSpot } from './swapPlanSpot';
export { buildProductionCatalogSnapshot, productionDistrictIds, PRODUCTION_CATALOG_VERSION, PRODUCTION_PRICING_POLICY_VERSION } from './catalogAdapter';

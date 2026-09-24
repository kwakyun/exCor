/**
 * src/domain/budgetEngine.ts — P1-02 참조 구현 (agent_02 소유)
 *
 * docs/contracts/core-v1.md의 buildPlan을 구현한다. 동기 순수 함수이며 시각/난수/DB/UI에
 * 의존하지 않는다. 입력(PlannerInput)과 catalog(CatalogSnapshot)를 변경하지 않는다.
 *
 * 참조 구현은 전수 조합(brute force)이다 — 소규모 catalog(합성 fixture, 현재 생산 데이터
 * 권역당 카테고리별 소수 스팟)에서는 충분히 빠르며 정확성이 최우선이다. P1-03에서 권역/카테고리
 * 인덱스·가격 하한 가지치기로 속도를 개선하되 이 파일의 결과와 비교해 정확성을 보존해야 한다.
 *
 * 미결정 정책(all 권역 선택 시 테마 가중치 등)은 docs/reports/performance/engine-contract.md에
 * 별도로 기록하고 여기서는 core-v1.md에 명시된 결정 가능한 규칙만 구현한다.
 *
 * buildCheapestPlan은 core-v1.md 계약이 아니라 02의 P1-02 확장이다 (ENGINE-FIX-02 — 기존
 * "예산 초과 fallback" 결함을 대체하기 위해 facade(budgetCalculator.ts)가 예산 불가능 시
 * "가장 저렴한 조합"을 정직하게 보여주는 용도로만 쓴다). 이 함수의 PlanV2.remainingBudget은
 * 음수일 수 있으며 core-v1의 buildPlan 불변식(remainingBudget>=0)을 따르지 않는다 — 즉 이
 * 결과를 core-v1 준수 "ok" 응답으로 다루면 안 된다.
 */
import type {
  CatalogSnapshot,
  CatalogSpot,
  CatalogSpotCategory,
  CatalogTransitOption,
  DistrictId,
  PlannerInput,
  PlanningResult,
  PlanV2,
  PlanV2Item,
} from './types';
import { validatePlannerInput } from './validation';

interface Combo {
  food: CatalogSpot;
  cafe: CatalogSpot;
  admission: CatalogSpot;
  snack?: CatalogSpot;
  transitCostKRW: number;
  totalKRW: number;
  tuple: string[];
}

interface DistrictEvaluation {
  districtId: DistrictId;
  missingCategory: boolean;
  combos: Combo[];
}

/** 코드포인트 사전순 튜플 비교. 접두사인 더 짧은 튜플이 더 작다. */
function compareTuples(a: string[], b: string[]): number {
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i += 1) {
    if (a[i] < b[i]) return -1;
    if (a[i] > b[i]) return 1;
  }
  return a.length - b.length;
}

function computeTransitCostKRW(rate: CatalogTransitOption, partySize: number): number {
  const vehicles = Math.ceil(partySize / rate.vehicleCapacity);
  return rate.perPersonLegKRW * partySize + rate.perVehicleLegKRW * vehicles;
}

function groupByCategory(spots: CatalogSpot[]): Record<CatalogSpotCategory, CatalogSpot[]> {
  const groups: Record<CatalogSpotCategory, CatalogSpot[]> = { food: [], cafe: [], admission: [], snack: [] };
  for (const spot of spots) groups[spot.category].push(spot);
  return groups;
}

function buildCombos(eligible: CatalogSpot[], partySize: number, transitCostKRW: number): Combo[] {
  const groups = groupByCategory(eligible);
  if (groups.food.length === 0 || groups.cafe.length === 0 || groups.admission.length === 0) {
    return [];
  }
  const snackOptions: Array<CatalogSpot | undefined> = [undefined, ...groups.snack];
  const combos: Combo[] = [];
  for (const food of groups.food) {
    for (const cafe of groups.cafe) {
      for (const admission of groups.admission) {
        for (const snack of snackOptions) {
          const unitSum =
            food.unitPriceKRW + cafe.unitPriceKRW + admission.unitPriceKRW + (snack ? snack.unitPriceKRW : 0);
          const totalKRW = unitSum * partySize + transitCostKRW;
          const tuple = snack ? [food.id, cafe.id, admission.id, snack.id] : [food.id, cafe.id, admission.id];
          combos.push({ food, cafe, admission, snack, transitCostKRW, totalKRW, tuple });
        }
      }
    }
  }
  return combos;
}

function selectExtreme(combos: Combo[], mode: 'max' | 'min'): Combo {
  let best = combos[0];
  for (let i = 1; i < combos.length; i += 1) {
    const candidate = combos[i];
    const better = mode === 'max' ? candidate.totalKRW > best.totalKRW : candidate.totalKRW < best.totalKRW;
    const tied = candidate.totalKRW === best.totalKRW && compareTuples(candidate.tuple, best.tuple) < 0;
    if (better || tied) best = candidate;
  }
  return best;
}

function evaluateDistrict(
  districtId: DistrictId,
  poolSpots: CatalogSpot[],
  partySize: number,
  transitCostKRW: number
): DistrictEvaluation {
  const eligible = poolSpots.filter((s) => s.districtId === districtId && s.active);
  const combos = buildCombos(eligible, partySize, transitCostKRW);
  return { districtId, missingCategory: combos.length === 0, combos };
}

function comboToItems(combo: Combo, partySize: number): PlanV2Item[] {
  const items: PlanV2Item[] = [
    { order: 1, spotId: combo.food.id, name: combo.food.name, category: 'food', unitPriceKRW: combo.food.unitPriceKRW, pricingUnit: 'perPerson', costKRW: combo.food.unitPriceKRW * partySize },
    { order: 2, spotId: combo.cafe.id, name: combo.cafe.name, category: 'cafe', unitPriceKRW: combo.cafe.unitPriceKRW, pricingUnit: 'perPerson', costKRW: combo.cafe.unitPriceKRW * partySize },
    { order: 3, spotId: combo.admission.id, name: combo.admission.name, category: 'admission', unitPriceKRW: combo.admission.unitPriceKRW, pricingUnit: 'perPerson', costKRW: combo.admission.unitPriceKRW * partySize },
  ];
  if (combo.snack) {
    items.push({ order: 4, spotId: combo.snack.id, name: combo.snack.name, category: 'snack', unitPriceKRW: combo.snack.unitPriceKRW, pricingUnit: 'perPerson', costKRW: combo.snack.unitPriceKRW * partySize });
  }
  return items;
}

function comboToPlan(combo: Combo, districtId: DistrictId, input: PlannerInput, catalog: CatalogSnapshot): PlanV2 {
  const items = comboToItems(combo, input.partySize);
  const totalSpent = items.reduce((sum, item) => sum + item.costKRW, 0) + combo.transitCostKRW;
  return {
    schemaVersion: 2,
    catalogVersion: catalog.version,
    pricingPolicyVersion: catalog.pricingPolicyVersion,
    preference: input,
    districtId,
    items,
    transitCostKRW: combo.transitCostKRW,
    totalSpent,
    remainingBudget: input.budgetKRW - totalSpent,
  };
}

interface PreparedEvaluation {
  transitCostKRW: number;
  minimumScope: 'catalog' | 'candidates';
  districts: DistrictEvaluation[];
}

function prepareEvaluation(input: PlannerInput, catalog: CatalogSnapshot): PreparedEvaluation | { fieldError: Record<string, string> } {
  const transitRate = catalog.transit.find((t) => t.type === input.transitType);
  if (!transitRate) {
    return { fieldError: { transitType: 'UNKNOWN' } };
  }

  let pool: Set<string> | null = null;
  if (input.candidateSpotIds !== undefined) {
    if (input.candidateSpotIds.length > 0) {
      const catalogIds = new Set(catalog.spots.map((s) => s.id));
      const unknown = input.candidateSpotIds.filter((id) => !catalogIds.has(id));
      if (unknown.length > 0) {
        return { fieldError: { candidateSpotIds: 'UNKNOWN_ID' } };
      }
    }
    // 빈 배열을 포함해 명시적 제한은 그대로 pool로 사용한다 (빈 배열 = 후보 없음).
    pool = new Set(input.candidateSpotIds);
  }

  const poolSpots = pool ? catalog.spots.filter((s) => pool!.has(s.id)) : catalog.spots;
  const transitCostKRW = computeTransitCostKRW(transitRate, input.partySize);
  const minimumScope = input.candidateSpotIds !== undefined ? 'candidates' : 'catalog';

  const districtIds: DistrictId[] =
    input.districtId === 'all'
      ? Array.from(new Set(catalog.spots.map((s) => s.districtId))).sort()
      : [input.districtId];

  const districts = districtIds.map((districtId) => evaluateDistrict(districtId, poolSpots, input.partySize, transitCostKRW));

  return { transitCostKRW, minimumScope, districts };
}

export function buildPlan(input: PlannerInput, catalog: CatalogSnapshot): PlanningResult {
  const invalidFields = validatePlannerInput(input);
  if (invalidFields) {
    return { status: 'invalid', fields: invalidFields };
  }

  const prepared = prepareEvaluation(input, catalog);
  if ('fieldError' in prepared) {
    return { status: 'invalid', fields: prepared.fieldError };
  }
  const { minimumScope, districts } = prepared;

  const covered = districts.filter((d) => !d.missingCategory);
  const feasibleByDistrict = covered
    .map((d) => ({ districtId: d.districtId, feasible: d.combos.filter((c) => c.totalKRW <= input.budgetKRW) }))
    .filter((d) => d.feasible.length > 0);

  if (feasibleByDistrict.length > 0) {
    let bestDistrictId = feasibleByDistrict[0].districtId;
    let bestCombo = selectExtreme(feasibleByDistrict[0].feasible, 'max');
    for (let i = 1; i < feasibleByDistrict.length; i += 1) {
      const candidateCombo = selectExtreme(feasibleByDistrict[i].feasible, 'max');
      const candidateDistrictId = feasibleByDistrict[i].districtId;
      const better =
        candidateCombo.totalKRW > bestCombo.totalKRW ||
        (candidateCombo.totalKRW === bestCombo.totalKRW &&
          (candidateDistrictId < bestDistrictId ||
            (candidateDistrictId === bestDistrictId && compareTuples(candidateCombo.tuple, bestCombo.tuple) < 0)));
      if (better) {
        bestDistrictId = candidateDistrictId;
        bestCombo = candidateCombo;
      }
    }
    const plan = comboToPlan(bestCombo, bestDistrictId, input, catalog);
    return { status: 'ok', plan, diagnostics: { approximation: false } };
  }

  if (covered.length === 0) {
    return { status: 'infeasible', reason: 'MISSING_REQUIRED_CATEGORY', minimumScope };
  }

  let minimumRequiredKRW = selectExtreme(covered[0].combos, 'min').totalKRW;
  for (const evaluation of covered) {
    const localMin = selectExtreme(evaluation.combos, 'min').totalKRW;
    if (localMin < minimumRequiredKRW) minimumRequiredKRW = localMin;
  }
  return { status: 'infeasible', reason: 'BUDGET_BELOW_MINIMUM', minimumScope, minimumRequiredKRW };
}

/**
 * core-v1.md 계약 밖의 02 전용 확장 (ENGINE-FIX-02 fallback용). 예산을 완전히 무시하고
 * 카테고리 조합이 존재하는 한 "가장 저렴한" 조합을 반환한다. remainingBudget이 음수일 수
 * 있다 — 호출자는 반드시 diagnostics 대신 별도로 예산 초과 여부를 표시해야 한다.
 */
export function buildCheapestPlan(input: PlannerInput, catalog: CatalogSnapshot): PlanningResult {
  const invalidFields = validatePlannerInput(input);
  if (invalidFields) {
    return { status: 'invalid', fields: invalidFields };
  }
  const prepared = prepareEvaluation(input, catalog);
  if ('fieldError' in prepared) {
    return { status: 'invalid', fields: prepared.fieldError };
  }
  const { minimumScope, districts } = prepared;
  const covered = districts.filter((d) => !d.missingCategory);
  if (covered.length === 0) {
    return { status: 'infeasible', reason: 'MISSING_REQUIRED_CATEGORY', minimumScope };
  }

  let bestDistrictId = covered[0].districtId;
  let bestCombo = selectExtreme(covered[0].combos, 'min');
  for (let i = 1; i < covered.length; i += 1) {
    const candidateCombo = selectExtreme(covered[i].combos, 'min');
    const candidateDistrictId = covered[i].districtId;
    const better =
      candidateCombo.totalKRW < bestCombo.totalKRW ||
      (candidateCombo.totalKRW === bestCombo.totalKRW &&
        (candidateDistrictId < bestDistrictId ||
          (candidateDistrictId === bestDistrictId && compareTuples(candidateCombo.tuple, bestCombo.tuple) < 0)));
    if (better) {
      bestDistrictId = candidateDistrictId;
      bestCombo = candidateCombo;
    }
  }
  const plan = comboToPlan(bestCombo, bestDistrictId, input, catalog);
  return { status: 'ok', plan, diagnostics: { approximation: false } };
}

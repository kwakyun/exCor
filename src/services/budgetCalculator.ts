import {
  AlleyDistrict,
  CostBreakdown,
  CourseItem,
  Spot,
  TravelPlan,
  TravelPreference,
} from '../types';
import { ALLEY_DISTRICTS, SPOTS_DATA } from '../data/busanAlleys';
import { TRANSIT_COST_MODELS } from '../data/transitRates';
import {
  buildCheapestPlan,
  buildPlan,
  buildProductionCatalogSnapshot,
  swapPlanSpot,
} from '../domain';
import type { CatalogSnapshot, DistrictId, PlannerInput, PlanV2 } from '../domain/types';

/**
 * P1-02 facade (agent_02 소유).
 *
 * 이 파일은 App.tsx가 쓰는 기존 함수 시그니처(generateTravelPlan/swapSpotInPlan)와
 * TravelPlan/CourseItem 모양을 그대로 유지한다 — P1-04(프론트엔드 상태 개편)가 아직
 * 해제되지 않아 App.tsx/컴포넌트를 수정할 수 없기 때문이다. 대신 내부 계산은
 * src/domain(순수 엔진, core-v1.md 준수)에 위임해 기존 결함을 고친다:
 *
 *  - ENGINE-FIX-02 "인원 비용 미반영": 이제 인당 단가 × partySize로 정확히 계산한다
 *    (partySize=1일 때는 기존과 동일한 값이 나오므로 현재 UI는 회귀하지 않는다).
 *  - ENGINE-FIX-02 "예산 초과 fallback": 이전에는 모든 조합이 예산을 넘으면 아무 표시
 *    없이 초과 조합을 반환했다. 이제 buildPlan이 infeasible이면 참고용으로 "가장 저렴한
 *    조합"(buildCheapestPlan, core-v1 밖의 02 확장)을 보여주되 TravelPlan에 추가한
 *    선택적 `feasibility` 필드에 실제 상태(예산 부족/최소 필요 금액)를 정직하게 남긴다.
 *    기존 타입에 optional 필드만 추가했으므로 이를 읽지 않는 기존 코드는 그대로 동작한다.
 *  - SHARE-FIX-02 "교체 제약 누락": swapSpotInPlan이 이제 같은 권역·카테고리·활성 ID만
 *    허용하고, 예산 초과 교체는 원본을 그대로 유지한 채 거부한다(자동 증액하지 않는다).
 *
 * "all 권역" 선택은 기존 UX/테스트를 보존하기 위해 이 facade가 먼저(legacy
 * selectDistrict와 동일한 테마/예산 근접도 휴리스틱으로) 구체 권역을 고른 뒤 순수 엔진에
 * 전달한다 — 순수 엔진 자체의 'all' 취합(테마 가중치 없는 총지출 최대화)은
 * docs/reports/performance/engine-contract.md에 별도로 문서화했다.
 */

let cachedCatalog: CatalogSnapshot | null = null;
function catalog(): CatalogSnapshot {
  if (!cachedCatalog) cachedCatalog = buildProductionCatalogSnapshot();
  return cachedCatalog;
}

function resolveDistrict(preference: TravelPreference): AlleyDistrict {
  if (preference.districtId !== 'all') {
    const found = ALLEY_DISTRICTS.find((d) => d.id === preference.districtId);
    if (found) return found;
  }

  const themeMatches = ALLEY_DISTRICTS.filter(
    (d) => preference.theme === 'all' || d.theme === preference.theme
  );
  const candidates = themeMatches.length > 0 ? themeMatches : ALLEY_DISTRICTS;

  const sorted = [...candidates].sort((a, b) => {
    const diffA = Math.abs(a.recommendedBudgetMin - preference.budget);
    const diffB = Math.abs(b.recommendedBudgetMin - preference.budget);
    return diffA - diffB;
  });

  return sorted[0] || ALLEY_DISTRICTS[0];
}

function toPlannerInput(preference: TravelPreference, districtId: DistrictId): PlannerInput {
  return {
    budgetKRW: preference.budget,
    partySize: preference.partySize,
    districtId,
    theme: preference.theme,
    transitType: preference.transitType,
  };
}

interface Feasibility {
  status: 'ok' | 'infeasible' | 'invalid';
  reason?: string;
  minimumRequiredKRW?: number;
}

function findSpot(spotId: string): Spot {
  const spot = SPOTS_DATA.find((s) => s.id === spotId);
  if (!spot) {
    // production catalog는 SPOTS_DATA에서 생성되므로 엔진이 반환한 spotId는 항상 존재해야
    // 한다. 존재하지 않으면 catalog 어댑터와 SPOTS_DATA가 어긋난 데이터 무결성 문제이며
    // 조용히 감추지 않고 즉시 실패한다.
    throw new Error(`budgetCalculator: 엔진이 반환한 spotId(${spotId})를 SPOTS_DATA에서 찾을 수 없습니다.`);
  }
  return spot;
}

const TIME_SLOTS: Record<number, string> = {
  2: '11:45 - 12:45',
  3: '12:50 - 13:50',
  4: '14:00 - 15:10',
  5: '15:15 - 15:45',
};

const WALK_NOTES: Record<number, string> = {
  2: '골목 초입에서 도보 5분',
  3: '식당에서 도보 3~5분 (같은 골목 내)',
  4: '카페 인근 문화 산책로 도보 5분',
  5: '골목 귀가길 즉석 주전부리',
};

function planV2ToItems(plan: PlanV2, district: AlleyDistrict): CourseItem[] {
  const transitModel = TRANSIT_COST_MODELS[plan.preference.transitType];
  const items: CourseItem[] = [
    {
      order: 1,
      timeSlot: '11:00 - 11:45',
      spot: {
        id: `transit-${district.id}`,
        districtId: district.id,
        name: `${district.subwayStation} 도착 & 골목 진입`,
        category: 'transit',
        price: plan.transitCostKRW,
        estimatedTimeMinutes: 45,
        summary: transitModel.description,
        signature: transitModel.summary,
        tags: ['대중교통', '환승할인', '도보이동'],
        address: district.subwayStation,
        naverSearchUrl: `https://map.naver.com/p/search/${encodeURIComponent(district.name)}`,
        kakaoSearchUrl: `https://map.kakao.com/?q=${encodeURIComponent(district.name)}`,
        tip: '부산 지하철에서 시내버스 환승 시 30분 이내 무료 환승이 적용됩니다.',
      },
      cost: plan.transitCostKRW,
      category: 'transit',
      alternativeSpots: [],
      walkingDistanceNote: '지하철역 출구에서 도보 3~7분 소요',
    },
  ];

  for (const engineItem of plan.items) {
    const legacyOrder = engineItem.order + 1;
    const spot = findSpot(engineItem.spotId);
    const alternativeSpots = SPOTS_DATA.filter(
      (s) => s.districtId === district.id && s.category === engineItem.category && s.id !== spot.id
    );
    items.push({
      order: legacyOrder,
      timeSlot: TIME_SLOTS[legacyOrder] ?? '',
      spot,
      cost: engineItem.costKRW,
      category: engineItem.category,
      alternativeSpots,
      walkingDistanceNote: WALK_NOTES[legacyOrder],
    });
  }

  return items;
}

function calculateCostBreakdown(budget: number, items: CourseItem[]): CostBreakdown {
  let transitCost = 0;
  let foodCost = 0;
  let admissionCost = 0;
  let snackBufferCost = 0;

  for (const item of items) {
    if (item.category === 'transit') transitCost += item.cost;
    else if (item.category === 'food' || item.category === 'cafe') foodCost += item.cost;
    else if (item.category === 'admission') admissionCost += item.cost;
    else if (item.category === 'snack') snackBufferCost += item.cost;
  }

  const totalSpent = transitCost + foodCost + admissionCost + snackBufferCost;
  const remainingBudget = Math.max(0, budget - totalSpent);

  const safeBase = Math.max(budget, totalSpent);
  const transitPercent = Math.round((transitCost / safeBase) * 100);
  const foodPercent = Math.round((foodCost / safeBase) * 100);
  const admissionPercent = Math.round((admissionCost / safeBase) * 100);
  const bufferPercent = Math.max(0, 100 - (transitPercent + foodPercent + admissionPercent));

  return {
    transitCost,
    foodCost,
    admissionCost,
    snackBufferCost,
    totalSpent,
    remainingBudget,
    transitPercent,
    foodPercent,
    admissionPercent,
    bufferPercent,
  };
}

function buildTravelPlan(
  planV2: PlanV2,
  district: AlleyDistrict,
  preference: TravelPreference,
  feasibility: Feasibility
): TravelPlan {
  const items = planV2ToItems(planV2, district);
  const costBreakdown = calculateCostBreakdown(preference.budget, items);

  const savingsInsight =
    feasibility.status === 'ok'
      ? `예산 ${preference.budget.toLocaleString()}원 중 총 ${costBreakdown.totalSpent.toLocaleString()}원을 지출하여, ${costBreakdown.remainingBudget.toLocaleString()}원의 골목 비상금이 남았습니다!`
      : `현재 조건으로는 예산 ${preference.budget.toLocaleString()}원으로 필수 코스(식사/카페/입장)를 모두 구성할 수 없습니다. 표시된 코스는 가장 저렴한 참고 조합이며 실제 지출(${costBreakdown.totalSpent.toLocaleString()}원)이 예산을 초과할 수 있습니다.`;

  return {
    id: `plan-${Date.now()}-${district.id}`,
    title: `${district.name} ${preference.budget.toLocaleString()}원 맞춤 골목 투어`,
    district,
    preference,
    costBreakdown,
    items,
    alleyLocalSecretTip: district.localTip,
    savingsInsight,
    feasibility,
  };
}

/**
 * 사용자 조건에 맞춰 부산 골목 여행 코스와 3대 비용(교통/식비/입장료)을 최적화하는 엔진.
 * 내부적으로 src/domain의 순수 buildPlan(core-v1.md)에 위임한다.
 */
export function generateTravelPlan(preference: TravelPreference): TravelPlan {
  const district = resolveDistrict(preference);
  const input = toPlannerInput(preference, district.id);
  const result = buildPlan(input, catalog());

  if (result.status === 'ok') {
    return buildTravelPlan(result.plan, district, preference, { status: 'ok' });
  }

  const fallback = buildCheapestPlan(input, catalog());
  if (fallback.status !== 'ok') {
    // 생산 데이터의 모든 권역은 food/cafe/admission을 최소 1개씩 갖고 있어야 한다. 여기 도달하면
    // catalog 어댑터나 데이터가 손상된 것이므로 조용히 감추지 않고 바로 실패한다.
    throw new Error(
      `budgetCalculator: ${district.id} 권역에서 참고용 최저가 조합조차 만들 수 없습니다 (${fallback.status}).`
    );
  }

  const feasibility: Feasibility =
    result.status === 'infeasible'
      ? { status: 'infeasible', reason: result.reason, minimumRequiredKRW: result.minimumRequiredKRW }
      : { status: 'invalid', reason: Object.entries(result.fields).map(([k, v]) => `${k}:${v}`).join(',') };

  return buildTravelPlan(fallback.plan, district, preference, feasibility);
}

/**
 * 스팟 교체(Swap) 시 실시간으로 플랜 및 지출을 재계산하는 순수 함수.
 * 내부적으로 src/domain의 swapPlanSpot(core-v1.md)에 위임하며, 같은 권역·카테고리·활성
 * ID가 아니거나 예산을 초과하면 원본 plan을 그대로 반환한다(SHARE-FIX-02).
 */
export function swapSpotInPlan(plan: TravelPlan, itemOrder: number, newSpotId: string): TravelPlan {
  if (itemOrder <= 1) {
    // order 1은 교통 항목이며 카탈로그 스팟이 아니라서 교체 대상이 아니다(기존에도
    // SPOTS_DATA에 transit 항목이 없어 사실상 no-op이었다).
    return plan;
  }

  const engineItems = plan.items
    .filter((item) => item.category !== 'transit')
    .map((item) => ({
      order: item.order - 1,
      spotId: item.spot.id,
      name: item.spot.name,
      category: item.category as 'food' | 'cafe' | 'admission' | 'snack',
      unitPriceKRW: item.spot.price,
      pricingUnit: 'perPerson' as const,
      costKRW: item.cost,
    }));

  const shadowPlan: PlanV2 = {
    schemaVersion: 2,
    catalogVersion: catalog().version,
    pricingPolicyVersion: catalog().pricingPolicyVersion,
    preference: toPlannerInput(plan.preference, plan.district.id),
    districtId: plan.district.id,
    items: engineItems,
    transitCostKRW: plan.costBreakdown.transitCost,
    totalSpent: plan.costBreakdown.totalSpent,
    remainingBudget: plan.preference.budget - plan.costBreakdown.totalSpent,
  };

  const result = swapPlanSpot(shadowPlan, itemOrder - 1, newSpotId, catalog());
  if (result.status !== 'ok') {
    // UNKNOWN_ID/DISTRICT_MISMATCH/CATEGORY_MISMATCH/INACTIVE_SPOT/예산 초과 — 원본 유지.
    return plan;
  }

  return buildTravelPlan(result.plan, plan.district, plan.preference, { status: 'ok' });
}

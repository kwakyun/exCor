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

/**
 * 사용자 조건에 맞춰 부산 골목 여행 코스와 3대 비용(교통/식비/입장료)을 최적화하는 엔진
 */
export function generateTravelPlan(preference: TravelPreference): TravelPlan {
  // 1. 권역 확정
  const district = selectDistrict(preference);

  // 2. 교통비 모델 확정
  const transitModel = TRANSIT_COST_MODELS[preference.transitType];
  const transitCost = transitModel.cost;

  // 3. 해당 권역의 스팟 카테고리별 분류
  const districtSpots = SPOTS_DATA.filter((s) => s.districtId === district.id);
  const foodSpots = districtSpots.filter((s) => s.category === 'food');
  const cafeSpots = districtSpots.filter((s) => s.category === 'cafe');
  const admissionSpots = districtSpots.filter((s) => s.category === 'admission');
  const snackSpots = districtSpots.filter((s) => s.category === 'snack');

  // 4. 예산 내 최적의 조합 탐색 (교통 + 식비 + 카페 + 입장료 + 간식 <= 총예산)

  let bestCombo: {
    food: Spot;
    cafe: Spot;
    admission: Spot;
    snack?: Spot;
    totalCost: number;
    score: number;
  } | null = null;

  for (const food of foodSpots) {
    for (const cafe of cafeSpots) {
      for (const admission of admissionSpots) {
        // 간식 포함 시도
        for (const snack of [undefined, ...snackSpots]) {
          const subTotal = food.price + cafe.price + admission.price + (snack ? snack.price : 0);
          const totalWithTransit = transitCost + subTotal;

          if (totalWithTransit <= preference.budget) {
            // 점수화: 예산 소진율(낭비 없는 계획) + 테마 가중치
            const fillRatio = totalWithTransit / preference.budget;
            let score = fillRatio * 100;

            if (preference.theme === 'cafe_dessert' && cafe.price >= 6500) score += 10;
            if (preference.theme === 'local_food' && food.tags.includes('로컬노포')) score += 10;
            if (preference.theme === 'ocean_healing' && admission.tags.includes('해안산책로')) score += 10;
            if (preference.theme === 'retro_culture' && admission.tags.includes('헌책방거리')) score += 10;

            if (!bestCombo || score > bestCombo.score) {
              bestCombo = {
                food,
                cafe,
                admission,
                snack,
                totalCost: totalWithTransit,
                score,
              };
            }
          }
        }
      }
    }
  }

  // 예산이 매우 타이트하여 모든 조합이 초과될 경우의 안전 Fallback (가장 저렴한 스팟 조합)
  if (!bestCombo) {
    const minFood = [...foodSpots].sort((a, b) => a.price - b.price)[0] || foodSpots[0];
    const minCafe = [...cafeSpots].sort((a, b) => a.price - b.price)[0] || cafeSpots[0];
    const minAdmission =
      [...admissionSpots].filter((s) => s.isFree)[0] ||
      [...admissionSpots].sort((a, b) => a.price - b.price)[0] ||
      admissionSpots[0];

    const fallbackTotal = transitCost + minFood.price + minCafe.price + minAdmission.price;
    bestCombo = {
      food: minFood,
      cafe: minCafe,
      admission: minAdmission,
      snack: undefined,
      totalCost: fallbackTotal,
      score: 0,
    };
  }

  // 5. 코스 아이템 생성
  const items: CourseItem[] = [
    {
      order: 1,
      timeSlot: '11:00 - 11:45',
      spot: {
        id: `transit-${district.id}`,
        districtId: district.id,
        name: `${district.subwayStation} 도착 & 골목 진입`,
        category: 'transit',
        price: transitCost,
        estimatedTimeMinutes: 45,
        summary: transitModel.description,
        signature: transitModel.summary,
        tags: ['대중교통', '환승할인', '도보이동'],
        address: district.subwayStation,
        naverSearchUrl: `https://map.naver.com/p/search/${encodeURIComponent(district.name)}`,
        kakaoSearchUrl: `https://map.kakao.com/?q=${encodeURIComponent(district.name)}`,
        tip: '부산 지하철에서 시내버스 환승 시 30분 이내 무료 환승이 적용됩니다.',
      },
      cost: transitCost,
      category: 'transit',
      alternativeSpots: [],
      walkingDistanceNote: '지하철역 출구에서 도보 3~7분 소요',
    },
    {
      order: 2,
      timeSlot: '11:45 - 12:45',
      spot: bestCombo.food,
      cost: bestCombo.food.price,
      category: 'food',
      alternativeSpots: foodSpots.filter((s) => s.id !== bestCombo?.food.id),
      walkingDistanceNote: '골목 초입에서 도보 5분',
    },
    {
      order: 3,
      timeSlot: '12:50 - 13:50',
      spot: bestCombo.cafe,
      cost: bestCombo.cafe.price,
      category: 'cafe',
      alternativeSpots: cafeSpots.filter((s) => s.id !== bestCombo?.cafe.id),
      walkingDistanceNote: '식당에서 도보 3~5분 (같은 골목 내)',
    },
    {
      order: 4,
      timeSlot: '14:00 - 15:10',
      spot: bestCombo.admission,
      cost: bestCombo.admission.price,
      category: 'admission',
      alternativeSpots: admissionSpots.filter((s) => s.id !== bestCombo?.admission.id),
      walkingDistanceNote: '카페 인근 문화 산책로 도보 5분',
    },
  ];

  if (bestCombo.snack) {
    items.push({
      order: 5,
      timeSlot: '15:15 - 15:45',
      spot: bestCombo.snack,
      cost: bestCombo.snack.price,
      category: 'snack',
      alternativeSpots: snackSpots.filter((s) => s.id !== bestCombo?.snack?.id),
      walkingDistanceNote: '골목 귀가길 즉석 주전부리',
    });
  }

  // 6. 비용 계산서 산출
  const costBreakdown = calculateCostBreakdown(preference.budget, items);

  return {
    id: `plan-${Date.now()}-${district.id}`,
    title: `${district.name} ${preference.budget.toLocaleString()}원 맞춤 골목 투어`,
    district,
    preference,
    costBreakdown,
    items,
    alleyLocalSecretTip: district.localTip,
    savingsInsight: `예산 ${preference.budget.toLocaleString()}원 중 총 ${costBreakdown.totalSpent.toLocaleString()}원을 지출하여, ${costBreakdown.remainingBudget.toLocaleString()}원의 골목 비상금이 남았습니다!`,
  };
}

/**
 * 스팟 교체(Swap) 시 실시간으로 플랜 및 지출을 재계산하는 순수 함수
 */
export function swapSpotInPlan(plan: TravelPlan, itemOrder: number, newSpotId: string): TravelPlan {
  const targetSpot = SPOTS_DATA.find((s) => s.id === newSpotId);
  if (!targetSpot) return plan;

  const newItems = plan.items.map((item) => {
    if (item.order !== itemOrder) return item;

    // 카테고리 내 대체 목록 갱신
    const districtSpots = SPOTS_DATA.filter(
      (s) => s.districtId === plan.district.id && s.category === targetSpot.category
    );

    return {
      ...item,
      spot: targetSpot,
      cost: targetSpot.price,
      alternativeSpots: districtSpots.filter((s) => s.id !== targetSpot.id),
    };
  });

  const newBreakdown = calculateCostBreakdown(plan.preference.budget, newItems);

  return {
    ...plan,
    items: newItems,
    costBreakdown: newBreakdown,
    savingsInsight: `선택 장소를 변경하여 총 지출이 ${newBreakdown.totalSpent.toLocaleString()}원으로 갱신되었습니다. (잔여: ${newBreakdown.remainingBudget.toLocaleString()}원)`,
  };
}

/**
 * 3대 비용 분할 계산 유틸리티
 */
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

  // 퍼센티지 산출 (소수점 1자리)
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

/**
 * 권역 자동 결정 로직
 */
function selectDistrict(preference: TravelPreference): AlleyDistrict {
  if (preference.districtId !== 'all') {
    const found = ALLEY_DISTRICTS.find((d) => d.id === preference.districtId);
    if (found) return found;
  }

  // 테마에 맞는 권역 필터
  const themeMatches = ALLEY_DISTRICTS.filter(
    (d) => preference.theme === 'all' || d.theme === preference.theme
  );

  const candidates = themeMatches.length > 0 ? themeMatches : ALLEY_DISTRICTS;

  // 예산 추천 구간과 가장 잘 맞는 권역 선택
  const sorted = [...candidates].sort((a, b) => {
    const diffA = Math.abs(a.recommendedBudgetMin - preference.budget);
    const diffB = Math.abs(b.recommendedBudgetMin - preference.budget);
    return diffA - diffB;
  });

  return sorted[0] || ALLEY_DISTRICTS[0];
}

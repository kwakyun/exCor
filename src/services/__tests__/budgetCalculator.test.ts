import { describe, it, expect } from 'vitest';
import { generateTravelPlan, swapSpotInPlan } from '../budgetCalculator';
import { TravelPreference } from '../../types';

describe('부산 골목 여행 설계기 예산 밸런서 (Budget Calculator Engine)', () => {
  it('예산 30,000원 알뜰 뚜벅이 코스 생성 시 총 지출이 예산 이하이어야 한다', () => {
    const pref: TravelPreference = {
      budget: 30000,
      districtId: 'bosu',
      theme: 'all',
      transitType: 'transit_walk',
      partySize: 1,
    };

    const plan = generateTravelPlan(pref);

    expect(plan.district.id).toBe('bosu');
    expect(plan.costBreakdown.transitCost).toBe(3100);
    expect(plan.costBreakdown.totalSpent).toBeLessThanOrEqual(30000);
    expect(plan.costBreakdown.remainingBudget).toBeGreaterThanOrEqual(0);
    expect(plan.items.length).toBeGreaterThanOrEqual(4);
  });

  it('예산 50,000원 전포 카페거리 코스 생성 시 식비/카페/입장료가 모두 포함되어야 한다', () => {
    const pref: TravelPreference = {
      budget: 50000,
      districtId: 'jeonpo',
      theme: 'cafe_dessert',
      transitType: 'transit_walk',
      partySize: 1,
    };

    const plan = generateTravelPlan(pref);

    const categories = plan.items.map((i) => i.category);
    expect(categories).toContain('transit');
    expect(categories).toContain('food');
    expect(categories).toContain('cafe');
    expect(categories).toContain('admission');

    expect(plan.costBreakdown.totalSpent).toBeLessThanOrEqual(50000);
    expect(plan.costBreakdown.foodCost).toBeGreaterThan(0);
    expect(plan.costBreakdown.transitCost).toBe(3100);
  });

  it('편안 믹스(택시 포함) 선택 시 교통비가 8,500원으로 책정되어야 한다', () => {
    const pref: TravelPreference = {
      budget: 60000,
      districtId: 'yeongdo',
      theme: 'ocean_healing',
      transitType: 'comfort_taxi',
      partySize: 1,
    };

    const plan = generateTravelPlan(pref);

    expect(plan.costBreakdown.transitCost).toBe(8500);
    expect(plan.costBreakdown.totalSpent).toBeLessThanOrEqual(60000);
    expect(plan.district.id).toBe('yeongdo');
  });

  it('권역을 all(전체)로 선택 시 테마와 예산에 맞춰 적절한 골목이 자동 추천되어야 한다', () => {
    const oceanPref: TravelPreference = {
      budget: 45000,
      districtId: 'all',
      theme: 'ocean_healing',
      transitType: 'transit_walk',
      partySize: 1,
    };

    const oceanPlan = generateTravelPlan(oceanPref);
    expect(oceanPlan.district.id).toBe('yeongdo');
  });

  it('스팟 교체(Swap) 시 전체 지출과 잔여 예산이 실시간 재계산되어야 한다', () => {
    const pref: TravelPreference = {
      budget: 50000,
      districtId: 'jeonpo',
      theme: 'cafe_dessert',
      transitType: 'transit_walk',
      partySize: 1,
    };

    const initialPlan = generateTravelPlan(pref);
    const foodItem = initialPlan.items.find((i) => i.category === 'food')!;
    const alternativeSpot = foodItem.alternativeSpots[0];

    expect(alternativeSpot).toBeDefined();

    const updatedPlan = swapSpotInPlan(initialPlan, foodItem.order, alternativeSpot.id);

    const updatedFoodItem = updatedPlan.items.find((i) => i.order === foodItem.order)!;
    expect(updatedFoodItem.spot.id).toBe(alternativeSpot.id);
    expect(updatedFoodItem.cost).toBe(alternativeSpot.price);

    // 새 총액 검증
    const expectedTotal =
      initialPlan.costBreakdown.totalSpent - foodItem.cost + alternativeSpot.price;
    expect(updatedPlan.costBreakdown.totalSpent).toBe(expectedTotal);
  });
});

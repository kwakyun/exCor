export type SpotCategory = 'transit' | 'food' | 'cafe' | 'admission' | 'snack';

export type DistrictId = 'jeonpo' | 'yeongdo' | 'haeridan' | 'bosu' | 'mangmi';

export type TravelTheme = 'all' | 'cafe_dessert' | 'local_food' | 'retro_culture' | 'ocean_healing';

export type TransitType = 'transit_walk' | 'comfort_taxi';

export interface AlleyDistrict {
  id: DistrictId;
  name: string;
  subName: string;
  badge: string;
  tagline: string;
  description: string;
  themeTags: string[];
  emoji: string;
  accentColor: string;
  theme: TravelTheme;
  recommendedBudgetMin: number;
  recommendedBudgetMax: number;
  subwayStation: string;
  localTip: string;
}

export interface Spot {
  id: string;
  districtId: DistrictId;
  name: string;
  category: SpotCategory;
  price: number; // 1인 기준 평균 지출액 (원)
  estimatedTimeMinutes: number;
  summary: string;
  signature: string; // 대표 메뉴 or 핵심 체험
  tags: string[];
  address: string;
  naverSearchUrl: string;
  kakaoSearchUrl: string;
  tip?: string;
  isFree?: boolean;
}

export interface TransitCostModel {
  type: TransitType;
  label: string;
  icon: string;
  cost: number;
  summary: string;
  description: string;
}

export interface TravelPreference {
  budget: number; // 총 예산 (원)
  districtId: DistrictId | 'all';
  theme: TravelTheme;
  transitType: TransitType;
  partySize: number; // 인원수 (기본 1인)
}

export interface CostBreakdown {
  transitCost: number;
  foodCost: number;
  admissionCost: number;
  snackBufferCost: number;
  totalSpent: number;
  remainingBudget: number;
  transitPercent: number;
  foodPercent: number;
  admissionPercent: number;
  bufferPercent: number;
}

export interface CourseItem {
  order: number;
  timeSlot: string; // e.g. "11:30 - 12:45"
  spot: Spot;
  cost: number;
  category: SpotCategory;
  alternativeSpots: Spot[];
  walkingDistanceNote?: string;
}

/**
 * P1-02(agent_02)에서 추가: 엔진이 실제로 예산 내에서 코스를 완성했는지 보고하는
 * 진단 정보. optional이라 기존 코드는 이 필드를 몰라도 그대로 동작한다(추가 전용 변경).
 * status !== 'ok'이면 items/costBreakdown은 "가장 저렴한 참고 조합"이며 실제 지출이
 * preference.budget을 초과할 수 있다 — ENGINE-FIX-02(예산 초과를 조용히 감추던 기존
 * fallback 결함) 수정의 일부다.
 */
export interface PlanFeasibility {
  status: 'ok' | 'infeasible' | 'invalid';
  reason?: string;
  minimumRequiredKRW?: number;
}

export interface TravelPlan {
  id: string;
  title: string;
  district: AlleyDistrict;
  preference: TravelPreference;
  costBreakdown: CostBreakdown;
  items: CourseItem[];
  alleyLocalSecretTip: string;
  savingsInsight: string;
  feasibility?: PlanFeasibility;
}

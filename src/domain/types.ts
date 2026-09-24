/**
 * src/domain — 순수 예산 엔진 도메인 타입 (P1-02, agent_02 소유)
 *
 * docs/contracts/core-v1.md (core-v1.0.0-rc2)를 그대로 코드화한다. 이 파일은
 * 시각/난수/DB/UI에 의존하지 않는 순수 데이터 타입만 담으며, src/shared/api의
 * DTO(agent_03 소유)와 필드명·형태를 동일하게 유지한다 — 동일한 개념을 위한
 * 중복 금액 타입을 조용히 새로 만들지 않는다. districtId/theme/transitType의
 * 리터럴 유니온은 기존 src/types의 값을 재사용한다.
 *
 * 가격 범위(budgetKRW 1..1,000,000)와 인원 범위(partySize 1..8)는 core-v1.md의
 * draft 정책이다. 실제 제품 정책 확정은 별도 사람 승인 사항이며 이 파일이
 * 그 승인을 의미하지 않는다.
 */
import type { DistrictId, TransitType, TravelTheme } from '../types';
export type { DistrictId, TransitType, TravelTheme };

/** 'all'은 PlannerInput 전용이며 CatalogSpot/PlanV2는 항상 구체 권역이다. */
export type DistrictIdOrAll = DistrictId | 'all';

/** transit은 CatalogSpot의 category가 아니라 별도 CatalogSnapshot.transit로 계산한다. */
export type CatalogSpotCategory = 'food' | 'cafe' | 'admission' | 'snack';

export interface PlannerInput {
  budgetKRW: number;
  partySize: number;
  districtId: DistrictIdOrAll;
  theme: TravelTheme;
  transitType: TransitType;
  /**
   * undefined: 후보 제한 없음(전체 catalog 사용).
   * []: 명시적으로 빈 후보 — "후보 없음"이며 전체 catalog로 해석하지 않는다.
   * 비어있지 않은 배열: 이 id 집합으로만 제한. 존재하지 않는 id가 있으면 invalid.
   */
  candidateSpotIds?: string[];
}

export interface CatalogSpot {
  id: string;
  districtId: DistrictId;
  name: string;
  category: CatalogSpotCategory;
  active: boolean;
  unitPriceKRW: number;
  pricingUnit: 'perPerson';
  tags: string[];
}

export interface CatalogTransitOption {
  type: TransitType;
  perPersonLegKRW: number;
  perVehicleLegKRW: number;
  vehicleCapacity: number;
}

export interface CatalogSnapshot {
  version: string;
  pricingPolicyVersion: string;
  spots: CatalogSpot[];
  transit: CatalogTransitOption[];
}

export interface PlanV2Item {
  order: number;
  spotId: string;
  name: string;
  category: CatalogSpotCategory;
  unitPriceKRW: number;
  pricingUnit: 'perPerson';
  costKRW: number;
}

export interface PlanV2 {
  schemaVersion: 2;
  catalogVersion: string;
  pricingPolicyVersion: string;
  preference: PlannerInput;
  /** buildPlan 내부에서 'all'을 구체 권역으로 해소한 결과. 절대 'all'이 아니다. */
  districtId: DistrictId;
  items: PlanV2Item[];
  transitCostKRW: number;
  totalSpent: number;
  remainingBudget: number;
}

export type MinimumScope = 'catalog' | 'candidates';

export type PlanningResult =
  | { status: 'ok'; plan: PlanV2; diagnostics: { approximation: boolean } }
  | { status: 'invalid'; fields: Record<string, string> }
  | {
      status: 'infeasible';
      reason: string;
      minimumScope: MinimumScope;
      minimumRequiredKRW?: number;
    };

export type SwapResult =
  | { status: 'ok'; plan: PlanV2 }
  | { status: 'invalid'; reason: string }
  | { status: 'infeasible'; reason: string; additionalBudgetKRW: number };

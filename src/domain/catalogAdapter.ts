/**
 * src/domain/catalogAdapter.ts — 기존 production 데이터(src/data)를 CatalogSnapshot으로
 * 변환한다 (agent_02 소유, P1-02).
 *
 * 주의: 이 어댑터는 "인원 비용 미반영" 결함(ENGINE-FIX-02)을 고치기 위해 기존
 * Spot.price(1인 기준 평균 지출액, src/types의 주석 참조)를 unitPriceKRW(perPerson)로
 * 그대로 옮긴다 — 새 가격 정책을 만드는 것이 아니라 이미 "1인 기준"이라고 명시된 필드를
 * 엔진이 partySize와 올바르게 곱하도록 연결하는 것이다.
 *
 * 기존 TRANSIT_COST_MODELS는 단일 금액(왕복 등)만 가지고 있어 perVehicleLegKRW/
 * vehicleCapacity 개념이 없다. core-v1.md의 혼합교통 공식(perPerson*party +
 * perVehicle*ceil(party/capacity))은 draft-demo 정책이며 실제 택시 동승 요금 정책을
 * 새로 만드는 것은 사람 승인 없이 결정할 수 없다(AGENTS.md #10/#11). 따라서 production
 * catalog는 perVehicleLegKRW=0으로 두고 기존 단일 금액을 인원수만큼 선형 비례시킨다 —
 * 이는 partySize=1일 때 기존 값과 완전히 동일하며, partySize>1일 때만 결함이 고쳐진
 * 결과가 나타난다(기존 UI는 아직 partySize=1만 사용한다).
 */
import { ALLEY_DISTRICTS, SPOTS_DATA } from '../data/busanAlleys';
import { TRANSIT_COST_MODELS } from '../data/transitRates';
import type { DistrictId, TransitType } from '../types';
import type { CatalogSnapshot, CatalogSpot, CatalogSpotCategory, CatalogTransitOption } from './types';

export const PRODUCTION_CATALOG_VERSION = 'legacy-busan-alley-v1';
export const PRODUCTION_PRICING_POLICY_VERSION = 'legacy-flat-price-v1';

const CATALOG_CATEGORIES: ReadonlySet<string> = new Set(['food', 'cafe', 'admission', 'snack']);

function isCatalogCategory(category: string): category is CatalogSpotCategory {
  return CATALOG_CATEGORIES.has(category);
}

let cached: CatalogSnapshot | null = null;

/** 매 호출 새 배열/객체를 반환해 호출자가 실수로 공유 catalog를 변경하지 못하게 한다. */
export function buildProductionCatalogSnapshot(): CatalogSnapshot {
  if (!cached) {
    const spots: CatalogSpot[] = SPOTS_DATA.filter((spot) => isCatalogCategory(spot.category)).map((spot) => ({
      id: spot.id,
      districtId: spot.districtId,
      name: spot.name,
      category: spot.category as CatalogSpotCategory,
      active: true,
      unitPriceKRW: spot.price,
      pricingUnit: 'perPerson',
      tags: spot.tags,
    }));

    const transit: CatalogTransitOption[] = (Object.keys(TRANSIT_COST_MODELS) as TransitType[]).map((type) => ({
      type,
      perPersonLegKRW: TRANSIT_COST_MODELS[type].cost,
      perVehicleLegKRW: 0,
      vehicleCapacity: Number.POSITIVE_INFINITY,
    }));

    cached = {
      version: PRODUCTION_CATALOG_VERSION,
      pricingPolicyVersion: PRODUCTION_PRICING_POLICY_VERSION,
      spots,
      transit,
    };
  }
  return { ...cached, spots: [...cached.spots], transit: [...cached.transit] };
}

export function productionDistrictIds(): DistrictId[] {
  return ALLEY_DISTRICTS.map((d) => d.id);
}

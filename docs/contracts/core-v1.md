# C0 공통 도메인 계약

버전: core-v1.0.0-rc2 · 소유/작성: 01 · 구현: 02 · 소비: 03/04 · 상태: ready_for_review (02 재검토 전)

기준 HEAD: `4cb7ca83069f58103707426f215de5c96bddfe01`. 이 문서는 목표 계약이며 현재 구현 완료 또는 가격 정책의 사람 승인을 뜻하지 않는다.

## 입력과 계산

`PlannerInput = { budgetKRW, partySize, districtId, theme, transitType, candidateSpotIds? }`.
districtId는 jeonpo/yeongdo/haeridan/bosu/mangmi/all, theme은 기존 TravelTheme, transitType은 transit_walk/comfort_taxi다.
금액은 원 단위 안전한 정수. 총예산은 전체 인원 합계다. 초안의 유효 입력은 budgetKRW 1..1,000,000, partySize 1..8 정수이며 0/음수/소수/NaN/Infinity/범위 밖은 invalid다. 비음수 저장 타입과 생성 입력의 최솟값 1을 구분한다. 이 범위의 제품 정책 확정은 미결정이며 fixture에서는 명시적으로 이 초안을 사용한다.

`CatalogSnapshot = { version, pricingPolicyVersion, spots, transit }`.
`CatalogSpot = { id, districtId, name, category, active, unitPriceKRW, pricingUnit, tags }`.
장소 단위는 perPerson. 기존 spotId를 변경하지 않고 비활성 장소는 새 생성에서 제외한다. catalogVersion은 가격/장소 snapshot, corpusVersion은 근거 집합, campaignId는 발급 정책으로 서로 대체하지 않는다.
카테고리는 food/cafe/admission 필수 각 1개, snack 선택 0..1개. transit은 별도 비용이며 orderedSpotIds에 넣지 않는다. 한 계획의 장소는 한 권역에 속한다.

대중교통은 인당 비용 × 인원. 혼합은 perPersonLegKRW × partySize + perVehicleLegKRW × ceil(partySize / vehicleCapacity).
fixture의 3100, 1550, 6950, capacity=4는 계산 검증용 데모 값이며 실제 요금·승차 정책 승인이 아니다. 기존 코드는 transit_walk=3100, comfort_taxi=8500 단일 금액이다.

## 출력과 불변식

`buildPlan(input, catalog)`는 동기 순수 함수로 시각·난수·DB·UI에 의존하지 않는다.

```ts
type PlanningResult =
  | { status: 'ok'; plan: PlanV2; diagnostics: { approximation: boolean } }
  | { status: 'invalid'; fields: Record<string, string> }
  | { status: 'infeasible'; reason: string; minimumRequiredKRW?: number;
      minimumScope: 'catalog' | 'candidates'; additionalBudgetKRW?: number };
type PlanV2 = {
  schemaVersion: 2; catalogVersion: string; pricingPolicyVersion: string;
  preference: PlannerInput; districtId: string;
  items: Array<{ order: number; spotId: string; name: string;
    category: string; unitPriceKRW: number; pricingUnit: 'perPerson'; costKRW: number }>;
  transitCostKRW: number; totalSpent: number; remainingBudget: number;
};
```

ID/slug/createdAt는 저장 envelope에서 부여한다. items order는 1부터 연속, food/cafe/admission/snack 순서다. `sum(items.costKRW)+transitCostKRW=totalSpent`, `totalSpent+remainingBudget=budgetKRW`, remainingBudget>=0. snapshot 가격을 현재 가격으로 덮어쓰지 않는다.
같은 입력·버전·후보에서 같은 선택과 금액. 동점은 ordered spotId tuple의 코드포인트 사전순. 입력과 catalog를 변경하지 않는다. 빈 후보 배열은 후보 없음이며 전체 catalog로 해석하지 않는다. 존재하지 않는 후보 ID는 invalid. 후보 불가능의 최솟값은 candidates 범위이며 전역 불가능이라고 표시하지 않는다.
all 권역 선택과 기존 테마 점수의 상세 보존은 02의 P1-02 참조 구현 인계에서 고정하고 core-v1 다음 revision에 반영한다. 해당 미결정 사항에 의존하는 전역 최적성 QA는 보류한다.

`swapPlanSpot(plan, order, spotId, catalog)`는 같은 권역·카테고리·활성 ID만 허용하고 버전 불일치는 invalid. 초과는 infeasible/additionalBudgetKRW, 원본 유지. 불가능 결과를 정식 plan으로 반환하거나 예산을 자동 증액하지 않는다.

## fixture 및 검토

`fixtures/core-v1.json`은 합성 장소 전용이며 실제 spotId를 대체하지 않는다. 정상 2인/혼합 5인/초과/무료/잘못된 인원/후보 축소/교체를 포함한다. 02는 fixture 정답과 타입 실현 가능성을 교차 검토하고 참조 구현과 최적화 구현을 같은 입력으로 비교한다. fixture 자체 산술 검사 성공은 엔진 구현 통과가 아니다.
교체 case마다 원본 catalog를 독립 복제한 뒤 완전한 replacement CatalogSpot을 append한다(테스트 전용 동일 버전). baseCase plan은 원본 catalog로 생성하고, 교체 함수에는 case catalog와 replacement.id를 전달한다. unknown-id case만 장소를 추가하지 않고 spotId를 직접 전달한다. 따라서 미등록 ID 거절이 다른 권역/카테고리/초과 검사에 앞서 케이스를 가리지 않는다.
legacy budget은 budgetKRW로 명시 변환하고 schemaVersion 없는 저장 자료는 읽기 검증 후 변환한다. 실패 시 원래 저장 키를 삭제하지 않는다.

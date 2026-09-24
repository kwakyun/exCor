# P1-02 예산 엔진 참조 구현 — 결정 기록

작성 2026-09-24 16:48 KST · agent_02 · run_id `agent02-20260924T100752+0900-4cb7ca8`
base_commit `4cb7ca83069f58103707426f215de5c96bddfe01` (working tree, uncommitted)
대상 계약: `docs/contracts/core-v1.md` (core-v1.0.0-rc2)

이 문서는 core-v1.md가 "02의 P1-02 참조 구현 인계에서 고정"하라고 명시적으로 미룬 항목과,
02가 계약 구현 중 내린 구체적인 선택을 기록한다. 여기 적힌 결정은 **제품 가격/정책 승인이
아니며**, core-v1의 다음 revision에서 01/사람이 재검토할 초안이다.

## 1. 구현 위치

- `src/domain/types.ts` — PlannerInput/CatalogSnapshot/CatalogSpot/PlanV2/PlanningResult/SwapResult.
  `DistrictId`/`TransitType`/`TravelTheme`는 기존 `src/types`를 재수출한다(중복 금액/리터럴 타입을
  새로 만들지 않음). `src/shared/api/dto.ts`(03 소유)의 DTO들과 필드명·형태가 동일하다 —
  후속 정리에서 dto.ts가 이 파일을 import하도록 합치는 것을 제안한다(현재는 03 소유 파일이라
  02가 직접 수정하지 않았다).
- `src/domain/validation.ts` — budgetKRW 1..1,000,000 / partySize 1..8 정수 검증
  (`src/server/application/plans/validatePlannerInput.ts`, 03 소유, 와 동일한 draft 범위).
- `src/domain/budgetEngine.ts` — `buildPlan`(core-v1 계약)과 `buildCheapestPlan`(02 확장,
  계약 밖). 전수 조합(brute force) 참조 구현이며 P1-03에서 인덱스/가지치기로 교체될 때 이
  파일의 결과와 비교해 정확성을 보존해야 한다.
- `src/domain/swapPlanSpot.ts` — core-v1의 swapPlanSpot.
- `src/domain/catalogAdapter.ts` — 기존 production 데이터(src/data)를 CatalogSnapshot으로 변환.
- `src/services/budgetCalculator.ts` — App.tsx 호환 facade(아래 4절).

## 2. all 권역 선택 (미결정 정책, 02가 임시 고정)

core-v1.md: "all 권역 선택과 기존 테마 점수의 상세 보존은 02의 P1-02 참조 구현 인계에서
고정하고 core-v1 다음 revision에 반영한다."

- **순수 엔진(`buildPlan`, `districtId: 'all'`)**: catalog에 존재하는 모든 권역을 독립적으로
  평가해 각 권역의 예산 내 최대 지출 조합을 구하고, 그중 총지출이 가장 큰 권역을 선택한다.
  동점은 districtId 코드포인트 사전순, 그다음 스팟 튜플 사전순으로 깬다. **테마 가중치를
  전혀 쓰지 않는다** — CatalogSnapshot에는 권역별 테마 메타데이터가 없고(그 값은 production
  전용 `AlleyDistrict`에만 있음), 순수 엔진이 production 데이터 구조에 의존하면 안 되기
  때문이다. `docs/contracts/fixtures/core-v1.json`은 'all' 케이스를 포함하지 않으므로 이
  규칙은 `src/domain/__tests__/budgetEngine.extra.test.ts`로만 검증했다.
- **facade(`generateTravelPlan`)**: 기존 UI/테스트 호환을 위해 순수 엔진에 넘기기 전에
  레거시 `selectDistrict`와 동일한 테마+예산 근접도 휴리스틱으로 구체 권역을 먼저 고른다.
  따라서 현재 UI 동작(예: ocean_healing 테마 → yeongdo)은 회귀하지 않는다. 즉 지금 "테마
  기반 all 선택"은 facade에만 존재하고 순수 계약 엔진에는 없다 — 01/제품 결정에 따라
  향후 CatalogSnapshot에 권역 메타데이터를 추가해 순수 엔진으로 옮길 수 있다.

## 3. 목적 함수와 동점 처리

- 카테고리 조합 중 **예산 이하에서 총지출을 최대화**하는 조합을 선택한다(레거시의
  fillRatio 최대화 의도를 유지하되 이제 인원수를 정확히 반영한다). 레거시에 있던
  테마별 가산점(cafe_dessert면 비싼 카페 우대 등)은 순수 엔진에서 제거했다 — core-v1.md가
  요구하는 결정론적 동점 규칙(스팟 튜플 사전순)과 충돌하지 않는 명확한 단일 기준을 위해서다.
  이 가산점 로직이 제품에 필요하면 별도 정책으로 01에 요청 바란다.
- 동점은 `[food.id, cafe.id, admission.id, snack?.id]` 튜플의 코드포인트 사전순(짧은
  튜플이 접두사면 더 작음)으로 깬다.
- `minimumRequiredKRW`(infeasible)는 스낵을 제외한 필수 3종 최저가 조합 기준이다(스낵은
  선택이라 포함하면 최소값이 늘어나기만 한다).

## 4. facade와 기존 결함 수정 (App.tsx 미변경 원칙 준수)

P1-04가 아직 해제되지 않아 `src/App.tsx`/컴포넌트는 수정하지 않았다. 따라서
`generateTravelPlan`/`swapSpotInPlan`은 기존 시그니처와 `TravelPlan`/`CourseItem` 모양을
그대로 유지한다. `TravelPlan`에는 옵션 필드 `feasibility?: PlanFeasibility`만 추가했다
(추가 전용 — 기존에 이 필드를 모르는 코드도 그대로 동작).

- **ENGINE-FIX-02 "인원 비용 미반영"**: facade가 이제 `budgetKRW`/`partySize`를 그대로
  domain에 전달하고, domain은 단가×partySize로 계산한다. partySize=1일 때는 기존과 값이
  완전히 같다(현재 App.tsx는 partySize를 항상 1로만 호출하므로 UI 회귀 없음). partySize>1은
  `src/services/__tests__/budgetCalculator.test.ts`의 신규 회귀 테스트로 검증했다.
- **ENGINE-FIX-02 "예산 초과 fallback"**: 레거시는 모든 조합이 예산을 넘으면 아무 표시 없이
  초과 조합을 반환했다. 이제 `buildPlan`이 infeasible/invalid면 참고용으로 `buildCheapestPlan`
  (계약 밖 02 확장, 예산 무시하고 최저가 조합 반환)의 결과를 보여주되
  `feasibility.status`에 실제 상태와 `minimumRequiredKRW`(가능하면)를 정직하게 남긴다.
  P1-04에서 UI가 이 필드를 읽어 사용자에게 경고를 보여줘야 한다 — 이번 변경은 "감추지 않는
  것"까지만 하고 UI 표시는 다음 작업이다.
- **SHARE-FIX-02(교체 제약)**: `swapSpotInPlan`이 이제 domain `swapPlanSpot`에 위임해
  같은 권역·카테고리·활성 ID만 허용하고, 예산 초과 교체는 원본 plan을 그대로 반환한다
  (자동 증액하지 않음). 교통 항목(order 1)은 카탈로그 스팟이 아니므로 교체 대상에서
  제외한다(레거시에서도 SPOTS_DATA에 transit 항목이 없어 사실상 no-op이었다).
- `src/services/planApi.ts`의 저장 실패 시 가짜 성공 링크, localStorage v2 검증은 P1-04
  범위이며 이번 P1-02에서는 다루지 않았다(assignments.md P1-02 해제 범위 밖).

## 5. production catalog 매핑 (draft-demo 정책과 분리)

`src/domain/catalogAdapter.ts`는 기존 `SPOTS_DATA`/`TRANSIT_COST_MODELS`를 그대로
`CatalogSnapshot`으로 옮긴다:

- `unitPriceKRW = Spot.price` — 이 필드는 이미 "1인 기준 평균 지출액"이라고 주석에 명시돼
  있으므로 이를 perPerson 단가로 쓰는 것은 새 가격 정책이 아니라 기존 필드 의미를 엔진에
  정확히 연결하는 것이다.
- `active = true` 고정 — 기존 Spot 타입에 활성 플래그가 없다.
- transit은 `perVehicleLegKRW = 0`, `vehicleCapacity = Infinity`로 두고 기존 단일 금액을
  `perPersonLegKRW`로만 사용한다. core-v1.md의 혼합교통(택시 동승) 공식은 fixture 전용
  draft-demo 값(3100/1550/6950/capacity 4)이며, 실제 택시 동승 요금·인원 정책을 새로
  만드는 것은 AGENTS.md #10/#11에 따라 사람 승인이 필요하다. 따라서 production catalog는
  "인원수만큼 선형 비례"만 하고 새 요금 정책을 도입하지 않았다.
- `catalogVersion = 'legacy-busan-alley-v1'`, `pricingPolicyVersion = 'legacy-flat-price-v1'`
  — "이미 있던 데이터를 정확한 엔진으로 계산한 것"이라는 점을 이름으로도 분명히 했다
  (새로 승인된 정책이라고 주장하지 않는다).

## 6. 03에 인계하는 것 / 인계하지 않는 것

인계(즉시 사용 가능, `docs/reports/handoffs/agent_02/P1-02-agent02-...md` 참조):
`src/domain/types.ts`(PlannerInput/CatalogSnapshot/PlanV2/PlanningResult/SwapResult),
`src/domain/budgetEngine.ts`(`buildPlan`), `src/domain/swapPlanSpot.ts`(`swapPlanSpot`),
`docs/contracts/fixtures/core-v1.json` 기준 20개 테스트 전부 PASS.

인계하지 않는 것: 서버 저장/ID/시각 부여(P1-05/03 소유), 실제 인증/정책 승인, all 권역의
테마 가중치(3절 참조, 향후 revision 대상), P1-03의 성능 최적화(현재는 brute force).

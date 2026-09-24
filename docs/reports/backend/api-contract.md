# P1-05 API / repository 인터페이스 — 조사 및 draft 준비

버전: backend-api-prep-v0.1.0-draft · 작성: agent_03 · 검토자: agent_01 · 상태: draft (in_progress)
기준 base_commit: `4cb7ca83069f58103707426f215de5c96bddfe01`

## 1. 현재 구현 조사 (실제 코드 기준, 목표 문서 아님)

`src/server/`에 실제 존재하는 파일과 동작:

- `src/server/server.ts` — `http.createServer`로 `apiHandler`를 직접 붙인 단일 진입점. PORT=3001 기본값.
- `src/server/app.ts` — `/api` prefix 라우팅을 하나의 함수에서 정규식으로 분기. 응답 envelope은
  `{ success: boolean, ... }` 형태이며 `docs/contracts/api-v1.md`가 정의한 `{data, requestId}`/`{error, requestId}`
  envelope과 **다르다**. requestId 개념 자체가 없다. CORS는 `*` 허용, 별도 인증 없음.
- `src/server/controllers/planController.ts` — `PlanController.createPlan/getPlan/likePlan/getPopularCurations/getSpots/getDistricts`.
  가격 재계산 없이 `dto.plan`을 그대로 저장한다(§3 참고 — 클라이언트가 보낸 합계를 신뢰).
- `src/server/storage/planStorage.ts` — **인메모리 Map**. 서버 재시작 시 전부 소실, seed 5건만 재생성.
  Idempotency-Key 개념 없음, slug 랜덤 생성 후 충돌만 재시도.
- `src/server/types.ts` — `SavedPlanEntity`, `CreatePlanDto` 등 기존 DTO. `PlanV2`/`schemaVersion` 없음, 기존 `TravelPlan`(services 쪽) 그대로 사용.
- `src/services/planApi.ts`(브라우저 측) — `fetch('/api/plans', ...)` 등 기존 경로를 직접 호출. `/api/v1`은 아직 없다.

결론: `docs/architecture/implementation/`과 `docs/contracts/api-v1.md`의 `/api/v1`, envelope, repository 경계는
**전부 목표 구조이며 현재 코드에는 없다.** 기존 `/api/plans` 등은 그대로 살아있고 여기에 손대는 순간
프론트엔드(02 소유)가 즉시 깨진다 — 호환 어댑터 없이 교체 금지.

## 2. C0(`docs/contracts/api-v1.md`, `core-v1.md`) 검토 의견 — 소비자(구현자) 관점

C0 상태는 `ready_for_review`(02 교차검토 전)이고 `docs/reports/coordination/assignments.md`가
아직 없어 accepted_handoffs로 기록되지 않았다. 아래는 실제 구현 전 확인이 필요한 항목이다.

1. **Idempotency-Key TTL** — api-v1.md가 "03 제안 후 확정"이라고 위임했다. 제안: `POST /api/v1/plans`
   scope 기준 **24시간** TTL. 근거: 익명 공유 링크 생성이라는 사용상황상 재시도는 대개 같은 세션(수분~수시간) 내에
   발생하고, 24시간이면 "새로고침 후 재제출" 같은 흔한 실패도 커버하면서 키 테이블이 무한정 커지지 않는다.
   만료 이후 같은 키 재사용은 새 요청으로 처리(신규 slug 발급)하며, 이 동작을 fixture에 추가할 것을 제안한다.
   **01 확정 필요.**
2. **레거시 어댑터 범위** — api-v1.md는 `/api/plans` 등 호환 adapter를 요구하는데, 현재 레거시가
   `success: boolean` envelope이라 `/api/v1`의 `{data,requestId}`/`{error,requestId}`와 공존시키려면
   어댑터 레이어가 두 envelope을 모두 만들어야 한다. 제안: 신규 `src/server/controllers/planController.ts`는
   `/api/v1`만 담당하고, 기존 파일은 이름을 유지한 채 내부에서 새 application 계층(`src/server/application/plans/`)을
   호출하는 thin wrapper로 축소한다. **파일 소유는 03 단독(assigned_paths 확인 후 실행)**이라 충돌 우려는 없으나,
   변경 범위가 기존 동작에 영향을 주므로 실행 전 01의 accepted_handoffs를 기다린다.
3. **RAG 응답의 `insufficient_evidence`/`clarify` 200 처리** — 현재 레거시 컨트롤러 패턴(status 필드 없이 success만)과
   다르므로 `src/server/controllers/rag/`는 처음부터 discriminated union 스타일로 새로 작성하는 편이 안전하다는
   의견. 기존 코드 재사용 없음.

## 3. 이번에 준비한 것 (코드, additive-only)

C0 fixture(`docs/contracts/fixtures/api-v1.json`, `core-v1.json`)가 이미 존재하고 구체적이라, "계약 기반 mock
테스트"(YAML 첫 실행 지침)를 진행했다. **기존 파일은 전혀 수정하지 않았고**, 새 디렉터리만 추가했다:

- `src/shared/api/dto.ts` — `ApiSuccess<T>`/`ApiError`, 에러 코드 상수, `PlannerInputDTO`, `CatalogSnapshotDTO`,
  `PlanV2DTO`, `CreatePlanRequestDTO`/`ResponseDTO`, `RecommendationRequestDTO`/`ResultDTO` (RAG 쪽 discriminated union
  포함). `docs/contracts/api-v1.md` + `core-v1.md` + `02-rag-system.md` §5의 타입을 그대로 옮겼다.
  **`src/server/**`를 import하지 않는다** (P1-05 acceptance 항목 충족 확인용으로 정적 검사 스크립트도 함께 둠).
- `src/server/repositories/planRepository.ts` — `CatalogRepository`/`PlanRepository` **인터페이스만** 정의.
  실제 PostgreSQL 구현은 P1-06(ENV-01, P1-02 선행)에서 진행하며 지금은 만들지 않는다.
- `src/server/repositories/inMemoryPlanRepository.ts` — 위 인터페이스의 **mock 구현**. 트랜잭션/영속성 보장이
  없으므로 이름과 파일 상단 주석에 "테스트 전용, 영속성 증거 아님"을 명시했다.
- `src/server/__tests__/apiV1Contract.test.ts` — `docs/contracts/fixtures/api-v1.json`/`core-v1.json`을 읽어
  save/missing/conflict/storage-down/clarify/insufficient/infeasible/model-down 8개 케이스의 envelope 모양을
  mock repository로 검증한다. **실제 HTTP 서버(app.ts)나 실제 DB를 통과한 테스트가 아니다** — 이 사실을 테스트
  파일 상단과 아래 §4에 반복해서 명시한다.

## 4. 실제로 하지 않은 것 (과대 보고 방지)

- `/api/v1` 라우트를 `src/server/app.ts`에 등록하지 않았다 (app.ts 수정은 assigned_paths 확정 후).
- `PostgreSQL` 연결/`db/migrations/`를 만들지 않았다 (P1-06, ENV-01 의존).
- 기존 `/api/plans` 등 레거시 엔드포인트를 전혀 바꾸지 않았다.
- 위 mock 테스트를 "실제 저장 통과"로 보고하지 않는다. `vitest run src/server/__tests__/apiV1Contract.test.ts` 결과만
  근거이며, 이는 DTO 모양과 mock repository 로직만 검증한다.

## 5. 검증 명령과 결과

`docs/reports/handoffs/agent_03/P1-05-<run_id>.md`에 실제 실행 로그를 남긴다(이 문서는 설계/조사 문서라 커맨드
출력은 handoff 쪽에 둔다).

## 6. 01에게 요청하는 것 (dependency_request)

1. Idempotency-Key TTL 24시간 제안 승인 또는 대안 지정.
2. `docs/reports/coordination/assignments.md` 작성 및 C0 accepted_handoffs 기록 — 이후 03이
   `src/server/app.ts`에 `/api/v1` 라우트를 실제로 등록하고 레거시 어댑터를 구현하는 단계로 진행한다.
3. 위 §2-2 레거시 어댑터 리팩터링 방향(기존 컨트롤러를 thin wrapper로 축소)에 대한 동의 여부.

## 7. rc2/rc3 동기화 (agent_01 assignments.md 10:25 갱신 반영)

01의 `docs/reports/coordination/assignments.md`(run_id `agent01-20260924T100749+0900-4cb7ca8`)와
`docs/reports/coordination/dependency-requests.md`(10:25 갱신)를 확인했다. 아래를 반영했다.

1. **assigned_paths 확정 수신**: `src/shared/api/**`, `src/server/application/plans/**`,
   `src/server/repositories/**`, `src/server/__tests__/apiV1Contract.test.ts`, `data/rag/sources/**`,
   `evals/rag/datasets/**` — additive 준비에 한정, DB/실제 route/기존 controller 변경은 여전히 보류.
2. **api-v1.0.0-rc3 동기화**: `RecommendationRequestDTO.constraints`를 `PlannerInputDTO`(필수) →
   `Partial<PlannerInputDTO>`(optional)로 수정. `checkRecommendationConstraints()`
   (`src/server/application/plans/validatePlannerInput.ts`)를 추가해 rc3 4개 requestCases 검증:
   - `missing-budget-party`(필수 필드 없음) → clarify(200) ✅
   - `invalid-provided-party`(partySize=0) → INVALID_INPUT(400) ✅
   - `invalid-party-type`(partySize="two") → INVALID_INPUT(400) ✅
   - `conflicting-budget`(자연어 "5만원" vs constraints.budgetKRW=30000) → **이 계층에서 판단 불가로 명시**.
     이 함수는 개별 필드 형식만 보고 'complete'를 반환한다. 실제 rc3 기대값(clarify)은 query 텍스트
     파싱이 필요해 P2-04(extractConstraints) 몫이며, 테스트에 그 이유를 그대로 남겨 미완료를 숨기지 않았다.
3. **Idempotency-Key TTL 24h 제안 구체화** (01이 "정확한 만료 경계/키 scope/정규화 hash fixture" 요청):
   - `IDEMPOTENCY_KEY_TTL_HOURS = 24` 상수화 (`src/server/repositories/planRepository.ts`), 경계는
     `now >= createdAt + 24h`를 만료로 정의(포함).
   - 만료 전: 같은 scope+key+같은 hash → replayed / 다른 hash → conflict(시간 무관).
   - 만료 후: 기존 레코드 무시, 같은 hash든 다른 hash든 완전히 새 레코드(새 slug) — conflict 아님.
   - `normalizeRequestHash()`(`src/server/application/plans/normalizeRequestHash.ts`): 객체 키 재귀
     정렬 후 JSON.stringify → sha256. 키 순서가 달라도 같은 해시, 값이 다르면 다른 해시임을 테스트로 확인.
   - `InMemoryPlanRepository`에 시계 주입(`now: () => Date`)을 추가해 23시간59분59.999초/24시간 정확
     경계 두 지점을 모두 테스트로 재현했다(둘 다 통과). **이 TTL은 여전히 03의 로컬 mock 제안이며
     production 정책 승인이 아니다** — 01의 최종 확정을 기다린다.
4. **도메인 타입 중복 리터럴**: `DistrictIdOrAll`/`TravelThemeDTO`/`TransitTypeDTO`는 여전히 draft
   리터럴 재선언 상태다. 02의 P1-02 인계 후 실제 도메인 타입을 브라우저 안전하게 재노출(alias)하는
   작업으로 교체할 예정이며, 지금 임의로 통합하지 않았다.

검증: `npx tsc --noEmit` exit 0, `npx vitest run src/server/__tests__/apiV1Contract.test.ts src/server/__tests__/planApi.test.ts src/services/__tests__/budgetCalculator.test.ts` → 3 files / 26 tests passed (apiV1Contract 16개, 신규 6개는 rc3 requestCases 4개 + TTL/hash 2개 세트).

## 8. 관찰 사항 (내 소유 범위 밖, 01/02 참고용)

`npx vitest run`(인자 없이 전체 실행)이 `chain/node_modules.broken.1790214643/zod/**`의 테스트 파일까지
수집해 3개 스위트가 fail한다(모듈 경로 깨짐, zod 패키지 내부 테스트). `chain/`은 04 소유이고 이 이름의
폴더는 vitest 기본 제외 패턴(`**/node_modules/**`)에 걸리지 않는 `node_modules.broken.*` 이름이라 새는
것으로 보인다. 내 파일들만 지정해 실행하면 문제없이 통과한다(§7 검증 명령). 루트 `vitest`/CI 설정은
02 소유라 내가 고치지 않았고, 02/01에게 참고로만 남긴다.

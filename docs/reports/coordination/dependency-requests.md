# 담당자 요청 큐

run_id agent01-20260924T100749+0900-4cb7ca8. 요청은 파일 인계로 게시하며 task 주소가 확인된 02에게만 직접 전달했다. 03/04에게 실제 전달됐다고 주장하지 않는다. 응답은 각자 handoff 디렉터리에 작성하고 01에게 경로/버전을 알린다.

| request_id | from_agent → to_agent | consumer_work_item | requested_paths_or_interface | request_schema | response_fixture | blocking_scope | needed_before | verification_expectation |
|---|---|---|---|---|---|---|---|---|
|C0-REVIEW-02|01→02|C0|docs/contracts/**, tests/e2e/c0-fixtures.check.mjs, 01 QA/조정 문서|대상 hash, verdict, 파일별 수정 요구, 실행 증거|core/api/claim-v1 rc1|C0 수용 및 후속 실제 연결|P1-02/P1-05/P2-01/P3-01 해제 전|산술/스키마/신뢰 경계/정책 초안 표기 교차 검토, 01 자가 검증을 독립으로 인정하지 않음|
|ENV-BASELINE-02|01→02|P1-07|루트 기존 lock 설치와 baseline|runtime, install 결과, raw 테스트/빌드, 측정 창|원본+seed 1000/10000|실행 환경·성능 QA|P1-01 인계|npm test/build 재현; warmup10/100회/2초 timeout 포함|
|ENGINE-FIX-02|01→02|P1-07|src/services/budgetCalculator.ts, src/domain, src/types|입력/예상/실제/수정 commit|core-v1.json|계산 정확성|P1-02 인계|2인 비용, 1원 예산 불가능, 다른 권역/카테고리 교체 거절, 원본 불변|
|SHARE-FIX-02|01→02|P1-07|src/services/planApi.ts, src/App.tsx|저장 fetch reject와 UI 관찰|STORAGE_UNAVAILABLE|저장/공유 오류|P1-04 인계|실패에 success/local-* 공유 링크 없음, 손상 저장 복구, 입력20회 최신 결과|
|BACKEND-HANDOFF-03|01→03|P1-07,P2-06|P1-05/P1-06 및 P2-04/P2-06-ENGINE 인계|YAML 필수 handoff 필드+patch/hash+DB namespace|api-v1.json, held-out dataset/corpus|실제 저장/RAG QA|해당 QA 전|위조 합계/ID 거절; 재시작/동시 멱등/DB 장애; 고정40개 held-out와 원문/모델 평가|
|CLAIM-HANDOFF-04|01→04|P3-07|chain/fixtures, P3-03/P3-06 인계와 03용 repository 요청|typed data 해시/도메인/ABI metadata/명령, 개인키 제외|claim-v1.json|서버/체인/wallet 해시 동등성 및 발급 QA|P3-01 및 P3-07 전|정확 keccak/EIP-712 벡터, 변조/재사용/경계 거절, 별도 DB reorg 재구축|

02에는 C0/환경 요청을 task 메시지로 전달함. 구현 수정 요구 ENGINE-FIX/SHARE-FIX는 기존 정적 발견이며 실행 재현 완료와 구분한다. 세부 위치/조건은 qa/P1.md에 기록. 01은 제품 코드를 직접 변경하지 않는다.

10:25 갱신: ENGINE-FIX/SHARE-FIX 및 위조 저장/Map 유실은 legacy-defects.log로 실행 재현 완료. 03 초안 DTO는 api rc1의 필수 constraints가 남아 있으므로 api-v1.0.0-rc3의 optional Partial로 동기화해야 한다. BACKEND-HANDOFF-03에 실제 run_id/배정 수신 확인/최신 계약 버전과 TTL 경계 fixture도 포함한다. 03 직접 task 통지는 도구의 No Codex thread found로 실패하여 파일 인계를 유지한다.

15:28 KST 갱신: 01의 신규 `tests/e2e/p3-current.probe.mjs` 독립 실행으로 04 provisional 코드(P3-04/P3-06) 4건
위반 재현. 03의 db/migrations/0030_stamps_core.sql, 0031_chain_indexer.sql 및 docs/reports/backend/pglite-smoke-check.mjs가
shared checkout에 관측되었으나 common_protocol.handoff 필수 필드를 갖춘 정식 handoff 문서가 아직 없어 accepted_handoffs에
등재하지 않는다(이전 03 additive 파일과 동일 원칙).

| request_id | from_agent → to_agent | consumer_work_item | requested_paths_or_interface | request_schema | response_fixture | blocking_scope | needed_before | verification_expectation |
|---|---|---|---|---|---|---|---|---|
|P3-PROBE-04|01→04|P3-07|src/server/application/stamps/{authorizationService,visitService}.ts, src/server/controllers/stamps/stampsController.ts, jobs/chain-indexer/indexer.ts|위반 id/재현 입력/실제·기대 값(qa/P3.md "01 독립 provisional 코드 probe" 표)|해당 없음(버그 수정 요구)|P3-04/P3-06을 provisional에서 "수정 완료"로 올리기 전|같은 visit 중복 key 발급 정책 확정 후 재발급 거절 또는 기존 승인 재사용, authorization TTL을 visit TTL과 분리, status가 실제 상태에서 pending 유도, reorg로 체인이 cursor보다 짧아지면 up_to_date 대신 명시적 무효화/unavailable 반환. 수정 후 01이 동일 probe로 재검증|
|P3-DB-HANDOFF-03|01→03|P3-07|db/migrations/0030_stamps_core.sql, db/migrations/0031_chain_indexer.sql, docs/reports/backend/pglite-smoke-check.mjs|common_protocol.handoff 필수 필드 전체(work_item_id는 P3-DB로 제안)|해당 없음(정식 인계 요청)|04의 StampsRepository/IndexerRepository 실제 PostgreSQL 연동 전환 및 01의 accepted_handoffs 등재 전|정식 handoff에 run_id/base_commit/변경파일/검증 명령(pglite smoke 결과 포함)/dependency_requests 기재, db-namespace-plan.md에 0031 대역 실제 사용 내역 반영|


15:33 KST 긴급 갱신: 01이 shared checkout 전체에서 독립 `npm run build`(`tsc && vite build`)를 재실행해 **현재 build가 실패함을 확인**(`npx vitest run`은 10 files/57 tests 전부 PASS, `npm test`는 정상). tsc 11개 오류 전부 P1-05/P3-04 handoff 이후 관찰된, 아직 handoff되지 않은 신규 파일에서 발생한다. 이 실패는 02/03/04 모두의 다음 accepted_handoffs 판정을 막으므로 priority_queue보다 우선해 두 요청을 게시한다.

| request_id | from_agent → to_agent | consumer_work_item | requested_paths_or_interface | request_schema | response_fixture | blocking_scope | needed_before | verification_expectation |
|---|---|---|---|---|---|---|---|---|
|BUILD-FIX-03|01→03|전체(P1-07 선행)|src/server/repositories/pgStampsRepository.ts|tsc 오류 9건: `Row extends Record<string, unknown>` 제약을 WalletChallengeRow/WalletSessionRow/VisitRequestRow/StampAuthorizationRow(모두 명시적 인덱스 시그니처 없음)가 만족하지 못함(TS2344, 9곳). Clock/NonceGenerator import는 미사용(TS6196, 2곳— 위 9건과 별도 집계 없이 총 11개 오류 중 2개)|해당 없음(빌드 오류 수정 요구)|`npm run build` PASS 전, 이 파일을 포함한 어떤 handoff도 accepted 불가|Row 타입에 인덱스 시그니처를 추가하거나 `SqlExecutor.query`의 제약을 완화. 수정 후 01이 동일 `npm run build`로 재검증. 이 파일과 db/migrations 0030/0031은 정식 handoff(P3-DB-HANDOFF-03) 제출 시 함께 기재할 것|
|BUILD-FIX-04|01→04|전체(P1-07 선행)|src/server/controllers/stamps/stampsController.ts|tsc 오류 2건(TS6196 'Hex' 미사용, TS6133 'StampsApplicationError' 미사용) — P3-04 handoff의 "npx tsc --noEmit exit 0" 주장 이후 파일이 변경되었거나 부분 스코프 실행이라 놓친 것으로 보임. 원인을 단정하지 않는다|해당 없음|`npm run build` PASS 전|미사용 import 제거 또는 실제 사용. 수정 후 01이 동일 `npm run build`로 재검증하고 P3-04 handoff의 검증 기록과 대조|

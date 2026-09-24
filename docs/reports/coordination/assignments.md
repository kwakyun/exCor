# 실행 배정 및 인계 원장

작성 2026-09-24 KST · coordinator agent_01
run_id: `agent01-20260924T100749+0900-4cb7ca8`
base_commit: `4cb7ca83069f58103707426f215de5c96bddfe01`
checkout_path: `C:/WorkSpace/MGG/github-upgrades/busan-alley-balancer`
branch: `feature/busan-alley-budget-planner`
mode: execution (현재 사용자 C0/배정/리뷰/QA 실행 요청). 추가 에이전트 생성 없음.

## 승인 근거와 미결정 정책

- A0: 현재 사용자 요청으로 01의 계약·fixture·QA 문서/테스트 작성, 02/03/04 작업 배정, 인계 검토가 승인됨. 제품 코드는 01이 수정하지 않는다.
- A1: 각 구현 담당의 별도 사용자 실행 요청은 해당 담당 handoff에 기록한다. 이 배정은 사용자 요청 범위 안의 실행 입력이며 외부 게시·배포·운영 권한을 부여하지 않는다.
- 기존 승인 재요청 없음. 읽은 계획은 '제안/초안'으로 표시되어 있으며 별도의 가격·인원·운영 인증·DB 환경·모델 비용·공개 체인 정책 승인 기록은 확인되지 않았다. 미확인을 거절로 해석하지 않는다.
- 초안 정책: 예산 1..1,000,000/인원1..8, 혼합교통 구성/차량정원, DB 실행 환경, 모델/비용 상한, 실방문 확인자/공개 지갑 세션/보존, 공개 테스트넷/RPC/확정 수. local fixture와 인터페이스 준비는 계속한다. 실제 정책 적용은 기존 승인 증거 또는 구체 결정과 연결한다.

## 공유 checkout 잠금

미추적 계획 문서를 모든 담당자가 읽어야 하므로 이번 실행은 공유 checkout을 선택한다. HEAD 초기 제품 tracked diff 없음. 기존 미추적 implementation/upgrade-strategy/prompts 문서는 사용자 산출물로 보존한다.
모든 에이전트는 브랜치 전환/reset/clean/stash/merge/cherry-pick을 하지 않는다. 전체 stage/commit 금지. commit이 필요하면 01이 통합 창을 기록하고 해당 소유자가 자신의 명시적 파일만 처리한다. 소유권 밖 수정은 dependency_request로 요청한다.
소유권은 01 YAML ownership_registry를 그대로 적용한다. 아래 assigned_paths는 해당 registry와 교집합이며 다른 경로를 묵시적으로 확장하지 않는다.
루트 package/lock/CI/install은 02, chain package/lock/install은 04. migration 번호/테이블/repository와 app.ts/shared API는 03, domain/types/UI는 02. docs/contracts/coordination/qa/review와 tests/e2e는 01. 인계 문서는 각자 자기 agent 디렉터리만 쓴다.
node_modules 설치는 02가 기존 lock 기준 npm ci부터 수행하고 lock 변경 필요 시 근거를 기록한다. 다른 담당은 루트 install하지 않는다. 서버/체인 새 패키지는 각각 02/04 창구에 요청한다.
포트 5173/3001/8545는 예약 확정하지 않음(점유 조회가 유효 목록을 반환하지 못함). 시작 담당자가 점유 확인 후 빈 포트 사용, 타 프로세스 종료 금지. 03이 테스트 DB namespace와 migration version 발급, 04가 로컬 체인 metadata 발급. QA reorg/reset은 별도 로컬 노드 또는 예약된 창만 사용.
CPU 측정 창: 02가 의존성 설치 후 시작/종료 시각을 자신의 handoff로 알리는 첫 최대 10분 창을 우선 배정. 그 창에 01/03/04는 빌드·모델평가·Hardhat 대량 테스트 금지. 이번 01 검사는 아직 정식 benchmark가 아니다.

## 최초 배정

모든 배정의 base_commit/checkout은 위와 같다. agent별 run_id는 실제 시작 시각을 제출하고 아래에 고정한다.

| 담당 | run_id | 최초 work_item / mode | assigned_paths | 완료/해제 조건 |
|---|---|---|---|---|
|01|agent01-20260924T100749+0900-4cb7ca8|C0 execution; 후속 QA는 준비|docs/contracts/**, docs/reports/coordination/**, docs/reports/qa/**, docs/reports/review/**, tests/e2e/**, docs/reports/handoffs/agent_01/**|02 교차 검토, 실제 증거|
|02|agent02-20260924T100752+0900-4cb7ca8 (본인 제출)|P1-01 execution + C0 교차 검토|benchmarks/**, docs/reports/performance/**, docs/reports/handoffs/agent_02/**; 기존 lock npm ci 허용(node_modules)|환경/실패/원본·seed 확대 fixture/raw baseline; C0 리뷰|
|03|미착수: 본인 실제 run_id 제출 필요|API/출처 현황 준비 execution; P1-05/P2-01 provisional|docs/reports/backend/**, docs/reports/rag/**, docs/reports/handoffs/agent_03/**|API/repository/출처 초안; C0 수용 전 실제 연결 금지|
|04|미착수: 본인 실제 run_id 제출 필요|계약/서명 fixture 초안 execution; P3-01 provisional|chain/fixtures/**, docs/reports/onchain/**, docs/reports/handoffs/agent_04/**|해시 생성 요구/신뢰 경계/03 repository 요청; C0 수용 전 실제 연결 금지|

미착수 run_id를 꾸며서 실제값으로 채우지 않는다. 두 담당이 시작 보고하면 01이 기록한다. 각 담당의 후속 write_scope 전체는 YAML 소유권을 따르지만 현재 배정 경로 밖 작업은 아래 해제 시 구체 경로를 추가 기록한다.

## accepted_handoffs 및 해제

| accepted_handoffs | 버전/기준 | 검토 및 증거 | 수용 범위 |
|---|---|---|---|
|C0|core-v1.0.0-rc2 / api-v1.0.0-rc3 / claim-v1.0.0-rc1; 위 base_commit|02 C0-REVIEW-final-agent02-20260924T100752+0900-4cb7ca8.md 및 C0-reviewed-hashes JSON; 01이 계약6/검사2 hash 일치 확인; check6 PASS|문서/합성 fixture 소비, 운영 정책/crypto 일치/제품 완료 아님|
|P1-01|legacy HEAD 4cb7ca8, agent02-20260924T100752+0900-4cb7ca8|P1-01 handoff + P1-01-artifact-hashes JSON; source/lock/snapshot hash 일치, raw p95 재계산, 독립 기존 test10/build PASS, corrected HTTP3 smoke 증거|기준 측정/환경/기존 결함 기록 수용; browser 미측정과 10k timeout 명시 유지|

수용일 2026-09-24 KST. 공유 uncommitted patch를 hash로 고정했으며 commit 수용이라고 표현하지 않는다. 02가 검토한 조정 문서 hash 이후의 상태 갱신은 원장 변경 이력이며 계약의 암묵적 재승인이 아니다.
P1-01 수용 후 ENV-01; C0+P1-01 후 P1-02. P1-02 타입/fixture 인계를 최적화 완료보다 먼저 처리한다. P3-DB/ROUTES 요청은 장기 RAG 튜닝보다 우선.

### 해제된 실행 배정 (C0/P1-01 수용 후)

- 02 ENV-01: `package.json`, `package-lock.json`, `tsconfig*.json`, `vite.config.ts`, `scripts/**`, `.env.example`, `.gitignore`, `docs/runbooks/**`, `docs/reports/environment/**`, `docs/reports/handoffs/agent_02/**`. 현재 존재하는 API entrypoint와 개발/검증 명령을 우선. 미존재 DB/작업 프로세스 script를 동작한다고 기록 금지. CI 권한 변경 없음.
- 02 P1-02 (ENV-01 최소 인계 이후 순차): `src/domain/**`, `src/types/**`, `src/data/**`, `src/services/budgetCalculator.ts`, `src/services/__tests__/**`, `benchmarks/**`, `docs/reports/performance/**`, `docs/reports/handoffs/agent_02/**`. core fixture 기준 순수 엔진/느린 참조 구현/호환 facade. 인원·요금은 draft-demo 정책으로 격리하고 all 권역/테마 보존 명세를 01에 먼저 인계. 다른 UI 파일은 P1-04 해제 전 수정하지 않는다.
- 03 P1-05: `src/shared/api/**`, `src/server/application/plans/**`, `src/server/repositories/**`, `src/server/controllers/planController.ts`, `src/server/app.ts`, `src/server/types.ts`, `src/server/__tests__/**`, `docs/reports/backend/**`, `docs/reports/handoffs/agent_03/**`. C0에 맞는 DTO/transport/legacy adapter와 mock engine까지. 실제 엔진·DB 연결은 P1-02/ENV-01/P1-05 수용 뒤 P1-06에서 수행한다.
- 03 P2-01: `data/rag/sources/**`, `evals/rag/datasets/**`, `docs/reports/rag/**`, `docs/reports/handoffs/agent_03/**`. 허용 출처/평가 초안 준비. 외부 유료 provider 계약/공개 수집 허용을 새로 가정하지 않는다.
- 04 P3-01: `chain/fixtures/**`, `docs/reports/onchain/**`, `docs/reports/handoffs/agent_04/**`. claim-v1 rc1 입력 기반 hash vector/정책 경계/03용 DB 및 02용 wallet 인터페이스 요구. chain dependency 설치 필요는 chain 자체 package/lock 추가 요청을 통해 범위를 명시한다. 실제 방문/공개 인증/배포는 미해제.

03/04의 실제 run_id/수신 확인은 여전히 제출 필요. 이 해제는 새로운 에이전트 실행을 뜻하지 않는다. 현재 사용자 '이어서 진행' 지시에 따라 기존 실행 범위를 지속한다.

## 27개 실행 항목 / 원래 20개 작업 추적

| 실행 ID | owner | 원 작업 | 선행 |
|---|---|---|---|
|C0|01|공통 보조|없음|
|P1-01|02|P1-01|없음|
|ENV-01|02|공통 보조|P1-01|
|P1-02|02|P1-02|C0,P1-01|
|P1-03|02|P1-03|P1-02|
|P1-04|02|P1-04|P1-02|
|P1-05|03|P1-05|C0|
|P1-06|03|P1-06|P1-05,P1-02,ENV-01|
|P1-07|01|P1-07|P1-03,P1-04,P1-06|
|UI-CONTRACTS|02|공통 보조|C0,P1-04|
|P2-01|03|P2-01|C0|
|P2-02|03|P2-02|P2-01,P1-06|
|P2-03|03|P2-03|P2-02|
|P2-04|03|P2-04|P2-03,P1-02|
|P2-05|02|P2-05|UI-CONTRACTS,P2-04|
|P2-06-ENGINE|03|P2-06|P2-04|
|P2-06|01|P2-06|P2-05,P2-06-ENGINE|
|P3-01|04|P3-01|C0|
|P3-02|04|P3-02|P3-01|
|P3-03|04|P3-03|P3-02|
|P3-DB|03|P3-04,P3-06|P3-01,P1-06|
|P3-04|04|P3-04|P3-01,P3-DB|
|P3-ROUTES|03|P3-04|P3-04|
|P3-05|02|P3-05|UI-CONTRACTS,P3-02,P3-ROUTES|
|P3-06|04|P3-06|P3-02,P3-DB|
|P3-07|01|P3-07|P3-03,P3-05,P3-06|
|INTEGRATION-01|01|統合 보조|P1-07,P2-06,P3-07|

## 이벤트

- 10:07 KST: HEAD/환경 확인. Node v24.15.0, npm 11.12.1, Windows PowerShell. 실제 제품은 legacy engine/Map API. domain/v1 API/RAG/chain/DB/evals 없음.
- 02 시작 연락 및 A02-ASSIGN-001 수신. 위 P1-01 배정/설치/측정 창으로 응답. 02 연락 task: 01a0d0f3-bb80-7ae0-a487-249e20ec9f29.
- 01 npm test/build 실제 실행 exit 1: vitest/tsc 없음. 환경 실패로 QA BLOCKED, 같은 실패 반복하지 않음.
- C0 rc1 및 QA fixture/계획 작성; 02 교차 검토 요청은 dependency-requests.md의 C0-REVIEW-02 참조.
- 02 설치 및 CPU 측정 창 종료 통보 수신. Node 의존성 환경 해소; P1-01 정식 인계는 아직 검토 전. agent02가 보고한 1000 uniform p95=121.5915ms, skewed=23.1443ms 및 10000 timeout은 raw 검토 후 별도 수용.
- 10:16~10:18: 01 독립 build PASS 및 기존 Vitest10 PASS. 01 Node 검사와 Vitest 수집 충돌을 .check.mjs로 분리해 해결. 제품 코드 변경 없음.
- 02 사전 C0 검토 반영: api-v1.0.0-rc2, RAG 부분 조건 DTO 및 완전 저장/추천 성공 fixture. core/claim은 rc1 유지. 정식 교차 검토 대기.
- 01 legacy probe에서 정확성 위반6건 재현(exit1); 담당 수정 요구는 dependency-requests 및 qa/P1.md. 기존 테스트 통과를 제품 AC 통과로 간주하지 않음.
- 기존 task 목록 조회: 에이전트1/에이전트2만 확인. 03/04 별도 task 주소는 아직 확인되지 않아 파일 인계를 유지하며 새 task를 만들지 않음.
- 10:24: 03의 additive DTO/mock/자료 초안 파일이 shared checkout에서 관측됨. 정식 handoff 및 run_id 미수신 상태라 수용하지 않음. 02가 전달한 03 task ID로 직접 통지했으나 도구가 No Codex thread found 반환. 아래 파일 기반 배정/요청을 03의 다음 안전한 경계에서 확인해야 함.

### 03의 독립 준비 범위 보완 (10:25 KST)

P1-05/P2-01 provisional 작업의 assigned_paths에 `src/shared/api/**`, `src/server/application/plans/**`, `src/server/repositories/**`, `src/server/__tests__/apiV1Contract.test.ts`, `data/rag/sources/**`, `evals/rag/datasets/**`를 추가한다. additive DTO/mock/테스트·출처 초안 준비에 한정하며 DB/실제 route/기존 controller 변경은 C0 수용 후 별도 해제한다. 현재 발견 파일은 자동 accepted가 아니다.
03은 작업 시작 run_id와 이번 배정의 수신을 handoff에 기입한다. API 최신 계약은 api-v1.0.0-rc3이며 RecommendationRequestDTO의 constraints는 optional Partial이어야 한다. 도메인 타입의 중복 리터럴은 임시 draft로만 두고 02 P1-02 인계 후 도메인 타입을 브라우저 안전 import/alias로 소비한다.
03 TTL24h 제안은 읽었으며 production 정책 승인이 아닌 로컬 mock 후보로 허용한다. 정확한 만료 경계/키 scope/정규화 hash fixture를 제출한 뒤 API 계약 revision으로 조정한다. 기존 legacy adapter를 없애거나 route 통합 완료로 표시하지 않는다.

원장은 로컬 조정 산출물이다. GitHub Issue/PR/CI 게시·사람 승인·merge는 이번에 수행하지 않았으며 공식 원격 상태로 주장하지 않는다.

### 15:28 KST 갱신 (사용자 '이어서 진행' 재개)

- P1-01: 02 보완 제출(README/snapshot/source-hashes/port 수정) 검토 완료, `docs/reports/review/P1-01-agent02-initial.md`에 **accepted**로 기록. 위 accepted_handoffs 표와 일치하며 변경 없음.
- P2-01: `docs/reports/review/P2-01-agent03.md`에 **changes_requested** 기록(정답 근거 100/100 공백, clarify 경계 q-001~030/091~100, 합성 fixture와 실제 catalog 가격 불일치 q-031/q-050, dev/holdout 근접 표현 누출 의심 4쌍, 공격 10건 오염 fixture 부재 — 5개 Required). data.go.kr 부산명소/맛집 API 2건은 `terms_checked-development-candidate`로 승인 후보 표시, 나머지 외부 출처는 미검증 유지. eval-v1-draft는 eval-v1.0.0으로 승격하지 않았다. P2-01은 accepted_handoffs에 등재하지 않는다.
- P3-DB 관측: `db/migrations/0030_stamps_core.sql`, `0031_chain_indexer.sql`, `docs/reports/backend/pglite-smoke-check.mjs`가 shared checkout에서 관측됨(03 작성 추정, STAMPS-DB-04 응답). 정식 handoff 문서 없음 — dependency-requests.md의 P3-DB-HANDOFF-03으로 요청, **accepted_handoffs에 등재하지 않음**. 03의 이전 additive 파일과 동일하게 자동 승인 아님 원칙 적용.
- P3-07 관련: 01이 `tests/e2e/p3-current.probe.mjs`를 신규 작성·실행(esbuild in-memory, 04 provisional 코드 대상). exit1, 4건 위반 재현(같은 visit 중복 key 재발급, authorization TTL이 visit TTL에 종속되는 결함, pending 상태 항상 false, reorg로 체인이 짧아져도 up_to_date 오판). 상세는 `docs/reports/qa/P3.md`와 `docs/reports/qa/evidence/p3-probe.log`. dependency-requests.md P3-PROBE-04로 04에 수정 요구 전달.
- 04/02의 이전 dependency_requests(STAMPS-DB-04, ABI/wallet fixture)는 위 03 관측 산출물과 연결되나, 03의 정식 handoff 수신 전까지 P3-04/P3-06을 "실제 연동"으로 전환하지 않는다.
- 새로 해제하는 실행 배정 없음. C0/P1-01 accepted_handoffs는 변경 없이 유지. P1-02/ENV-01/P1-05/P2-01(준비)/P3-01 배정 범위도 변경 없음 — P2-01은 배정된 "준비" 작업 자체는 유효하나 그 산출물(평가셋)의 최종 정답 승격만 changes_requested.
- 03/04 실제 run_id 제출은 이번 갱신에서도 여전히 파일 기반 확인(agent_03: a03-20260924-c0prep-01 및 agent03-20260924T105400+0900-4cb7ca8; agent_04: agent04-20260924T113206+0900-4cb7ca8)만 존재하고 별도 task 착수 통지는 이전과 동일하게 확인되지 않는다. 새 에이전트 생성 없음, 제품 코드 무수정 유지.

### 15:33 KST 긴급: 현재 `npm run build` 실패 확인 (BUILD-FIX-03 / BUILD-FIX-04)

01 독립 재현: `npx vitest run` 전체 10 files/57 tests PASS, `npx tsc --noEmit`(=`npm run build`의 첫 단계) **exit code 0 아님, 11개 오류**. 오류는 모두 신규/미인계 파일: `src/server/repositories/pgStampsRepository.ts`(03, TS2344 9건 + TS6196 2건 중 일부) 및 `src/server/controllers/stamps/stampsController.ts`(04, TS6196/TS6133 각 1건). 상세는 dependency-requests.md BUILD-FIX-03/BUILD-FIX-04.
빌드 실패 상태에서는 P1-05(03)/P3-DB/P3-04/P3-06(04) 어떤 것도 accepted_handoffs에 등재하지 않는다. 02/04의 병렬 작업 자체는 이 파일들을 직접 건드리지 않는 한 계속 가능(소유권 분리 유지)하나, 최종 `npm run build` 검증은 이 두 수정 이후 재실행해야 한다.
이 발견은 P1-06/P2-02 등 후속 작업을 새로 막지 않는다(해당 파일과 무관) — 단, "빌드 전체 PASS"를 요구하는 모든 accepted 판정에는 지금부터 적용한다.

### 15:34 KST: api-v1 rc4 — Idempotency-Key TTL 24h 확정 (dep-a03-005 응답)

`docs/contracts/api-v1.md`를 rc3→rc4로 갱신: 03의 dep-a03-005 제안(IDEMPOTENCY_KEY_TTL_HOURS=24, 경계 23:59:59.999 유효/24:00:00.000 만료)을 로컬/개발 기본값으로 그대로 채택해 문서에 명시했다. 공개 운영 보존 정책과는 분리해 표기했다(사람 승인 필요 항목 아님, 구현 상수 확정임을 명확히 함). `docs/contracts/fixtures/api-v1.json`의 version 필드도 rc4로 갱신. `node --test tests/e2e/c0-fixtures.check.mjs` 6/6 재확인. `docs/reports/qa/evidence/c0-artifact-hashes.json`의 두 파일 hash 갱신, capturedAt 갱신.
02 교차 검토 대기(C0 후속 변경이므로 동일 절차 적용). 03은 P1-06에서 이 확정값을 그대로 사용하면 된다 — dep-a03-005는 이 갱신으로 응답 완료, 재요청 불필요.

# P3-04: 지갑 인증·방문 승인·claim 발급 API (agent_04)

- run_id: agent04-20260924T113206+0900-4cb7ca8
- base_commit: 4cb7ca83069f58103707426f215de5c96bddfe01
- **상태: provisional (mock 전용).** `depends_on: [P3-01, P3-DB]` 중 P3-DB(03의 실제 DB
  repository)가 아직 제출/수용되지 않았다(`assignments.md`: "03/04 실제 run 제출 필요",
  `accepted_handoffs: []`). 04-onchain.yaml `readiness.provisional_work`에 따라, 승인된
  계약 fixture(claim-v1)로 in-memory repository test double을 사용한 단위 테스트까지만
  진행했고 **이것을 실제 연동 성공이나 완료로 표시하지 않는다.**

## 구성 요소 (write_scope 내에서만 작성, `app.ts`/DB/route 등록은 미수정)

- `src/server/application/stamps/ports.ts` — 03에게 요구하는 실제 repository 인터페이스
  (`StampsRepository`) + `Clock`/`NonceGenerator`. **이 파일이 03용 dependency_request의
  본체다** (아래 "03 dependency_request" 절 참조).
- `src/server/application/stamps/walletAuthService.ts` — 지갑 소유 확인(로그인용 서명).
  challenge 5분 TTL·1회 소비(`consumeWalletChallenge`가 원자적으로 소비 처리), 서명 검증은
  `viem.verifyMessage`. 세션 15분 TTL. **claim 발급용 EIP-712 서명과 절대 혼용하지 않는다**
  (로그인은 plain message, 발급은 typed data).
- `src/server/application/stamps/visitService.ts` — 방문 challenge(5분) 발급, 방문 승인
  (`MockVisitVerifierAuthorizer` — 고정 토큰 비교, 로컬/데모 전용이며 공개 환경에는 mock
  승인 route를 등록하지 않는다), 지갑 결합/상태/만료를 함께 검증하는
  `requireApprovedVisitForWallet`.
- `src/server/application/stamps/authorizationService.ts` — 승인된 방문 + Idempotency-Key로
  EIP-712 claim 서명을 발급. RPC로 `hasStamp` 선확인(이미 온체인 확정이면 새 서명을 만들지
  않고 409 `STAMP_ALREADY_CONFIRMED`), RPC 장애 시 새 승인 보류(503 `RPC_UNAVAILABLE`).
  Idempotency-Key 재사용 시 요청 본문 해시(`visitId:recipient`)를 비교해 동일 본문이면
  이전 결과를 그대로 재반환(replayed), 다른 본문이면 409 `IDEMPOTENCY_CONFLICT`.
- `src/server/application/stamps/statusService.ts` — 온체인 `hasStamp` 직접 조회로 발급
  상태(`not_issued`/`pending`/`confirmed`) 판정. RPC 장애 시 확정 완료로 추정하지 않고
  503 `RPC_UNAVAILABLE`.
- `src/server/providers/signing/claimTypedData.ts` — P3-01과 공유하는 EIP-712 정의(중복 정의
  금지, 계약과 100% 동일 도메인/타입).
- `src/server/providers/signing/issuerSigner.ts` — `EnvIssuerSigner`(환경변수
  `STAMP_ISSUER_PRIVATE_KEY`에서만 읽고, 값을 반환/로그하는 API를 노출하지 않음) +
  `InMemoryTestIssuerSigner`(테스트 전용). 서명 자체도 로그에 남기지 않는다.
- `src/server/providers/rpc/chainClient.ts` — `ChainReader`(좁은 인터페이스) + `ChainRpcProvider`
  (viem `PublicClient` 기반 구현). authorizationService/statusService/controller는 concrete
  class가 아니라 이 인터페이스에 의존해 테스트 더블 주입이 가능하다.
- `src/server/controllers/stamps/stampsController.ts` — controller factory(`createStampsController`)
  + `stampsRouteTable`. **03이 app.ts에 실제로 등록한다** (04는 app.ts를 수정하지 않았다).
- `src/server/controllers/stamps/httpEnvelope.ts` — `docs/contracts/api-v1.md` 공통 envelope
  `{data,requestId}`/`{error:{code,message,fields?},requestId}` 그대로 구현.

## Route 표 (`stampsRouteTable`, 실제 등록은 03)

| method | path | 인증 | 설명 |
|---|---|---|---|
| POST | /api/v1/wallet/challenges | 없음 | 지갑 로그인 challenge 발급 |
| POST | /api/v1/wallet/sessions | 없음(challenge+서명) | challenge 서명 검증 후 세션 발급 |
| POST | /api/v1/visits/challenges | Bearer 세션 | 방문 승인 요청 생성 |
| POST | /api/v1/visits/:id/approve | 확인자 토큰(별도 헤더) | 방문 승인(모의) |
| POST | /api/v1/stamps/authorizations | Bearer 세션 + Idempotency-Key | claim EIP-712 서명 발급 |
| GET | /api/v1/stamps | 없음(공개 조회) | 온체인 `hasStamp` 직접 조회 |
| GET | /api/v1/stamps/status | 없음(공개 조회) | 발급 상태(`not_issued/pending/confirmed`) |

에러 코드는 `docs/contracts/api-v1.md` 표를 그대로 따른다: `INVALID_INPUT`(400),
`UNAUTHENTICATED`/`FORBIDDEN`(401/403), `VISIT_NOT_FOUND`(404),
`IDEMPOTENCY_CONFLICT`/`STAMP_ALREADY_CONFIRMED`(409), `VISIT_NOT_APPROVED`/`VISIT_EXPIRED`(422),
`RPC_UNAVAILABLE`(503), `INTERNAL_ERROR`(500).

## acceptance 대조

- **미승인/다른 지갑 요청 차단**: 세션 없음/만료 → `UNAUTHENTICATED`; challenge 서명 불일치 →
  `FORBIDDEN`; 방문이 다른 지갑 세션 소유 → `FORBIDDEN`(`requireApprovedVisitForWallet`);
  방문 미승인/만료 상태에서 발급 시도 → `VISIT_NOT_APPROVED`/`VISIT_EXPIRED`. 단위 테스트로 검증.
- **멱등 재시도 및 동시 요청 검증**: 같은 Idempotency-Key+같은 본문 재시도 → 이전 결과 재반환
  (replayed, 새 nonce/서명 생성 안 함); 같은 키+다른 본문 → 409; repository의
  `createAuthorizationIdempotent`가 conflict를 반환하면(동시 요청이 먼저 커밋) 안전하게
  409로 보고 — 실제 DB의 UNIQUE 제약/transaction으로 원자성을 보장하는 것은 03의 몫이며,
  in-memory 더블은 단일 이벤트 루프 동기 처리로 이를 근사할 뿐이다(영속성 증거 아님).
- **서명 발급과 tx 확정을 구분**: `authorizationService`는 서명까지만 책임지고, 실제 tx
  제출/확정 여부는 사용자 지갑이 직접 하며 P3-06 인덱서/projection이 별도로 추적한다
  (03-onchain-system.md 4절). `statusService`는 서명 발급 여부가 아니라 **온체인 `hasStamp`**로
  confirmed를 판정한다 — 서명 발급 사실 자체를 확정으로 취급하지 않는다.

## 03에게 보내는 dependency_request (P3-DB)

- request_id: `STAMPS-DB-04`
- from_agent → to_agent: `agent_04 → agent_03`
- consumer_work_item: `P3-04, P3-06`
- requested_paths_or_interface: `src/server/application/stamps/ports.ts`의 `StampsRepository`
  (challenge 1회 소비/방문·recipient 결합/승인 멱등 저장+nonce UNIQUE)와
  `jobs/chain-indexer/ports.ts`의 `IndexerRepository`(event+projection+cursor 원자 commit,
  공통 블록 rollback) — 두 인터페이스를 db/migrations + `src/server/repositories/**`에
  실제 구현.
- request_schema: 위 두 ports.ts 파일의 TypeScript 인터페이스 그대로(입출력 타입 포함).
- response_fixture: 없음(코드 인터페이스 구현 자체가 응답). DB namespace/migration 버전은
  03이 발급(공유 checkout `assignments.md` 규칙).
- blocking_scope: P3-04/P3-06의 "실제 연동" 인정(accepted_handoffs 등재) 전체.
- needed_before: P3-04/P3-06을 provisional에서 실제 연동으로 전환하기 전.
- verification_expectation: 재시작 후 중복 저장 없음, 동시 요청 중 하나만 커밋(UNIQUE 위반은
  conflict로 안전 처리), DB 장애를 null/not-found로 삼키지 않음, event/projection/cursor
  한 transaction 커밋, reorg 시 공통 조상 이전으로 rollback.

## 남은 리스크

- 위 모든 서비스는 `testing/inMemoryStampsRepository.ts`(테스트 전용) + fake RPC/서명자로만
  검증했다. 실제 PostgreSQL 동시성(트랜잭션 격리 수준, UNIQUE 제약 실제 충돌)은 검증하지
  못했다 — 03의 구현 이후 재검증 필요.
- wallet challenge/session TTL, 방문 challenge TTL, authorization TTL은 claim-v1.md에 명시된
  "로컬 초안 fixture 정책" 값을 그대로 코드 상수로 옮겼다(5분/15분/5분/10분) — 공개 환경
  적용 전 사람 승인 필요, 04가 임의로 운영값으로 확정하지 않았다.
- `MockVisitVerifierAuthorizer`는 고정 공유 토큰 비교이며 데모 전용이다. 실 verifier 인증
  정책은 미결정.

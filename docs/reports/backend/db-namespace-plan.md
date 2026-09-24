# DB namespace / migration 번호 발급 (03, draft)

`docs/reports/coordination/assignments.md`의 shared_resource_locks: "03이 테스트 DB namespace와
migration version을 발급"에 대한 03의 초기 제안이다. 아직 어떤 실제 DB도 만들지 않았다(P1-06,
ENV-01 선행). 04가 P3-01/P3-DB를 준비하며 참고할 수 있도록 번호 대역만 먼저 예약한다.

## DB 이름 (로컬 개발/CI 전용, 운영 환경 아님)

- 개발: `busan_alley_dev`
- 테스트(자동화, 매 실행 격리): `busan_alley_test` — 각 테스트 실행은 스키마 단위로 격리한다
  (`busan_alley_test.plans_<run_id>` 같은 schema-per-run). 다른 작업의 데이터를 clear/reset하지 않는다는
  원칙(assignments.md) 때문에 DROP DATABASE 대신 schema 격리를 기본으로 제안한다.
- QA 재구축/장애 시나리오 전용: `busan_alley_qa_restart` — 01/04가 예약한 창에서만 사용(assignments.md
  "QA reorg/reset은 별도 로컬 노드 또는 예약된 창만 사용").

## migration 파일 번호 대역 (예약, 내용은 아직 없음)

| 대역 | 소유/내용 | 선행 |
|---|---|---|
| `0001`–`0009` | P1-06: plans/catalog 기본 테이블 (idempotency key, saved plan, catalog snapshot) | P1-05, P1-02, ENV-01 |
| `0010`–`0029` | P2-02: rag_sources ~ rag_eval_runs (corpus-plan.md §2 스키마) | P2-01, P1-06 |
| `0030`–`0039` | P3-DB(03 구현, 04 요청): wallet challenge/방문/승인/events/projection/cursor — **0030/0031 확정 완료(아래 참고)** | P3-01, P1-06 |

번호는 실행 순서 우선순위(assignments.md: "P3-DB/ROUTES 요청은 장기 RAG 튜닝보다 우선")를 반영해
0030대를 0010대(RAG)보다 먼저 채울 수도 있다 — **대역 예약이지 실행 순서 고정이 아니다.** 04가 P3-01
요청을 구체 스키마로 보내면 03이 0030 대역 안에서 실제 파일명(예: `0030_wallet_challenge.sql`)을
확정해 이 문서를 갱신한다.

## 다음 단계

- 이 문서는 01/04가 참고할 수 있도록 `docs/reports/backend/**`(03 소유)에 두었다. 04가 P3-01 repository
  요청을 구체화하면 03이 0030 대역에서 실제 테이블/제약을 채운다(P1-06 완료 여부와 무관하게 스키마 설계
  자체는 먼저 준비 가능 — 실제 적용은 DB 환경 이후).


## 0030/0039 대역 확정 (15:38 KST 갱신, P3-DB-HANDOFF-03 응답)

- `0030_stamps_core.sql`: `wallet_challenges`, `wallet_sessions`, `visit_requests`,
  `stamp_authorizations` (StampsRepository, `src/server/application/stamps/ports.ts`).
  `stamp_authorizations`는 `UNIQUE (idempotency_scope, idempotency_key)` +
  `UNIQUE INDEX ... (LOWER(recipient), nonce)`.
- `0031_chain_indexer.sql`: `indexer_cursors`, `indexer_recent_blocks`, `chain_events`,
  `stamp_projections` (IndexerRepository, `jobs/chain-indexer/ports.ts`). `chain_events`
  PK는 `(chain_id, contract_address, transaction_hash, log_index)`.
- 구현체: `src/server/repositories/pgStampsRepository.ts`, `pgIndexerRepository.ts`.
  `src/server/storage/sqlClient.ts`의 `SqlClient`/`SqlExecutor` 구조적 인터페이스에만
  의존한다(특정 드라이버 import 없음 — 루트 새 패키지는 02 창구 요청 대상 원칙 유지).
- 검증: `src/server/repositories/testing/pgliteSqlClient.ts` + 두 개
  `*.pglite.test.ts` 스위트(총 8 tests, `@electric-sql/pglite` 동적 import 기반, 실제
  UNIQUE 제약/transaction/rollback against 실제 SQL 엔진). 상세는
  `docs/reports/handoffs/agent_03/P3-DB-agent03-20260924T153857+0900-4cb7ca8.md` 참고.
- 0032 이후는 아직 미사용 — P1-06/P2-02가 먼저 0001–0029 대역을 채우면 그대로 진행.

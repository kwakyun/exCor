# P2-01 RAG 자료·corpus·평가셋 준비 (draft)

버전: rag-corpus-plan-v0.1.0-draft · 작성: agent_03 · 검토자: agent_01 · 상태: draft (미승인)
기준 base_commit: `4cb7ca83069f58103707426f215de5c96bddfe01` (C0 계약 문서와 동일 기준)

본 문서는 `docs/architecture/implementation/02-rag-system.md` §3, §8과 `docs/contracts/core-v1.md`의
`catalogVersion`/`corpusVersion` 분리 규칙을 전제로, 첫 릴리스 범위(전포 권역)의 실행 계획을 구체화한다.
아직 어떤 migration도 생성하지 않았고, 아래 스키마는 P2-02 구현 시 확정할 목표안이다.

## 1. 출처 상태

`data/rag/sources/jeonpo-sources.md` 참고. 요약: 내부 큐레이션 자료 1건(즉시 사용 가능) + 외부 공식 후보 5건
(부산관광공사 2건, 부산진구청 1건, 공공데이터포털 오픈API 2건) — **모두 이용조건 미승인**. 01의 승인 없이는
`rag_sources.active`를 true로 두지 않는다.

## 2. 문서·corpus 스키마 (목표, P2-02에서 migration으로 구현)

02-rag-system.md §3의 7개 테이블 제안을 다음과 같이 구체화한다. 필드명은 snake_case, 모든 PK는 uuid.

```text
rag_sources
  id, source_key(unique, 예: 'src-internal-busanalleys'), provider, base_url,
  license_note, allowed_scope, verification_status('candidate'|'approved'|'rejected'),
  fetch_frequency, active(bool, default false), created_at

rag_documents
  id, source_id(fk), source_item_id, content_hash(sha256, unique per source_id),
  title, body, district_id, published_at(nullable), fetched_at, verified_at(nullable),
  state('staged'|'active'|'retired'), created_at
  UNIQUE(source_id, source_item_id, content_hash)  -- 재수집 시 동일 내용은 재적재하지 않음

rag_document_spots
  document_id(fk), spot_id, link_basis('name_match'|'address_match'|'manual'),
  review_status('pending'|'confirmed'|'rejected')
  PRIMARY KEY(document_id, spot_id)

rag_corpora
  id, corpus_version(unique, 예: 'corpus-jeonpo-v1-draft'), embedding_model_id,
  embedding_dimension, chunker_version, state('staging'|'active'|'retired'), created_at

rag_chunks
  id, corpus_id(fk), document_id(fk), section, text, embedding(vector(N)),
  language('ko'), source_locator(예: '문단#2'), token_count, created_at

rag_ingest_runs
  id, source_id(fk), started_at, finished_at(nullable),
  documents_changed, documents_failed, failure_code(nullable)

rag_eval_runs
  id, dataset_version, corpus_version, model_config(jsonb),
  retrieval_config(jsonb), metrics(jsonb), cost_krw, started_at, finished_at
```

설계 결정과 근거:
- `content_hash`는 sha256(정규화된 body)로 계산해 재수집 시 임베딩 중복 생성을 막는다(02-rag-system.md §3 "문서 동일성").
- `rag_corpora`는 embedding_model_id/dimension이 바뀌면 항상 새 row를 만든다. 서로 다른 차원의 벡터를 같은 corpus에 섞지 않는다는 제약을 애플리케이션 레벨에서도 검증한다(같은 corpus_id의 모든 chunk가 같은 dimension인지 insert 시 확인).
- `published_at`/`fetched_at`/`verified_at`을 분리해 "오늘 수집"과 "오늘 영업 확인"을 구조적으로 구분한다. `verified_at`은 사람 검수(01) 이후에만 채운다.
- 가격/영업시간 등 문서에서 추출한 사실은 이 스키마에 직접 넣지 않고, 검수 후보 테이블(별도 `rag_price_candidates` 등)로 분리하는 방안을 P2-02에서 확정 제안한다. catalog(P1) 가격을 자동으로 덮어쓰지 않는다.

## 3. 평가셋 (draft, v0.1.0-draft)

산출물: `evals/rag/datasets/eval-v1-draft.jsonl` (100문항) + 생성 스크립트 `evals/rag/datasets/generate-eval-v1.mjs`
(재현 가능하도록 커밋; 스크립트 재실행 시 동일 100문항이 동일 순서로 생성됨을 보장).

분포(02-rag-system.md §8 제안과 동일하게 맞춤):

| 카테고리 | 전체 | dev | holdout |
|---|---|---|---|
| general_recommendation (일반 추천) | 30 | 18 | 12 |
| budget_party (예산/인원) | 20 | 12 | 8 |
| name_alias (장소명/별칭) | 15 | 9 | 6 |
| no_evidence (근거 없음) | 15 | 9 | 6 |
| recency_conflict (최신성/충돌) | 10 | 6 | 4 |
| adversarial_injection (문서 내 악성 지시) | 10 | 6 | 4 |
| 합계 | 100 | 60 | 40 |

split은 카테고리별로 앞쪽 N개를 dev, 나머지를 holdout으로 고정 배정했다(생성 스크립트의 결정적 로직).
버전 태그는 `eval-v1-draft`이며, 01 검수 후 확정되면 `eval-v1.0.0`으로 올리고 이후 문항 추가는 `eval-v1.1.0`
등으로 버전을 올린다(질문 교체는 새 버전, 오탈자 수정만 patch).

각 레코드는 `relevant_chunk_ids: []`로 비어 있다 — corpus가 아직 적재되지 않았기 때문이다(P2-02 선행).
`review_status: "pending_agent01_review"`를 모든 100문항에 붙였다. **01의 정답/기대 상태(expected_status) 검수
전에는 이 평가셋으로 산출한 어떤 Recall/근거지지율도 최종 게이트 수치로 보고하지 않는다.**

주의할 편향: `no_evidence`/`recency_conflict` 항목은 "정답이 없음"을 기대하는데, 향후 실제 corpus에
해당 정보가 우연히 포함되면 기대 라벨을 재검토해야 한다. `adversarial_injection` 10건은 질문 자체가 아니라
검색 후보에 합성 오염 문서가 섞였을 때의 기대 동작을 정의한 것이며, 실제 오염 문서를 만드는 것은 P2-02
작업이다(각 문항의 `notes` 필드에 삽입할 오염 지시 문구를 기록해 두었다).

## 4. dev/holdout 오염 방지 체크리스트 (P2-03/P2-06에서 재확인)

- [ ] dev 60건으로 top-k/RRF/청킹 파라미터를 튜닝한 뒤, holdout 40건은 최종 1회 평가에만 사용한다.
- [ ] holdout 문항의 `expected_status`/`candidate_spot_ids`를 파라미터 튜닝 로그나 코드에 하드코딩하지 않는다.
- [ ] 같은 장소·유사 표현이 dev/holdout에 중복되어 "쉬운 정답"을 만들지 않는지 01이 교차 검수한다 (`name_alias` 카테고리가 가장 위험 — 현재 15건 모두 전포 10개 스팟 범위 내에서만 표현을 바꿨다).

## 5. 미결정/의존 항목

- 외부 출처 이용조건 승인 (agent_01) — 승인 전까지 corpus는 내부 자료 1건으로만 구성.
- 임베딩 모델/차원 선정 (P2-02, provider 접근성에 따라 mock 우선).
- P1-06(PostgreSQL 실 연결) 전까지 `rag_*` 테이블은 실제 migration으로 만들지 않는다(스키마는 위 §2에 문서로만 고정).

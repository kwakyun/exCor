# C0 API / repository 계약

버전 api-v1.0.0-rc4 · 문서 01 · DTO/route/repository 구현 03 · UI 02 · stamps factory 04 · ready_for_review

공통 성공 `{ data: T, requestId: string }`, 실패 `{ error: { code: string, message: string, fields?: Record<string,string> }, requestId: string }`. requestId는 서버가 생성·검증하며 로그와 동일하다. 스택·연결정보·질문 전문·서명을 로그에 남기지 않는다.

| HTTP | code 예 | 의미 |
|---|---|---|
|400|INVALID_INPUT|형식/범위/알 수 없는 ID|
|401/403|UNAUTHENTICATED / FORBIDDEN|세션 없음 / 방문 또는 권한 불일치|
|404|PLAN_NOT_FOUND|저장 slug 없음|
|409|CATALOG_VERSION_UNAVAILABLE / IDEMPOTENCY_CONFLICT|버전 또는 키 본문 충돌|
|422|PLAN_INFEASIBLE|정상 형식이지만 예산/필수 항목 불가능|
|429|RATE_LIMITED|제한, Retry-After 제공|
|503|STORAGE_UNAVAILABLE / MODEL_UNAVAILABLE / RETRIEVAL_UNAVAILABLE / RPC_UNAVAILABLE|의존성 장애, 성공 표시 금지|
|500|INTERNAL_ERROR|예상 밖 오류, 내부 상세 미노출|

## 계획 API

- GET /api/v1/catalog?version=... → 200 CatalogSnapshot; ETag 일치 304는 body 없음.
- POST /api/v1/plans + Idempotency-Key → `{ preference: PlannerInput, orderedSpotIds: string[], catalogVersion: string }`. 임의 가격/합계를 입력받지 않는다. 추가된 합계 필드는 400. 서버는 지정 순서의 장소를 catalog와 대조·재계산하며 최적화 엔진으로 다른 장소를 재선택하지 않는다.
- 201 → `{data:{slug,snapshot:PlanV2,createdAt},requestId}`. 같은 키/같은 정규화 본문은 같은 slug/snapshot/createdAt와 201; requestId는 각 HTTP 요청 식별자라 달라도 된다.
- GET /api/v1/plans/:slug → 200 위 저장 객체. GET /api/v1/health → 최소 상태만.

예: fixture의 2인 30000원, food/cafe/admission ID 요청은 totalSpent=28200, remainingBudget=1800. 없는 slug 응답은 `{"error":{"code":"PLAN_NOT_FOUND","message":"저장한 코스를 찾을 수 없습니다."},"requestId":"qa-request-404"}`.
키 없이 POST는 400. 키 범위는 endpoint/사용 주체 범위를 함께 정의하고 같은 키의 동시 요청을 transaction/UNIQUE로 직렬화한다. 익명 plans와 인증 stamps의 scope를 공유하지 않는다. 키 보존 TTL은 **24시간(로컬/개발 기본값, rc4로 01 확정)**이며 만료 전 retry만 동일 결과를 보장한다. 경계는 발급 시각+24:00:00.000 이상이면 만료로 처리(23:59:59.999는 유효), 03의 dep-a03-005 제안·경계 fixture를 그대로 채택했다. 이 값은 로컬 개발 기본값이며 공개 운영 보존 정책(사람 승인 필요 항목)과 다르다.
기존 /api/plans, /api/plans/:slug, like, curations/popular, spots, districts는 기존 필드를 유지하는 호환 adapter를 둔다. 구 API도 잘못된 금액을 성공 저장하지 않는다. 구형 저장 실패 시 local-* 공유 성공을 만들지 않는다.

## 저장소 경계

03이 다음 의미를 갖는 인터페이스를 구현하고 실제 메서드 타입을 먼저 인계한다.
`CatalogRepository.get(version?): Promise<CatalogSnapshot|null>`;
`PlanRepository.saveIdempotent({scope,key,requestHash,snapshot}): Promise<{kind:'created'|'replayed',record}|{kind:'conflict'}>`;
`PlanRepository.findBySlug(slug): Promise<SavedPlan|null>`.
검증은 application, SQL은 repository. 저장 snapshot과 dedup 응답은 한 transaction에서 커밋한다. 실패 시 둘 다 없어야 하며 DB 장애를 null/not-found로 삼키지 않는다. 메모리 fake는 영속성 통과 증거가 아니다.
온체인 repository는 challenge 1회 소비, 방문/recipient 결합, 승인 멱등 저장 및 nonce UNIQUE, event+projection+cursor 원자 commit, 공통 블록 rollback 의미를 제공한다. 04가 P3-01에서 구체 타입을 요청하고 03이 P3-DB에서 구현한다. 04 route factory에 repository/provider를 주입하고 app.ts 등록은 03만 한다.

## RAG

POST /api/v1/recommendations 입력 `{query:string,constraints?:Partial<PlannerInput>,catalogVersion:string}`. query 최대 1000자. 전송 입력은 부분 조건을 허용하며 추출·충돌 확인 후 완전한 PlannerInput으로 검증해서 엔진에 전달한다. 예산/인원 누락 또는 명시 값 충돌 시 200 clarify. 필드가 주어졌지만 형식/범위가 잘못된 경우는 400 INVALID_INPUT. 정상 data status는 ok/clarify/insufficient_evidence/infeasible.
ok는 `{status,plan,claims:[{text,spotId?,sourceIds}],sources:[{id,title,url?,sourceKind,publishedAt?,fetchedAt,verifiedAt?}],catalogVersion,corpusVersion}`. sourceKind internal/external, 인용은 실제 corpus의 locator와 대조한다. 강한 조건 근거 부재는 충족으로 인정하지 않는다. 후보 1회 확대 후 불가능과 기본 planner fallback을 구분한다. 모델 장애 503을 근거 부족 200으로 바꾸지 않는다.
응답 fixture는 `fixtures/api-v1.json`. mock은 실모델·실DB 완료 증거가 아니다. 공개 인증·CORS 신뢰·요청 제한의 운영 수치는 미결정 정책이며 로컬 fake에 한정해 준비한다.

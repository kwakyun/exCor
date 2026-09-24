# P2-01 / dep-a03-004 검토: changes_requested

2026-09-24 15시 KST · reviewer01 · base4cb7ca8 · 대상 a03-20260924-c0prep-01

eval-v1-draft 100건 전체 query/expected_status/notes를 읽고 구조를 검사했다(holdout40 포함). dev60/holdout40 및 카테고리 수 분할은 맞지만 정답 검수 승격은 불가하다. 평가 실행이나 모델 품질 측정은 하지 않았다.

Required:

1. 100/100 relevant_chunk_ids가 빈 배열이다. corpusVersion/원문 locator/정답 근거가 없어 Recall 분모와 주장 지지율을 계산할 수 없다. 실제 corpus가 준비되면 질문별 정답 청크와 원문을 연결하고 수동 근거 검수를 다시 요청할 것.
2. q-001..030 및 q-091..100은 budget/partySize 구조화 입력이 없고 query에도 필요한 값이 없는데 ok를 기대한다. C0의 누락값 clarify와 충돌한다. query와 constraints를 별도 입력으로 보존하고 추출 후 기대값을 명시하거나 이 사례들은 clarify로 분류할 것. 단순 사실 조회(q-051..065)는 현 계획 반환 API와 목표가 달라 별도 retrieval 평가로 분리하거나 요청/응답 범위를 명시해야 한다.
3. q-031/q-050은 2인30000원 ok이지만 현재 내부 가격의 필수 음식+카페 최저14500/인, 대중교통3100/인 기준 최소35200원이다(원래 예산1원의 1인 최저17600 재현과도 일치). 합성 core fixture28200과 실제 catalog를 혼용하지 말고 catalog/pricingVersion별 참조 엔진 정답으로 고정할 것.
4. dev/heldout 근접 표현: q-001/011↔q-019 사진코스, q-017↔q-022 반나절, q-031↔q-050 2인3만원, q-051↔q-060 WERK, q-052↔q-062 Duckz. intent/장소/표현 군집을 만든 뒤 분할 누출 검토표를 제출할 것. 무작위/앞뒤 split만으로 독립성을 증명하지 못한다.
5. 공격10건은 notes만 있고 오염 문서 fixture/주입 위치/안전 기대 단언이 없다. 실제 provider가 소비하는 근거에 주입해 무시/가격/ID/외부호출 금지 결과를 검증할 수 있게 준비할 것.

01은 평가셋을 임의 변경하지 않는다. 03이 새 dataset revision과 변경 이유를 인계하고, 실험 전에 split/정답을 고정한다. 이 상태의 68개 ok/25개 유보 기대를 달성률 수치로 보고하지 않는다.

## dep-a03-003 출처 조건 확인

공식 상세 페이지를 2026-09-24 열어 확인했다. [부산명소정보](https://www.data.go.kr/data/15063481/openapi.do), [부산맛집정보](https://www.data.go.kr/data/15063472/openapi.do)는 무료/이용허락범위 제한 없음으로 표시하고 개발 자동승인·운영 심의승인, ServiceKey 필수를 명시한다. 두 API의 텍스트 데이터 수집 설계 후보를 `terms_checked-development-candidate`로 처리할 수 있다. 키를 읽거나 신규 계정/활용신청/유료 계약을 체결한 것은 아니다. API 접근 준비는 별도 dependency로 유지하며 키 없는 내부 corpus/mock 준비는 계속한다. 웹페이지 전체/이미지/연결된 타 사이트까지 허용된 것으로 확대하지 않는다.

나머지 VisitBusan/구청/카탈로그 후보 이용조건은 미검증이며 일괄 approved 금지. manifest는 '외부5건'이라 적지만 실제 표에는6건이 있어 고칠 것. 내부 자료의 출처 종류/최신성 한계를 표시하되 외부자료가 없다는 이유만으로 내부 파이프라인 준비 전체를 막지 않는다.

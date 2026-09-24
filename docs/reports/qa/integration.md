# INTEGRATION-01 검증

run_id agent01-20260924T100749+0900-4cb7ca8 · base_commit 4cb7ca83069f58103707426f215de5c96bddfe01
상태 **BLOCKED** — P1-07/P2-06/P3-07 모두 미통과. 고정 통합 commit 없음.

실제 E2E는 아직 실행하지 않았다. 다음 순서를 동일 통합 commit, lock/runtime, catalog/pricing/corpus/model, chainId/contract/ABI, DB migration/test namespace로 고정하고 증거를 남긴다.

1. 지갑 없이 일반 계획 생성: 엔진 합계/조건 확인.
2. RAG 추천과 출처 검수 후 현재 계획 비교/적용.
3. 저장/공유 후 별도 브라우저·API 재시작으로 같은 snapshot 복원.
4. 명시적 모의 방문 승인→지갑 서명/tx→confirmed→중복거절.
5. 재접속→공개 검증 hasStamp/이벤트/DB projection 비교.
6. 분리된 테스트 DB 재구축 및 예약된 로컬 reorg 후 canonical 상태 일치.

장애는 하나씩 주입한다. 모델503은 사용자 선택 기본 planner, DB 중단은 저장 성공 금지, RPC 중단은 새 승인 보류 및 확정 추정 금지. 정상 복구 후 중복 저장/발급 없이 재시도됨을 확인한다.

현재 실행 증거: 최초 baseline-test/build exit1(미설치), 02 설치 후 01 독립 기존 테스트10 PASS/build PASS, C0 자체 검사4 PASS(제품 E2E 아님), legacy probe exit1로 계약 위반6건. 동일 HEAD의 tracked 제품 변경 없음. 향후 수정 시 영향받은 게이트만 재실행하고 통합 commit을 갱신한다. README/runbook 요구는 02 소유로 전달: 실동작 entrypoint, 환경 변수 이름만, fixture/DB/node 격리, real/mock 구분, 재현 명령 및 장애 복구. 본 계획은 02 교차 검토 대기.

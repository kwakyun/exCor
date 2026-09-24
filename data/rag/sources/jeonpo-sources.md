# P2-01 전포 권역 허용 출처 매니페스트 (draft, v0.1.0-draft)

상태: **draft — 01/이용조건 승인 전**. 이 문서에 열거된 자료 중 실제 수집(jobs/ingest)을 시작해도 된다고
확정된 항목은 아직 없다. `verification_status`가 `approved`가 되기 전에는 어떤 자료도 `rag_documents`에
적재하지 않는다. 현재는 P2-02(수집기) 착수 전 조사 단계 산출물이다.

기준 조사일(fetchedAt, 조사 목적 접속): 2026-09-24 · 조사자: agent_03 · 대상 권역: 전포(jeonpo) — 첫 릴리스 범위

## 1. 내부 큐레이션 자료 (이미 저장소에 존재)

| source_id | 설명 | 위치 | sourceKind | 허용 범위 | 비고 |
|---|---|---|---|---|---|
| `src-internal-busanalleys` | 팀이 직접 작성한 전포 10개 스팟 소개문(요약/시그니처 메뉴/태그/팁) | `src/data/busanAlleys.ts` | internal | 전체 필드 인용 가능. 단, "오늘 영업 여부"·"실시간 웨이팅" 등 시점 정보는 없음 | 이미 spotId와 1:1 매핑되어 있어 `rag_document_spots` 연결이 가장 쉬움. 최초 corpus의 기본 골격으로 우선 사용 제안 |

내부 자료는 저작권/이용조건 이슈가 없으나, 작성 시점이 불명확하고 가격(`price`)이 카탈로그 스냅샷과 동일 출처(같은 코드베이스)이므로 "출처 다양성"을 인정받기 어렵다. 최소 1개 이상의 외부 공식 자료 교차 확인 없이는 P2-01 완료 기준("근거 품질")을 충족하지 못한다고 본다.

## 2. 외부 후보 출처 (조사만 완료, 이용조건 미검토 — 승인 전 수집 금지)

아래는 2026-09-24 검색으로 식별한 실재하는 공식/준공식 채널이다. URL은 접속 가능함을 확인했으나
**이용약관/저작권 조건/재게시 허용 범위는 읽지 않았다.** `verification_status=candidate`인 항목은
01의 이용조건 승인 없이는 `active=true`로 전환하지 않는다.

| source_id | provider | URL | 수집 후보 항목 | verification_status | 비고 |
|---|---|---|---|---|---|
| `src-visitbusan-official` | 부산관광공사 공식 관광 포털 (visitbusan.net) | https://www.visitbusan.net/kr/index.do?menuCd=DOM_000000202003001000&uc_seq=355&lang_cd=ko | 전포카페거리 공식 소개, 대표 업체 리스트 | candidate | 관광공사 공식 채널이라 신뢰도 높음. 이용약관/CC 라이선스 여부 확인 필요 |
| `src-visitbusan-archive` | 부산관광공사 관광 아카이브 (visitbusan.net/archive) | https://visitbusan.net/archive/dataSearch/view.nm?dataSid=METADATA012799 | 공식 사진/문서 메타데이터 | candidate | "공식 관광 사진·자료·영상·문서" 아카이브. 재사용 조건(출처표기/상업적 이용 제한 등) 확인 필요 |
| `src-busanjin-tour` | 부산진구청 문화관광 (busanjin.go.kr) | https://www.busanjin.go.kr/index.busanjin?menuCd=DOM_000001004001003000 | 전포카페거리 구청 공식 소개, 업체 안내 | candidate | 지자체 공식 페이지. 통상 공공누리(KOGL) 라이선스 적용 가능성 있음 — 페이지 하단 라이선스 표기 확인 필요 |
| `src-data-go-kr-busan-attractions` | 공공데이터포털 — 부산광역시_부산명소정보 서비스 | https://www.data.go.kr/data/15063481/openapi.do | 명소 API (오픈API, 구조화 데이터) | candidate | 공공데이터포털 표준 이용약관 적용 대상. API 키 발급 및 트래픽 제한 별도 확인 필요 |
| `src-data-go-kr-busan-food` | 공공데이터포털 — 부산광역시_부산맛집정보 서비스 | https://www.data.go.kr/data/15063472/openapi.do | 맛집 API (오픈API, 구조화 데이터) | candidate | 위와 동일. 가격/영업시간 필드가 있어도 "검수 후보"로만 저장 (수집일 ≠ 확인일) |
| `src-data-busan-go-kr` | 부산 Big-데이터웨이브 (data.busan.go.kr) | https://data.busan.go.kr/bdip/opendata/dataSet.do | 부산시 공공데이터 카탈로그 전반 | candidate | 전포 특화 데이터셋 존재 여부는 카탈로그 재검색 필요 |

제외 후보(수집 대상에서 제외 제안):
- 언론사 기사(예: 부산일보 "전포동 가이드맵" 기사), 개인/상업 여행 플랫폼 후기(트리플, 마이리얼트립, 개인 블로그 등)는 저작권·광고성·사실 검증 어려움으로 1차 수집 대상에서 제외한다. 필요 시 "external, 인용만, 재게시 불가" 조건으로 개별 승인 후 검토.

## 3. 다음 단계 (누구에게 무엇이 필요한가)

1. **agent_01**: 위 candidate 5건 중 최소 1~2건에 대해 이용조건(재게시/상업적 이용/출처표기 의무) 승인 여부를 결정하고 `docs/reports/coordination/assignments.md` 또는 별도 승인 기록에 남긴다. 미승인 상태에서는 03이 실제로 fetch하지 않는다.
2. 승인된 출처가 확정되면 03은 `rag_sources` 레코드(P2-02 migration)와 실제 `jobs/ingest` fetch 로직을 연결한다.
3. 승인 전까지는 내부 큐레이션 자료(`src-internal-busanalleys`) 단독으로 corpus staging을 구성해 파이프라인/스키마를 검증하고, "출처 1건(내부)"이라는 한계를 평가 보고서에 명시한다.

## 참고: 수집 주기/활성 상태 초안 (P2-02에서 확정)

| source_id | 제안 수집 주기 | active(초안) |
|---|---|---|
| src-internal-busanalleys | 코드 변경 시 수동 재적재 | true |
| 외부 5건 | 승인 후 결정 (주 1회 제안) | false (승인 전) |

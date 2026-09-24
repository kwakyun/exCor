# P1-01 기존 시스템 기준선

agent_02 · run_id `agent02-20260924T100752+0900-4cb7ca8` · base_commit `4cb7ca83069f58103707426f215de5c96bddfe01`

2026-09-24, 공유 checkout `C:/WorkSpace/MGG/github-upgrades/busan-alley-balancer`, branch `feature/busan-alley-budget-planner`. 01의 assignments.md P1-01 배정에 따라 실행. 제품 소스와 package/lock 수정 없음. 최초 미추적 implementation/prompts/upgrade-strategy 문서 및 타 담당 변경은 보존.

## 실행 환경과 검증

Windows x64, Intel Core Ultra 5 125U, 논리 CPU 14, RAM 약 23 GiB, Node 24.15.0, npm 11.12.1. lock 해석 버전 Vite 6.4.3, Vitest 3.2.7, TypeScript 5.9.3, React 18.3.1. 이 버전의 선언된 Node engines 범위에 현재 Node 포함. chain 호환성은 미검증.

| 명령/단계 | 실제 결과 | 분류 |
|---|---|---|
| 최초 npm test / npm run build | vitest / tsc 실행 파일 없음 | 의존성 미설치, 코드 실패 아님 |
| npm ci --no-audit --no-fund | 최초 node_modules mkdir EPERM; 승인된 권한 재실행으로 110 packages 설치 | 실행 sandbox 제한 해소 |
| 설치 후 sandbox npm test/build | .vite-temp mkdir EPERM | 환경 제한, 제품 실패 아님 |
| 승인된 권한 npm test | 2 files / 10 tests PASS, 541ms | 기존 테스트 범위만 |
| 승인된 권한 npm run build | tsc 및 Vite PASS, Vite 1.78s | 기존 빌드 |
| node scripts/check-docs.cjs | 3 documents / 14 local links PASS | 앱 동작 검증 아님 |
| node benchmarks/baseline/run.mjs | 3 complete / 2 timeout | 아래 raw 결과 |
| node benchmarks/baseline/smoke.mjs | HTML, seeded plan, popular API 모두 HTTP 200 / valid=true | 기존 dev API; DB 영속성 아님 |

첫 benchmark harness 시도는 bundle 뒤 변수 재선언 SyntaxError로 실패했다. block scope로 수정한 후 아래 측정. 제품 코드 결함이나 timeout에 합산하지 않는다. API는 Vite configureServer에만 연결되어 있고 독립 server script/preview API는 현재 없다. 최초 smoke의 Vite `--port 0`은 실제 5173으로 fallback했으며 OS 원자 예약이 아니었다(01 리뷰에서 지적). 수정한 smoke는 net.listen(0)으로 빈 loopback 포트를 확인하고 닫은 뒤 해당 번호를 Vite --strictPort로 지정한다. 조회/실행 사이 경쟁이 생기면 시작 실패하고 다른 포트/타 서비스로 넘어가지 않는다. 자신의 Vite 프로세스만 종료한다.

## 엔진 측정

01 배정 CPU 창을 시작/종료 메시지로 통지. 실제 측정 2026-09-24 10:15:30.012~10:15:48.562 KST. 다른 담당 고부하 금지 요청 상태이며 시스템 전체 CPU 독점 여부는 계측하지 않았다.

원본 TS 엔진/데이터를 esbuild로 메모리에 묶어 별도 persistent Node worker에서 실행한다. 제품 파일 수정 없음. fixture 변경은 worker 메모리의 배열에 한정. 입력: 전포, 50,000원, cafe_dessert, transit_walk, partySize=1. 난수 seed 20260924, LCG, 가격 0~15,000원/100원 단위, 원본 장소 템플릿을 복제한 합성 ID. 5권역 균등; uniform 카테고리 각 25%, food-skewed 음식70%/나머지각10%. 원본은 50개, 권역별 음식3/카페3/체험3/간식1.

각 case warm-up10, 측정100, worker 내 performance.now로 호출 시간 기록. worker 시작/번들/fixture 생성은 제외. 캐시 없음. p95는 정렬한 100개 중 95번째 값. worker message watchdog 2초 초과 시 중단하며 해당 case 나머지는 미실행 처리한다. watchdog은 IPC 스케줄링도 포함하므로 정확한 완료 실행 시간으로 해석하지 않는다.

| 장소 수/분포 | 완료 측정 수 | p95 ms | 판정 |
|---|---:|---:|---|
| 원본 50 | 100 | 0.0435 | 측정 완료 |
| 1,000 균등 | 100 | 121.5915 | 제안 목표 100ms 초과 |
| 1,000 음식 편중 | 100 | 23.1443 | 이 입력에서 목표 이내 |
| 10,000 균등 | 0 | 미산출 | 첫 warm-up 2초 timeout, 이후 측정100 미실행 |
| 10,000 음식 편중 | 0 | 미산출 | 첫 warm-up 2초 timeout, 이후 측정100 미실행 |

raw 시간 배열, fixture별 크기/분포/SHA256, 시각/환경은 `benchmarks/baseline/baseline.json`. 재현 명령은 루트에서 `node benchmarks/baseline/run.mjs` (먼저 기존 build 필요). timeout을 제외한 성공 표본만으로 p95를 꾸미지 않는다. 고정 전포 입력의 결과이며 전체 테마/인원 성능으로 일반화하지 않는다. P1-02 정확성 참조 구현과는 계산 정책이 다르므로 정책 변화 효과와 최적화 효과를 분리해야 한다.

후속 제품 변경에도 원본 측정이 가능하도록 동일 esbuild 옵션의 bundle을 `legacy-engine.cjs`, 원본 파일/lock/bundle 해시를 `source-hashes.json`에 보존했다. runner는 이제 이 고정 bundle의 SHA256을 검증해 읽는다. 기존 raw 숫자는 최초 측정을 그대로 유지하며 snapshot 보존 후 재측정을 가장하지 않는다. 이후 재실행 시 assets는 그 시점 dist이므로 번들 비교에는 별도 동일 HEAD build가 필요하다. 원본 raw를 보존한 뒤 새 결과를 별도 위치로 옮겨 사용한다.

## 번들 및 렌더링

| 파일 | bytes | gzip bytes |
|---|---:|---:|
| index-DfaqQ_B4.js | 343467 | 96026 |
| index-CWR4YSNQ.css | 17363 | 3721 |

빌드 파일 hash는 raw JSON에 기록. JS는 단일 초기 chunk다. 4개 탭 및 confetti 정적 import 확인. 브라우저 paint/React commit/입력20회/LCP/INP/CLS는 **미측정**. HTTP smoke를 렌더링 PASS로 취급하지 않는다. 실험실 수치나 field p75도 보고하지 않는다. 이 항목은 P1-04/01 UI QA에서 브라우저 측정 장치·조건을 정하고 보완해야 한다.

## 기존 결함 — 성능과 별도

아래 1~5는 동일 legacy 코드의 격리 재현 결과이며 raw JSON의 defects에 보존했다. 6~8은 정적 관찰이다.

1. 같은 조건 1명/8명 모두 총액 40,100원: partySize가 비용에 미반영.
2. 예산1원에도 총액17,600원/잔액0의 정식 계획 반환: 불가능 상태 대신 초과 fallback, 보존식 불성립.
3. 전포 음식 order2에 영도 카페 yd-c1 교체 허용: item.category=food, spot.category=cafe로 불일치까지 발생.
4. fetch를 합성 offline 오류로 대체한 savePlan은 success=true, local-* slug 반환: 서버 저장 실패를 공유 성공으로 표현.
5. 전포 음식 카테고리를 비우면 undefined.price 접근 예외.
6. App은 입력 변경마다 생성·localStorage 저장·confetti를 수행. 저장 JSON 구조 검증 없이 상태에 넣는다.
7. planStorage는 프로세스 Map. 재시작 복구 보장 없음(실제 재시작 지속성 시험은 미실행).
8. 기존 테스트 10개는 인원 경계, 불가능/빈 카테고리, 다른 권역/카테고리 교체, 공유 실패를 검증하지 않는다.

## 완료 범위

엔진/번들/기존 테스트·빌드·dev 실행 증거 및 결함 분리 기록 완료, 01 검토 요청. 브라우저 렌더링 기준선과 1만 개 완결 실행은 미완료로 명시한다. P1 전체 PASS/배포 가능/정확성 해결을 의미하지 않는다.

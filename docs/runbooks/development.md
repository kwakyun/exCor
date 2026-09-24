# 공통 개발 실행 환경

ENV-01 / agent_02 / 2026-09-24. 실제 검증 Node 24.15.0, npm11.12.1, Windows x64. 루트 engines는 >=22.10.0 <25이며 검증되지 않은 모든 버전에서의 통과를 뜻하지 않는다.

## 루트 웹/API

```sh
npm ci
npm run dev
npm run dev:api
npm test
npm run typecheck
npm run build
npm run test:contracts
node scripts/smoke-api.mjs
```

웹 dev는 Vite 기본5173 및 legacy API middleware를 포함한다. 독립 API는 실제 `src/server/server.ts`를 tsx로 실행하며 기본3001, `PORT`로 변경한다. PowerShell 예: `$env:PORT='3002'` 후 `npm run dev:api`. 점유 포트의 타 프로세스를 종료하지 않는다. smoke는 loopback 빈 포트를 조회 후 API를 시작하고 자신이 만든 프로세스만 종료한다. 조회/시작 사이 경쟁은 시작 실패로 처리한다. 기존 server.ts는 전체 인터페이스 bind이며 네트워크에 노출하지 않는 로컬 개발 환경에서 사용한다.

독립 API의 기존 seeded GET와 popular GET는 HTTP200 검증. PostgreSQL/v1/RAG/stamps route 통합은 아직 수용되지 않았다. 현재 Map 저장은 재시작 시 유지되지 않는다. `preview`는 정적 dist 미리보기로 API를 제공하지 않는다.

루트 viem2.56.8은 src/server와 jobs의 런타임 import용, tsx4.23.15는 TS entrypoint 실행용, esbuild0.25.12는 기존 QA 번들 검증의 직접 의존성이다. 지갑 UI에 정적 import하지 않았다. tsconfig는 src/jobs만 검사하고 chain 프로젝트를 별도로 둔다. Error.cause 타입은 실제 Node 런타임 지원에 맞춰 ES2022.Error lib를 추가했다.

## 테스트와 chain 경계

루트 Vitest는 chain/**를 명시 제외하되 src/server의 stamps 테스트와 jobs/chain-indexer 테스트는 실행한다. chain의 임시/broken dependency 디렉터리가 루트 테스트에 들어가지 않는다. 01의 node:test 검사 파일은 .check.mjs 명칭이며 `npm run test:contracts`로 별도 실행한다.

chain/package.json 및 chain/package-lock.json의 단일 작성자는04. chain 설치/compile/test/node는 해당 디렉터리에서04와 조정하여 실행한다. 루트 npm ci는 chain 의존성을 설치하지 않는다. 04의 다른 환경 테스트 기록을 이 PC 실행 성공으로 간주하지 않는다. chain compile 다운로드, 로컬 노드/DB namespace/포트/측정 창은 담당자 배정에 따른다. 공개 배포는 이 runbook의 실행 범위가 아니다.

## 패키지 요청

03/04는 목적, 정확 버전, runtime/dev 구분, 사용 entrypoint, 검증 명령을 본인 handoff에 기록해02에게 요청한다. root package/lock의 동시 install 금지. ENV 최소 인계 후에도 같은 소유권으로 신규 요청을 처리한다. 실제 엔트리포인트가 없거나 검증되지 않은 job은 실행 가능하다고 기재하지 않는다. provider/DB/서명 키는 파일을 조회하거나 출력하지 않고 각 담당 환경에 설정한다.

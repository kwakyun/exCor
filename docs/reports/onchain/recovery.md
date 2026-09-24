# P3-06: 이벤트 동기화 / reorg 복구 (agent_04)

- run_id: agent04-20260924T113206+0900-4cb7ca8
- base_commit: 4cb7ca83069f58103707426f215de5c96bddfe01
- **상태: provisional (mock 전용).** `depends_on: [P3-02, P3-DB]` 중 P3-DB가 아직 제출/수용되지
  않아, 실제 DB 대신 in-memory repository test double로 로직만 검증했다. 04-onchain.yaml
  `readiness.provisional_work` 범위 내 준비 작업이며 실제 연동 완료로 표시하지 않는다.

## 구성

- `jobs/chain-indexer/ports.ts` — `IndexerRepository`(03 실제 DB 구현 요구, `chain_events`/
  `stamp_projections`/`indexer_cursors` 세 테이블을 한 transaction으로), `IndexerChainReader`
  (좁은 읽기 인터페이스 — `src/server/providers/rpc/chainClient.ts`의 `ChainRpcProvider`가
  이 인터페이스를 구조적으로 만족해 재구현하지 않는다), `DeepReorgError`.
- `jobs/chain-indexer/indexer.ts` — `ChainIndexer.syncOnce()` 순수 로직. HTTP 요청 생명주기와
  분리된 별도 프로세스에서 주기 실행하는 것을 전제로 한다.
- `jobs/chain-indexer/runLoop.ts` — 프로세스 진입점. `INDEXER_RPC_URL`/`INDEXER_CHAIN_ID`/
  `INDEXER_CONFIRMATIONS`/`INDEXER_MAX_BLOCK_RANGE`/`INDEXER_POLL_INTERVAL_MS`/
  `INDEXER_REPOSITORY_MODULE` 환경변수로 구성한다. `INDEXER_REPOSITORY_MODULE`을 지정하지
  않으면 in-memory repository로 fallback하며, 그 경우 기동 로그에 "개발/시연 전용, 운영
  사용 금지" 경고를 매번 남긴다. `DeepReorgError` 발생 시 자동 복구를 시도하지 않고 루프를
  멈춘 뒤 비정상 종료(exit 1)한다 — 운영자가 deployment_block부터 재구축 도구로 수동 복구.
  SIGINT/SIGTERM 수신 시 진행 중인 사이클을 끝까지 마친 뒤 정지한다(부분 배치를 만들지 않음).
- `jobs/chain-indexer/testing/{inMemoryIndexerRepository,fakeIndexerChain}.ts` — 테스트 전용
  대체 구현.

## 알고리즘 요약

1. `getLatestBlockNumber()` - `confirmations`만큼 물러난 `confirmedTip`까지만 처리 대상으로
   삼는다(local 기본 0, 공개 배포 시 반드시 체인 특성에 맞게 상향).
2. 저장된 커서가 있으면 그 블록의 현재 체인 해시를 다시 조회해 저장된 해시와 비교한다.
   다르면 reorg로 판단하고, 저장된 "최근 블록 해시 창"(`getRecentBlockHashes`)을 최신부터
   훑어 현재 체인과 일치하는 첫 블록(공통 조상)을 찾아 그 지점까지 되돌린다
   (`rollbackToBlock`). 창 안에서 공통 조상을 못 찾으면 `DeepReorgError`를 던져 자동 복구를
   포기한다(더 깊은 재조직 — 재구축 필요).
3. reorg가 없으면 커서 다음 블록부터 `confirmedTip`까지(최대 `maxBlockRange`만큼) `StampClaimed`
   로그를 읽는다. 이번에 처리하는 구간의 **모든 블록 해시**(이벤트가 있는 블록은 로그의
   `blockHash` 재사용, 없는 블록만 별도 `getBlock()` 조회)를 모아 `processedBlocks`로 함께
   커밋한다 — 다음 reorg 감지 시 공통 조상을 찾을 수 있는 "최근 블록 창"을 유지하기 위함
   (커서 tip 하나만 저장하면 창이 사실상 1블록이 되어 얕은 reorg도 복구 실패한다 — 아래
   "발견한 버그" 참조).
4. 이벤트 upsert(재수집해도 (chainId,contract,txHash,logIndex) 기준 중복 생성 안 함) +
   projection 갱신(recipient+campaign+spot당 최신 canonical claim) + 커서 전진 + 최근 블록
   창 갱신을 한 번의 `applyCanonicalBatch` 호출로 원자적으로 수행한다(실제 DB에서는 한
   transaction, in-memory는 단일 이벤트 루프 동기 처리로 근사).
5. `rollbackToBlock`은 공통 조상보다 큰 블록에서 만들어진 이벤트를 `canonical=false`로
   표시하고, 그 이벤트가 만든 projection을 canonical 중 남은 가장 최근 이벤트로 재계산하거나
   (없으면) 제거한다.

## 개발 중 발견하고 고친 버그

`applyCanonicalBatch`가 최초 구현에서는 이번 배치의 **tip 블록 해시 하나만** 저장했다.
그 결과 재시작 없이도, 커서가 가리키는 블록이 바로 얼마 전 커밋의 tip이 아닌 이상 다음
reorg 감지에서 공통 조상을 찾지 못하고 `DeepReorgError`가 잘못 발생했다 — 얕은(창 범위
안의) reorg인데도 깊은 reorg로 오판하는 결함이었다. `processedBlocks: BlockRef[]`를
`applyCanonicalBatch` 입력에 추가해 이번 배치가 처리한 구간 전체의 블록 해시를 누적 저장
하도록 고쳤다(`ports.ts`, `testing/inMemoryIndexerRepository.ts`, `indexer.ts` 세 곳). 아래
테스트가 이 수정 전/후 차이를 직접 검증한다.

## 실행 검증

### 1) 단위 테스트 (in-memory repository + fake chain, `jobs/chain-indexer/__tests__/indexer.test.ts`)

```
cd (repo root, viem/vitest 설치된 위치 — 아래 "남은 리스크" 참조)
npx vitest run jobs/chain-indexer
```

5 tests, 모두 PASS: 정상 이벤트 수집, 재시작 후 재수집해도 중복 없음, `confirmations`만큼
최신 블록 보류, RPC 장애 시 `rpc_unavailable` 반환, **로컬 reorg 감지→공통 조상 복구→새
canonical 상태 반영**(취소된 branch의 projection 삭제, 공통 조상 이전 블록의 claim은 유지).

### 2) 실제 로컬 Hardhat 노드 + 실제 배포 컨트랙트에 대한 종단 간 스모크 테스트

fixture 재생이 아니라 실제 체인 상태에 대해 `runLoop.ts`를 실제로 기동했다. Hardhat 노드를
띄우고 Ignition으로 배포(`0x5FbDB2315678afecb367f032d93F642f64180aa3`), Hardhat 기본 니모닉
파생 계정(admin/issuer/recipient, 하드코딩 개인키 없음)으로 실제 `claim()` tx를 제출한 뒤,
`runLoop.ts`를 `INDEXER_RPC_URL=http://127.0.0.1:8545 INDEXER_CHAIN_ID=31337`로 실행했다.

```
[chain-indexer] 경고: INDEXER_REPOSITORY_MODULE이 설정되지 않아 in-memory repository로 동작한다. ...
[chain-indexer] 시작: chainId=31337 contract=0x5FbDB2315678afecb367f032d93F642f64180aa3 confirmations=0 maxBlockRange=2000 pollIntervalMs=1000 persistence=in-memory(dev-only)
[chain-indexer] 2026-09-24T02:25:39.148Z advanced fromBlock=1 toBlock=5 eventCount=1
[chain-indexer] 2026-09-24T02:25:40.118Z up_to_date processedBlockNumber=5
[chain-indexer] 2026-09-24T02:25:41.120Z up_to_date processedBlockNumber=5
...
[chain-indexer] SIGTERM 수신 - 진행 중인 사이클을 마친 뒤 정지한다.
[chain-indexer] 2026-09-24T02:25:44.116Z 정지 완료.
```

실제 `StampClaimed` 이벤트 1건을 수집(`eventCount=1`)하고 이후 `up_to_date`로 안정화됨을
확인했다. SIGTERM을 보내자 진행 중이던 사이클을 마친 뒤 정상 종료했다(부분 배치 없음).
**실 체인 reorg(예: `evm_revert`)까지의 종단 간 재현은 시간 관계상 하지 못했다** — reorg
복구 자체는 위 (1) 단위 테스트로 fake chain 시뮬레이터를 통해 검증했다.

### 3) 타입 검사

`npx tsc --noEmit` exit 0 (indexer.ts/ports.ts/runLoop.ts/testing/* 포함 전체).

## acceptance 대조

- **재시작/중복 수집**: (1)의 두 번째 테스트로 검증 — 새 `ChainIndexer` 인스턴스가 같은
  repository를 이어받아도 이미 처리한 이벤트를 다시 만들지 않는다.
- **로컬 reorg 복구**: (1)의 다섯 번째 테스트로 검증 — 공통 조상 이후 이벤트/projection 취소,
  공통 조상 이전은 유지.
- **온체인 상태와 projection 비교**: `getProjection`이 반환하는 마지막 canonical claim의
  txHash/blockNumber를 `hasStamp` 온체인 조회와 대조할 수 있는 구조다(실제 대조 스크립트는
  미작성 — P3-07 통합 단계에서 01이 요청하면 추가 가능).

## 남은 리스크 / 다음 조치

- 03의 실제 `IndexerRepository` 구현(PostgreSQL, 세 테이블 원자 commit)이 없으면 이 job은
  개발/시연 전용이다. `runLoop.ts`의 `INDEXER_REPOSITORY_MODULE` 환경변수로 03의 구현을
  나중에 교체 주입할 수 있게 설계했다(코드 변경 없이 팩토리 모듈 경로만 지정).
- 실제 체인 reorg 재현(로컬 노드 `evm_revert`/`evm_snapshot`)은 아직 실행하지 않았다.
- `confirmations` 값은 로컬 0으로 두었다 - 공개 테스트넷 배포 시 반드시 해당 체인의 재조직
  특성에 맞게 사람이 재검토해야 한다(04가 임의로 운영값을 정하지 않는다).

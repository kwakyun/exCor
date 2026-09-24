# P3-03: 계약 공격 및 가스 검증 (agent_04 개발 검증)

- run_id: agent04-20260924T113206+0900-4cb7ca8
- base_commit: 4cb7ca83069f58103707426f215de5c96bddfe01
- **이 문서의 모든 결과는 04(agent_04) 자신이 로컬에서 실행한 개발 검증이다**
  (04-onchain.yaml operating_rules: "04 자신이 실행한 테스트는 개발 검증으로 표시하고 01의
  독립 재현을 요청한다"). 01의 독립 재현을 요청한다.

## 재현 명령

```
cd chain
npm install                       # hardhat 3.17.0 / @nomicfoundation/hardhat-toolbox-viem 등
npm run compile                   # 표준 경로는 solidity 0.8.28을 binaries.soliditylang.org에서 내려받는다.
npm test                          # == hardhat test  (23 tests)
npm run test:gas                  # REPORT_GAS=true hardhat test
```

04의 개발 샌드박스는 조직 egress 정책으로 `binaries.soliditylang.org` 직접 다운로드가
차단되어 있어, npm 레지스트리로 받은 `solc` 패키지의 `soljson.js`를 직접 가리키는
`hardhat.config.sandbox.ts`(샌드박스 전용, 저장소에 포함하지 않음)로 컴파일했다. 실제
개발 환경(사용자 PC)에서는 `hardhat.config.ts`의 표준 다운로드 경로가 정상 동작해야
하며, 01은 `hardhat.config.ts`(표준 설정)로 재현하면 된다.

## 실행 결과 (샌드박스, hardhat.config.sandbox.ts)

```
23 passing (23 nodejs)
```

## 가스 스냅샷 (REPORT_GAS 커스텀 측정, `chain/test/AlleyStampRegistry.ts` 마지막 테스트)

| 호출 | gasUsed |
|---|---:|
| setIssuer(issuer,true) | 48598 |
| setCampaign(campaignId,true) | 48607 |
| setCampaignSpot(campaignId,spotId,true) | 49841 |
| claim(happy path) | 89444 |
| pause() | 47480 |
| unpause() | 25488 |

측정 환경: Hardhat EDR 시뮬레이션 네트워크(hardhatMainnet), solc 0.8.28, optimizer 미적용
(profiles.default). `production` 프로파일(optimizer runs=200)로 재컴파일하면 값이 달라질 수
있다 — 공개 배포 전 `production` 프로파일 기준으로 재측정이 필요하다(미실행, 리스크로 남김).

## rejectMutations 14개 항목 대조표 (claim-v1.md / docs/contracts/fixtures/claim-v1.json)

| # | 요구 항목 | 테스트 이름 (`chain/test/AlleyStampRegistry.ts`) | 결과 |
|---|---|---|---|
| 1 | recipient 변조 | recipient 변조 시 서명 검증에 실패한다 | PASS |
| 2 | campaignId 변조 | campaignId 변조 시 서명 검증에 실패한다 | PASS |
| 3 | spotId 변조 | spotId 변조 시 서명 검증에 실패한다 | PASS |
| 4 | nonce 변조 | nonce 변조 시 서명 검증에 실패한다 | PASS |
| 5 | deadline 변조 | deadline 변조 시 서명 검증에 실패한다 | PASS |
| 6 | domain.chainId 변조 | 다른 chainId로 서명된 claim은 domain 불일치로 거절된다 | PASS |
| 7 | domain.verifyingContract 변조 | 다른 계약 주소로 서명된 claim은 domain 불일치로 거절된다 | PASS |
| 8 | msg.sender ≠ recipient | 제3자가 유효한 서명을 그대로 제출하면 NotRecipient로 거절된다 | PASS |
| 9 | 폐기된(revoked) issuer | 폐기된 issuer의 서명은 이후 거절된다 | PASS |
| 10 | 이미 사용된 nonce | 같은 nonce로 다른 spot claim은 NonceAlreadyUsed로 거절된다 | PASS |
| 11 | 새 nonce로 중복 스탬프 | 새 nonce로 같은 recipient/campaign/spot 재발급도 StampAlreadyClaimed로 거절된다 | PASS |
| 12 | paused 상태에서 claim | (pause/unpause 역할 분리 테스트 내부에서) pause 중 claim은 EnforcedPause로 거절 | PASS |
| 13 | 비활성 캠페인 | 비활성 캠페인은 CampaignNotActive로 거절된다 | PASS |
| 14 | 미등록 장소 | 미등록 장소는 SpotNotAllowed로 거절된다 | PASS |

추가로 검증한 항목(rejectMutations 목록 밖):
- 허용되지 않은(issuer 등록 자체가 없는) 서명자 → `UnauthorizedIssuer`
- 동일 서명 재제출(정확히 같은 claim+signature 재전송) → `StampAlreadyClaimed`
- 동시 제출된 두 개의 유효한 claim tx 중 하나만 상태를 변경(경쟁 조건에서 이중 발급 없음)
- deadline 경계: `block.timestamp==deadline` 허용, `deadline+1` 거절 (`time.increaseTo(deadline-1)`로
  claim tx 자체가 mine되는 블록이 정확히 deadline에 오도록 만들어 검증 — `getBlock()`으로 실제
  타임스탬프까지 재확인)
- 권한 없는 계정의 `setCampaign`/`setIssuer`/`pause` 호출 거절(`AccessControlUnauthorizedAccount`)
- `PAUSER_ROLE`은 pause만, `unpause`는 `CAMPAIGN_ADMIN_ROLE`만 가능한 역할 분리

## 최대 1회 발급 불변식

`StampAlreadyClaimed`(같은 recipient+campaignId+spotId 재발급 거절, 새 nonce로도 우회 불가)와
`NonceAlreadyUsed`(같은 recipient+nonce 재사용 거절, 다른 spot으로도 우회 불가) 두 매핑을
독립적으로 검사하므로 어느 한쪽 우회로도 이중 발급이 불가능함을 각각의 테스트로 확인했다.

## 실제 로컬 체인 스모크 테스트 (fixture 재생이 아닌 실제 tx)

Hardhat 로컬 노드(`hardhat node --config hardhat.config.sandbox.ts`)를 띄우고 Ignition으로
실제 배포한 뒤, Hardhat 기본 니모닉 파생 계정(admin=#0, issuer=#1, recipient=#2 — 하드코딩된
개인키 없음)으로 `setCampaign`/`setCampaignSpot`/`setIssuer` → EIP-712 서명 → `claim()` 제출까지
전 과정을 실행했다.

```
contract: 0x5FbDB2315678afecb367f032d93F642f64180aa3
claim tx: 0x164aa08520eb927a49a251513c84310b3a5c5a52a95e7e33633f417d77876843 status: success block: 5
hasStamp after claim: true
```

## 남은 리스크 / 미실행

- `production` solidity 프로파일(optimizer 활성화) 기준 가스 재측정 미실행.
- 퍼징(예: Echidna/Foundry invariant)은 이번 범위에 포함하지 않았다 — unit/스모크 테스트만.
- 이 보고서 전체는 04 자신의 실행 결과이며 01의 독립 재현 전까지 PASS를 제품 AC 통과로
  간주하지 않는다(04-onchain.yaml readiness.quality).

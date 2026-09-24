# P3-01: 온체인 claim 계약 상세 (agent_04)

- run_id: agent04-20260924T113206+0900-4cb7ca8
- base_commit: 4cb7ca83069f58103707426f215de5c96bddfe01
- 참조한 C0 문서 버전: core-v1.0.0-rc2, api-v1.0.0-rc3, claim-v1.0.0-rc1(변경 없음, `assignments.md`: "core/claim은 rc1 유지")
- 참조한 `docs/contracts/claim-v1.md` SHA256: `f963864480c379d375f2ff739e333cc657c8cac73676c5d21233a72583d2508c`
  (`docs/reports/qa/evidence/c0-artifact-hashes.json` 기록과 대조)
- 상태: **ready_for_review** — `accepted_handoffs`가 아직 비어 있으므로(01 coordination/assignments.md),
  이 문서와 아래 handoff들은 01의 검토 대상이며 스스로 accepted로 표시하지 않는다.

이 문서는 `CLAIM-HANDOFF-04`(01→04, `docs/reports/coordination/dependency-requests.md`)에 대한 응답을
겸한다: `docs/contracts/fixtures/claim-v1.json`이 `status: "input-only-awaiting-agent04-hash-vectors"`로
두고 기다리던 해시 벡터를 아래에 제공한다. **그 파일은 01 소유(`docs/contracts/**`)이므로 04가 직접
덮어쓰지 않았다** — 01이 아래 값을 자신의 `expectedHashes`에 반영하면 된다.

## EIP-712 typed data

- domain: `{ name: "BusanAlleyStamp", version: "1", chainId, verifyingContract }`
- primaryType: `Claim`
- `Claim(address recipient,bytes32 campaignId,bytes32 spotId,uint256 nonce,uint256 deadline)`
  (claim-v1.md 원문과 필드 순서/타입 동일)
- `chainSpotId = keccak256(UTF-8 spotId)`, campaignId도 같은 변환 (`campaignIdToBytes32`,
  `spotIdToBytes32`, `src/server/providers/signing/claimTypedData.ts`). trim/대소문자/유니코드
  정규화를 하지 않는다.

## `docs/contracts/fixtures/claim-v1.json`의 입력에 대한 해시 벡터 (CLAIM-HANDOFF-04 응답)

01이 지정한 입력을 그대로 사용했다: `recipient=0x2222...2222, campaignIdText="busan-alley:demo:jeonpo:v1",
spotIdText="jp-f1", nonce="1", deadline="1790208000"`, domain `{chainId:31337,
verifyingContract:0x1111...1111}`.

```json
{
  "chainSpotId": "0x1f969455311e0a51dc56e7aa4de816a9cae53ef3c1150f3dbbd568f2a0c9f977",
  "campaignId": "0xa625ceeae7332dd8d9e563f95de4b0beeb3a432cd02b238047a7db3101cf468c",
  "eip712DomainTypehash": "0x8b73c3c69bb8fe3d512ecc4cf759cc79239f7b179b0ffacaa9a75d522b39400f",
  "claimTypehash": "0x9e1a39774938d305a1e50e86b52b24a25344571cc33fab1d7badf3257d1132dc",
  "domainSeparator": "0x047419b0301faf9739e3515e9d5b105c532f60ab95be54dc6b49e322086001be",
  "structHash": "0x2606edaabc0953c64dc2f7199f1677999a9ecb12dd9abb4f3d36200044494159",
  "digest": "0x8da2b6bc6bdcec1d1df4f5629047b23afc1e573277af695ab76d4815a8b8c0d3"
}
```

digest는 수기 keccak256 조합과 viem `hashTypedData` 두 경로로 각각 계산해 서로 일치함을
`chain/scripts/computeClaimFixture.ts`가 실행 시점에 자동 검증한다(불일치 시 스크립트가 예외를
던지고 종료 — 값을 임의로 맞춰 쓸 수 없는 구조). 전체 필드는 `chain/fixtures/claim-v1.json` 참조.

boundaryCases(`now=1790207999→allow, 1790208000→allow, 1790208001→reject`)는 해시가 아니라
계약 로직 규칙이며, `chain/test/AlleyStampRegistry.ts`의 "만료(deadline) 경계" 테스트로 실제
실행 검증했다(아래 P3-03 handoff 참조).

rejectMutations 14개 항목(recipient/campaignId/spotId/nonce/deadline/domain.chainId/
domain.verifyingContract/msg.sender/폐기 issuer/used nonce/duplicate stamp new nonce/paused/
inactive campaign/unregistered spot) 전부를 `chain/test/AlleyStampRegistry.ts`의 개별 테스트로
실행 검증했다 — 목록 대조는 P3-03 handoff에 항목별로 표로 남긴다.

개인키 원문은 이 문서와 fixture 어디에도 기록하지 않았다(issuer는 Hardhat/Foundry 공개
테스트 니모닉의 addressIndex 1 파생 계정 - `0x70997970C51812dc3A010C7d01b50e0d17dc79C8`).

## 컨트랙트 요약 (`chain/contracts/AlleyStampRegistry.sol`)

OpenZeppelin v5 `AccessControl` + `Pausable` + `EIP712`.

- Role: `CAMPAIGN_ADMIN_ROLE`(캠페인/스팟/issuer 등록, unpause), `PAUSER_ROLE`(pause만)
- `claim(Claim calldata approval, bytes calldata signature) external whenNotPaused`
  검증 순서(claim-v1.md와 동일): pause → `msg.sender==recipient`(`NotRecipient`) →
  `block.timestamp<=deadline`(초과 시 `ClaimExpired`) → 활성 campaign(`CampaignNotActive`)/허용
  spot(`SpotNotAllowed`) → 중복 발급(`StampAlreadyClaimed`)/nonce 재사용(`NonceAlreadyUsed`) →
  `_hashTypedDataV4`+`ECDSA.recover`로 서명자 복구 후 issuer 허용 목록 확인(`UnauthorizedIssuer`) →
  상태 갱신 + `StampClaimed` 이벤트.
- `hasStamp(recipient, campaignId, spotId) view returns (bool)`
- `hashClaim(Claim calldata) view returns (bytes32)` — 서버/지갑이 같은 digest를 재생산했는지
  스스로 검증할 수 있게 노출
- `setCampaign`, `setCampaignSpot`, `setIssuer`, `pause`, `unpause`

## 신뢰 경계 (claim-v1.md 4번째 문단 그대로 적용)

claim 서명은 "신뢰된 승인자(issuer)가 발급을 허용했다"는 사실만 증명한다. 체인이 실제 방문을
물리적으로 보증하지 않는다 — 방문 확인은 서버(P3-04)의 방문 승인 정책이 별도로 책임진다.
실방문 확인자·공개 지갑 인증/세션·보존기간은 claim-v1.md에 "미결정"으로 명시돼 있으며, 04는
로컬 모의 승인만 준비하고 공개 환경에 mock 승인 route를 등록하지 않았다(P3-04 handoff 참조).

## 03/02 조기 인계

- 03(P3-DB) 요청: 온체인 repository 계약(challenge 1회 소비, 방문/recipient 결합, 승인 멱등
  저장+nonce UNIQUE, event+projection+cursor 원자 commit, 공통 블록 rollback) — 상세 인터페이스는
  `jobs/chain-indexer/ports.ts`, `src/server/application/stamps/ports.ts`. P3-01 직후 제출 (아래
  P3-04/P3-06 handoff의 dependency_requests에 formal 기록).
- 02(ABI/wallet 상태) 요청: `chain/deployments/local-31337.json`(주소/ABI/시작블록 단일 출처),
  P3-04에서 정의한 UI 상태 머신(`awaiting_signature/submitted/confirming/confirmed/reverted/dropped`)
  — 상세는 P3-04 handoff.

## 남은 리스크

- `claim-v1.md`가 여전히 `ready_for_review`(rc1) — accepted 아님. 값이 바뀌면 계약/서버/지갑
  세 곳을 동시에 갱신해야 한다.
- 이 P3-01은 04 자신의 개발 검증이다. 01의 독립 재현(값 재계산, 서명 검증)을 요청한다.

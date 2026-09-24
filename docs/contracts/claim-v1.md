# C0 서명 계약

버전 claim-v1.0.0-rc1 · 문서 01 · typed data/chain/signing 04 · DTO/repository 03 · wallet 02 · ready_for_review

EIP-712 domain은 name `BusanAlleyStamp`, version `1`, chainId, verifyingContract.
primaryType은 Claim, 필드 순서와 타입은 정확히 다음과 같다.

```text
Claim(address recipient,bytes32 campaignId,bytes32 spotId,uint256 nonce,uint256 deadline)
```

정규 spotId는 catalog의 기존 ID 원문이다. trim/대소문자 변경/Unicode 정규화를 암묵적으로 하지 않는다. chainSpotId = keccak256(UTF-8 spotId). campaign의 문자열 ID도 같은 변환을 사용하되 별도 namespace 문자열 `busan-alley:demo:jeonpo:v1`을 사용한다. API는 사람이 읽는 spotId/campaignId와 typedData의 bytes32를 명확히 분리한다. SHA3-256으로 대체 금지. uint256 JSON은 십진 문자열, deadline은 Unix seconds, chainId도 fixture에서 십진 문자열로 전달하여 SDK 경계에서 bigint로 변환한다.

로컬 fixture chainId=31337, contract=0x1111111111111111111111111111111111111111, recipient=0x2222222222222222222222222222222222222222는 합성 주소이며 실제 배포 metadata가 아니다. `fixtures/claim-v1.json`의 입력으로 04가 chain/fixtures에 chainSpotId/campaign bytes32/domain separator/struct hash/digest/복구 주소를 생성하고 02·03 소비 경로와 비교한다. 미생성 해시를 정답으로 꾸며 쓰지 않는다. 실제 키와 서명은 조정 문서에 기록하지 않는다.

검증 순서: pause → sender==recipient → now<=deadline → 활성 campaign/허용 spot → recipient+campaign+spot 중복 및 recipient+nonce 중복 → 허용 issuer 서명 → 상태 갱신 및 StampClaimed 이벤트. nonce는 서버 CSPRNG/DB UNIQUE, 소비는 체인에서 원자 처리한다. deadline 직전/동일 허용, 직후 거절. 다른 chain/contract, 다섯 claim 필드 변조, 제3자 제출, 폐기 issuer, 중복 새 nonce도 거절한다.

관리자 campaign/spot/issuer 설정, 긴급 관리자 pause, unpause는 관리자. 운영 계정 선정·실방문 확인자·공개 지갑 인증/세션·보존기간은 미결정. 로컬 모의 방문 승인만 준비하고 공개 환경에는 mock 승인 route를 등록하지 않는다. claim 승인 서명은 실제 방문 또는 발급 확정의 증거가 아니다.

wallet challenge 5분/1회 원자 소비, visit challenge 5분, authorization 10분은 로컬 초안 fixture 정책. 지갑 서명 로그인과 발급 typed data를 혼용하지 않는다. 미승인/다른 지갑은 403, RPC 불가 시 새 승인 보류 503. 동일 방문/멱등 키 재시도는 동일 payload, 변조 본문 재시도 409. 만료 재발급은 미발급 온체인 확인 뒤 별도 정책 검토.

UI 상태 awaiting_signature/submitted/confirming/confirmed/reverted/dropped를 분리한다. txHash만으로 confirmed 금지. 조회는 chainId/contract/recipient/campaign/spot으로 한정하며 지갑 전환 시 이전 상태가 섞이지 않는다. local confirmations=1; 공개 값은 미정. event 키(chainId,contract,txHash,logIndex), blockHash와 cursor를 transaction으로 저장하고 reorg 시 이전 canonical projection을 취소한다. 재구축은 별도 테스트 namespace만 사용한다.

공개 배포/운영 인증 승인은 이 계약 작성에 포함되지 않는다. 04의 fixture 인계와 02 교차 검토가 없으면 실제 연결 게이트를 해제하지 않는다.

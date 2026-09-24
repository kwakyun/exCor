// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {EIP712} from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

/// @title AlleyStampRegistry
/// @notice 부산 골목 밸런서 P3 - 승인된 방문 스탬프의 비양도 레지스트리.
/// @dev 이 계약은 "허용된 서명자가 이 지갑에 발급을 승인했다"는 사실과 중복 여부만 검증한다.
///      실제 방문 여부는 오프체인 방문 확인자/서버가 판단하며, 이 계약이 물리적 방문을
///      직접 보증하지 않는다 (docs/architecture/implementation/03-onchain-system.md 1절).
///      토큰 전송, 결제, 쿠폰 정산, 외부 콜백은 포함하지 않는다 (claim-v1 계약 준수).
contract AlleyStampRegistry is AccessControl, Pausable, EIP712 {
    // ---------------------------------------------------------------------
    // 역할 (claim-v1: "관리자는 캠페인/장소/서명자 설정, 긴급 관리자는 pause,
    // 해제는 관리자만 수행하도록 역할을 구분한다")
    // ---------------------------------------------------------------------

    /// @notice 캠페인/장소/발급 서명자 설정 및 unpause를 수행하는 일반 관리자 역할.
    ///         DEFAULT_ADMIN_ROLE을 그대로 재사용하지 않고 별도 역할로 분리해
    ///         역할 부여/회수(role admin) 로직을 명시적으로 감사 가능하게 한다.
    bytes32 public constant CAMPAIGN_ADMIN_ROLE = keccak256("CAMPAIGN_ADMIN_ROLE");

    /// @notice 긴급 정지만 수행할 수 있는 역할. 해제(unpause)는 포함하지 않는다.
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    // ---------------------------------------------------------------------
    // EIP-712 typed data (claim-v1.md과 완전히 동일해야 한다. 필드 순서/타입을
    // 임의로 바꾸면 chain/fixtures/claim-v1.json의 digest가 더 이상 일치하지 않는다)
    // ---------------------------------------------------------------------

    bytes32 private constant CLAIM_TYPEHASH = keccak256(
        "Claim(address recipient,bytes32 campaignId,bytes32 spotId,uint256 nonce,uint256 deadline)"
    );

    struct Claim {
        address recipient;
        bytes32 campaignId;
        bytes32 spotId;
        uint256 nonce;
        uint256 deadline;
    }

    // ---------------------------------------------------------------------
    // 상태
    // ---------------------------------------------------------------------

    /// @dev stamps[recipient][campaignId][spotId] = 발급 여부. recipient당 campaign+spot
    ///      조합은 최대 1회만 true가 될 수 있다 (핵심 불변식).
    mapping(address => mapping(bytes32 => mapping(bytes32 => bool))) private _stamps;

    /// @dev usedNonces[recipient][nonce] = 사용 여부. 서명 재사용을 막는 2차 방어선이다.
    mapping(address => mapping(uint256 => bool)) private _usedNonces;

    mapping(bytes32 => bool) private _campaignActive;
    mapping(bytes32 => mapping(bytes32 => bool)) private _campaignSpotAllowed;
    mapping(address => bool) private _authorizedIssuer;

    // ---------------------------------------------------------------------
    // 이벤트 - 인덱서(jobs/chain-indexer)가 소비하는 유일한 온체인 상태 변화 신호.
    // 역할/캠페인/장소 변경에도 이벤트를 남긴다 (03-onchain-system.md 3절).
    // ---------------------------------------------------------------------

    event StampClaimed(
        address indexed recipient,
        bytes32 indexed campaignId,
        bytes32 indexed spotId,
        uint256 nonce
    );
    event CampaignSet(bytes32 indexed campaignId, bool active);
    event CampaignSpotSet(bytes32 indexed campaignId, bytes32 indexed spotId, bool allowed);
    event IssuerSet(address indexed issuer, bool allowed);

    // ---------------------------------------------------------------------
    // 오류 - 검증 순서(claim-v1.md): pause -> sender==recipient -> deadline ->
    // 활성 campaign/허용 spot -> 중복(stamp/nonce) -> 서명자 권한 -> 상태 갱신/이벤트
    // ---------------------------------------------------------------------

    error NotRecipient(address sender, address recipient);
    error ClaimExpired(uint256 deadline, uint256 blockTimestamp);
    error CampaignNotActive(bytes32 campaignId);
    error SpotNotAllowed(bytes32 campaignId, bytes32 spotId);
    error StampAlreadyClaimed(address recipient, bytes32 campaignId, bytes32 spotId);
    error NonceAlreadyUsed(address recipient, uint256 nonce);
    error UnauthorizedIssuer(address recoveredSigner);

    constructor(address admin) EIP712("BusanAlleyStamp", "1") {
        require(admin != address(0), "AlleyStampRegistry: zero admin");
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(CAMPAIGN_ADMIN_ROLE, admin);
        _grantRole(PAUSER_ROLE, admin);
        // DEFAULT_ADMIN_ROLE이 CAMPAIGN_ADMIN_ROLE/PAUSER_ROLE을 관리(부여/회수)한다.
        _setRoleAdmin(CAMPAIGN_ADMIN_ROLE, DEFAULT_ADMIN_ROLE);
        _setRoleAdmin(PAUSER_ROLE, DEFAULT_ADMIN_ROLE);
    }

    // ---------------------------------------------------------------------
    // claim - 유일한 상태 변경 진입점 (claim-v1.md 검증 순서를 그대로 구현)
    // ---------------------------------------------------------------------

    function claim(Claim calldata approval, bytes calldata signature) external whenNotPaused {
        if (msg.sender != approval.recipient) {
            revert NotRecipient(msg.sender, approval.recipient);
        }
        if (block.timestamp > approval.deadline) {
            revert ClaimExpired(approval.deadline, block.timestamp);
        }
        if (!_campaignActive[approval.campaignId]) {
            revert CampaignNotActive(approval.campaignId);
        }
        if (!_campaignSpotAllowed[approval.campaignId][approval.spotId]) {
            revert SpotNotAllowed(approval.campaignId, approval.spotId);
        }
        if (_stamps[approval.recipient][approval.campaignId][approval.spotId]) {
            revert StampAlreadyClaimed(approval.recipient, approval.campaignId, approval.spotId);
        }
        if (_usedNonces[approval.recipient][approval.nonce]) {
            revert NonceAlreadyUsed(approval.recipient, approval.nonce);
        }

        bytes32 structHash = keccak256(
            abi.encode(
                CLAIM_TYPEHASH,
                approval.recipient,
                approval.campaignId,
                approval.spotId,
                approval.nonce,
                approval.deadline
            )
        );
        bytes32 digest = _hashTypedDataV4(structHash);
        address recoveredSigner = ECDSA.recover(digest, signature);
        if (!_authorizedIssuer[recoveredSigner]) {
            revert UnauthorizedIssuer(recoveredSigner);
        }

        // Checks-Effects-Interactions: 외부 호출이 없으므로 재진입 위험은 없지만
        // 상태 갱신을 이벤트 발행 직전에 모아 원자적으로 반영한다.
        _usedNonces[approval.recipient][approval.nonce] = true;
        _stamps[approval.recipient][approval.campaignId][approval.spotId] = true;

        emit StampClaimed(approval.recipient, approval.campaignId, approval.spotId, approval.nonce);
    }

    // ---------------------------------------------------------------------
    // 조회 (공개 검증 화면 및 서버 status API가 사용)
    // ---------------------------------------------------------------------

    function hasStamp(address recipient, bytes32 campaignId, bytes32 spotId)
        external
        view
        returns (bool)
    {
        return _stamps[recipient][campaignId][spotId];
    }

    function isNonceUsed(address recipient, uint256 nonce) external view returns (bool) {
        return _usedNonces[recipient][nonce];
    }

    function isCampaignActive(bytes32 campaignId) external view returns (bool) {
        return _campaignActive[campaignId];
    }

    function isCampaignSpotAllowed(bytes32 campaignId, bytes32 spotId) external view returns (bool) {
        return _campaignSpotAllowed[campaignId][spotId];
    }

    function isIssuer(address issuer) external view returns (bool) {
        return _authorizedIssuer[issuer];
    }

    /// @notice 서버/SDK가 클라이언트 서명 없이 digest를 교차 검증할 수 있도록 공개한다.
    function hashClaim(Claim calldata approval) external view returns (bytes32) {
        bytes32 structHash = keccak256(
            abi.encode(
                CLAIM_TYPEHASH,
                approval.recipient,
                approval.campaignId,
                approval.spotId,
                approval.nonce,
                approval.deadline
            )
        );
        return _hashTypedDataV4(structHash);
    }

    // ---------------------------------------------------------------------
    // 관리자 설정 - 모두 이벤트를 남긴다.
    // ---------------------------------------------------------------------

    function setCampaign(bytes32 campaignId, bool active) external onlyRole(CAMPAIGN_ADMIN_ROLE) {
        _campaignActive[campaignId] = active;
        emit CampaignSet(campaignId, active);
    }

    function setCampaignSpot(bytes32 campaignId, bytes32 spotId, bool allowed)
        external
        onlyRole(CAMPAIGN_ADMIN_ROLE)
    {
        _campaignSpotAllowed[campaignId][spotId] = allowed;
        emit CampaignSpotSet(campaignId, spotId, allowed);
    }

    function setIssuer(address issuer, bool allowed) external onlyRole(CAMPAIGN_ADMIN_ROLE) {
        require(issuer != address(0), "AlleyStampRegistry: zero issuer");
        _authorizedIssuer[issuer] = allowed;
        emit IssuerSet(issuer, allowed);
    }

    // ---------------------------------------------------------------------
    // 긴급 정지 - pause는 PAUSER_ROLE, unpause는 CAMPAIGN_ADMIN_ROLE(관리자)만.
    // ---------------------------------------------------------------------

    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(CAMPAIGN_ADMIN_ROLE) {
        _unpause();
    }
}

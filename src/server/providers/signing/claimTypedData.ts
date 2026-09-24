/**
 * P3-01/P3-04 공유 EIP-712 typed data 정의.
 *
 * chain/contracts/AlleyStampRegistry.sol, chain/fixtures/claim-v1.json과 반드시 동일해야
 * 한다. 이 세 곳 중 하나만 바뀌면 서명 검증이 깨진다 - 값을 바꿀 때는 반드시
 * docs/contracts/claim-v1.md 개정과 세 소비처(계약/서버/지갑) 동시 갱신이 필요하다.
 */
import { keccak256, toBytes, type Address, type Hex } from "viem";

export const CLAIM_DOMAIN_NAME = "BusanAlleyStamp";
export const CLAIM_DOMAIN_VERSION = "1";

export const CLAIM_EIP712_TYPES = {
  Claim: [
    { name: "recipient", type: "address" },
    { name: "campaignId", type: "bytes32" },
    { name: "spotId", type: "bytes32" },
    { name: "nonce", type: "uint256" },
    { name: "deadline", type: "uint256" },
  ],
} as const;

export interface ClaimDomain {
  chainId: number;
  verifyingContract: Address;
}

export interface ClaimMessage {
  recipient: Address;
  campaignId: Hex;
  spotId: Hex;
  nonce: bigint;
  deadline: bigint;
}

/**
 * 캠페인 문자열 ID를 bytes32로 변환한다. claim-v1.md: campaign의 문자열 ID도 spotId와
 * 같은 keccak256(UTF-8) 변환을 사용한다. spotId와 혼동하지 않도록 이름을 구분한다.
 */
export function campaignIdToBytes32(campaignNamespace: string): Hex {
  return keccak256(toBytes(campaignNamespace));
}

/**
 * 정규 spotId(카탈로그 원문 문자열)를 bytes32로 변환한다. trim/대소문자/Unicode 정규화를
 * 암묵적으로 하지 않는다 (claim-v1.md).
 */
export function spotIdToBytes32(canonicalSpotId: string): Hex {
  return keccak256(toBytes(canonicalSpotId));
}

export function buildClaimTypedData(domain: ClaimDomain, message: ClaimMessage) {
  return {
    domain: {
      name: CLAIM_DOMAIN_NAME,
      version: CLAIM_DOMAIN_VERSION,
      chainId: domain.chainId,
      verifyingContract: domain.verifyingContract,
    },
    types: CLAIM_EIP712_TYPES,
    primaryType: "Claim" as const,
    message,
  };
}

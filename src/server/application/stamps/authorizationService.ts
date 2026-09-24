/**
 * P3-04 claim 발급 승인 서명 유스케이스. 지갑 세션 + 승인된 방문 + Idempotency-Key를
 * 받아 EIP-712 claim 서명을 생성한다.
 *
 * "서버가 claim 승인 서명을 반환하는 것과 사용자의 트랜잭션 발급은 별개다"
 * (03-onchain-system.md 4절) - 이 서비스는 서명까지만 책임지고, 온체인 확정 여부는
 * P3-06 인덱서/projection이 별도로 추적한다.
 */
import { keccak256, stringToHex, type Address, type Hex } from "viem";
import type { Clock, NonceGenerator, StampsRepository } from "./ports.js";
import { Errors } from "./errors.js";
import type { VisitService } from "./visitService.js";
import type { IssuerSigner } from "../../providers/signing/issuerSigner.js";
import type { ChainReader } from "../../providers/rpc/chainClient.js";
import { campaignIdToBytes32, spotIdToBytes32 } from "../../providers/signing/claimTypedData.js";

export const AUTHORIZATION_TTL_SECONDS = 10 * 60; // 03-onchain-system.md 4절: 10분 만료

export interface ClaimAuthorizationPayload {
  recipient: Address;
  campaignId: Hex;
  spotId: Hex;
  nonce: string;
  deadline: string;
  chainId: number;
  verifyingContract: Address;
}

export interface IssueAuthorizationResult {
  replayed: boolean;
  payload: ClaimAuthorizationPayload;
  signature: Hex;
}

function hashRequestBody(visitId: string, recipient: Address): Hex {
  return keccak256(stringToHex(`${visitId}:${recipient.toLowerCase()}`));
}

export class AuthorizationService {
  constructor(
    private readonly repo: StampsRepository,
    private readonly clock: Clock,
    private readonly nonceGenerator: NonceGenerator,
    private readonly issuerSigner: IssuerSigner,
    private readonly rpcProvider: ChainReader,
    private readonly visitService: VisitService,
  ) {}

  async issueAuthorization(
    sessionAddress: Address,
    visitId: string,
    idempotencyKey: string | undefined,
  ): Promise<IssueAuthorizationResult> {
    if (!idempotencyKey) {
      throw Errors.invalidInput("Idempotency-Key 헤더가 필요하다.");
    }

    const visit = await this.visitService.requireApprovedVisitForWallet(visitId, sessionAddress);
    const requestBodyHash = hashRequestBody(visitId, sessionAddress);
    const scope = `stamps:authorizations:${sessionAddress.toLowerCase()}`;

    const existing = await this.repo.findAuthorizationByIdempotencyKey(scope, idempotencyKey);
    if (existing) {
      if (existing.requestBodyHash !== requestBodyHash) {
        throw Errors.idempotencyConflict();
      }
      return this.#toResult(existing.state === "issued" || existing.state === "consumed", existing);
    }

    // RPC 불가 시 새 승인 보류 (503). 이미 발급된 경우 새 nonce를 만들지 않는다.
    let alreadyOnChain: boolean;
    try {
      alreadyOnChain = await this.rpcProvider.hasStamp(
        sessionAddress,
        campaignIdToBytes32(visit.campaignNamespace),
        spotIdToBytes32(visit.canonicalSpotId),
      );
    } catch {
      throw Errors.rpcUnavailable();
    }
    if (alreadyOnChain) {
      throw Errors.alreadyConfirmed();
    }

    const campaignId = campaignIdToBytes32(visit.campaignNamespace);
    const spotId = spotIdToBytes32(visit.canonicalSpotId);
    const nonce = this.nonceGenerator.generate();
    const deadline = (this.clock.nowSeconds() + AUTHORIZATION_TTL_SECONDS).toString();
    const domain = {
      chainId: this.rpcProvider.chainId,
      verifyingContract: this.rpcProvider.contractAddress,
    };

    const signature = await this.issuerSigner.signClaim(domain, {
      recipient: sessionAddress,
      campaignId,
      spotId,
      nonce: BigInt(nonce),
      deadline: BigInt(deadline),
    });

    const result = await this.repo.createAuthorizationIdempotent({
      visitId,
      recipient: sessionAddress,
      chainId: domain.chainId,
      contractAddress: domain.verifyingContract,
      campaignId,
      spotId,
      nonce,
      deadline,
      requestBodyHash,
      signature,
      idempotencyScope: scope,
      idempotencyKey,
    });

    if (result.kind === "conflict") {
      // 동시 요청이 먼저 커밋됨 - nonce 충돌 또는 본문 불일치. 안전하게 충돌로 보고한다.
      throw Errors.idempotencyConflict();
    }

    return this.#toResult(result.kind === "replayed", result.record);
  }

  #toResult(
    replayed: boolean,
    record: {
      recipient: Address;
      campaignId: Hex;
      spotId: Hex;
      nonce: string;
      deadline: string;
      chainId: number;
      contractAddress: Address;
      signature: Hex;
    },
  ): IssueAuthorizationResult {
    return {
      replayed,
      payload: {
        recipient: record.recipient,
        campaignId: record.campaignId,
        spotId: record.spotId,
        nonce: record.nonce,
        deadline: record.deadline,
        chainId: record.chainId,
        verifyingContract: record.contractAddress,
      },
      signature: record.signature,
    };
  }
}

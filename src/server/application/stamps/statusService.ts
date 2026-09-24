/**
 * P3-04 발급 상태 조회. 체인이 원본이고 DB(추후 인덱서 projection)는 조회용 사본이다
 * (03-onchain-system.md 6절). 이 서비스는 DB projection 대신 RPC hasStamp를 직접 사용해
 * 최소 기능을 만족하고, P3-06 인덱서가 projection을 제공하면 그쪽으로 대체할 수 있다.
 */
import type { Address, Hex } from "viem";
import type { ChainReader } from "../../providers/rpc/chainClient.js";
import { campaignIdToBytes32, spotIdToBytes32 } from "../../providers/signing/claimTypedData.js";
import { Errors } from "./errors.js";

export type StampStatus = "not_issued" | "pending" | "confirmed";

export interface StampStatusResult {
  status: StampStatus;
  chainId: number;
  contractAddress: Address;
  campaignId: Hex;
  spotId: Hex;
  lastCheckedAt: number;
}

export class StatusService {
  constructor(private readonly rpcProvider: ChainReader) {}

  async getStatus(
    recipient: Address,
    campaignNamespace: string,
    canonicalSpotId: string,
    hasPendingAuthorization: boolean,
  ): Promise<StampStatusResult> {
    const campaignId = campaignIdToBytes32(campaignNamespace);
    const spotId = spotIdToBytes32(canonicalSpotId);

    let confirmed: boolean;
    try {
      confirmed = await this.rpcProvider.hasStamp(recipient, campaignId, spotId);
    } catch {
      throw Errors.rpcUnavailable(
        "체인 RPC에 연결할 수 없어 상태를 확정할 수 없다. 확정 완료로 추정하지 않는다.",
      );
    }

    const status: StampStatus = confirmed ? "confirmed" : hasPendingAuthorization ? "pending" : "not_issued";

    return {
      status,
      chainId: this.rpcProvider.chainId,
      contractAddress: this.rpcProvider.contractAddress,
      campaignId,
      spotId,
      lastCheckedAt: Math.floor(Date.now() / 1000),
    };
  }
}

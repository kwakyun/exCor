import type { Address, Hex } from "viem";
import type { ChainReader } from "../../../providers/rpc/chainClient.js";

/** 테스트 전용 ChainReader. 실제 RPC 없이 hasStamp 결과를 미리 지정한다. */
export class FakeChainReader implements ChainReader {
  #stamped = new Set<string>();

  constructor(
    public readonly contractAddress: Address = "0x1111111111111111111111111111111111111111",
    public readonly chainId: number = 31337,
  ) {}

  markStamped(recipient: Address, campaignId: Hex, spotId: Hex): void {
    this.#stamped.add(`${recipient.toLowerCase()}:${campaignId}:${spotId}`);
  }

  async hasStamp(recipient: Address, campaignId: Hex, spotId: Hex): Promise<boolean> {
    return this.#stamped.has(`${recipient.toLowerCase()}:${campaignId}:${spotId}`);
  }
}

export class UnavailableChainReader implements ChainReader {
  public readonly contractAddress: Address = "0x1111111111111111111111111111111111111111";
  public readonly chainId: number = 31337;

  async hasStamp(): Promise<boolean> {
    throw new Error("RPC_UNAVAILABLE (fake)");
  }
}

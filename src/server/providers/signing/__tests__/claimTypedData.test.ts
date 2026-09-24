import { describe, expect, it } from "vitest";
import { hashTypedData } from "viem";
import {
  buildClaimTypedData,
  campaignIdToBytes32,
  spotIdToBytes32,
} from "../claimTypedData.js";
import claimFixture from "../../../../../chain/fixtures/claim-v1.json" with { type: "json" };

describe("claimTypedData", () => {
  it("campaignIdToBytes32/spotIdToBytes32가 chain/fixtures/claim-v1.json의 값과 일치한다", () => {
    expect(campaignIdToBytes32(claimFixture.input.campaignNamespace)).toBe(
      claimFixture.derived.campaignId,
    );
    expect(spotIdToBytes32(claimFixture.input.canonicalSpotId)).toBe(
      claimFixture.derived.chainSpotId,
    );
  });

  it("buildClaimTypedData가 chain/fixtures/claim-v1.json과 동일한 digest를 만든다", () => {
    const typedData = buildClaimTypedData(
      {
        chainId: claimFixture.domain.chainId,
        verifyingContract: claimFixture.domain.verifyingContract as `0x${string}`,
      },
      {
        recipient: claimFixture.message.recipient as `0x${string}`,
        campaignId: claimFixture.message.campaignId as `0x${string}`,
        spotId: claimFixture.message.spotId as `0x${string}`,
        nonce: BigInt(claimFixture.message.nonce),
        deadline: BigInt(claimFixture.message.deadline),
      },
    );

    const digest = hashTypedData(typedData);
    expect(digest.toLowerCase()).toBe(claimFixture.hashes.digest.toLowerCase());
  });
});

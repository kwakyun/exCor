import { describe, expect, it } from "vitest";
import { privateKeyToAccount, generatePrivateKey } from "viem/accounts";
import { FakeChainReader, UnavailableChainReader } from "../testing/fakeChainReader.js";
import { StatusService } from "../statusService.js";
import { campaignIdToBytes32, spotIdToBytes32 } from "../../../providers/signing/claimTypedData.js";

const CAMPAIGN = "busan-alley:demo:jeonpo:v1";
const SPOT = "jp-c1";

describe("StatusService", () => {
  it("온체인에 없고 pending 승인도 없으면 not_issued", async () => {
    const service = new StatusService(new FakeChainReader());
    const account = privateKeyToAccount(generatePrivateKey());
    const result = await service.getStatus(account.address, CAMPAIGN, SPOT, false);
    expect(result.status).toBe("not_issued");
  });

  it("온체인에 없지만 pending 승인이 있으면 pending", async () => {
    const service = new StatusService(new FakeChainReader());
    const account = privateKeyToAccount(generatePrivateKey());
    const result = await service.getStatus(account.address, CAMPAIGN, SPOT, true);
    expect(result.status).toBe("pending");
  });

  it("온체인에 있으면 pending 여부와 무관하게 confirmed", async () => {
    const chainReader = new FakeChainReader();
    const account = privateKeyToAccount(generatePrivateKey());
    chainReader.markStamped(account.address, campaignIdToBytes32(CAMPAIGN), spotIdToBytes32(SPOT));
    const service = new StatusService(chainReader);

    const result = await service.getStatus(account.address, CAMPAIGN, SPOT, true);
    expect(result.status).toBe("confirmed");
  });

  it("RPC 장애 시 확정 완료로 추정하지 않고 503을 던진다", async () => {
    const service = new StatusService(new UnavailableChainReader());
    const account = privateKeyToAccount(generatePrivateKey());
    await expect(service.getStatus(account.address, CAMPAIGN, SPOT, true)).rejects.toMatchObject({
      code: "RPC_UNAVAILABLE",
    });
  });
});

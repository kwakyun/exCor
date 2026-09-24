import { describe, expect, it } from "vitest";
import { recoverTypedDataAddress } from "viem";
import { generatePrivateKey } from "viem/accounts";
import { InMemoryTestIssuerSigner, ConfigMissingError, EnvIssuerSigner } from "../issuerSigner.js";
import { buildClaimTypedData } from "../claimTypedData.js";

// 테스트 실행마다 새로 생성하는 임시 키 (실제 자금/권한 없음). 이 값은 프로세스 메모리
// 밖으로 나가지 않으며 어떤 문서/로그에도 기록하지 않는다.
const TEST_PRIVATE_KEY = generatePrivateKey();

describe("IssuerSigner", () => {
  it("signClaim이 생성한 서명을 recoverTypedDataAddress로 복구하면 서명자 주소와 일치한다", async () => {
    const signer = new InMemoryTestIssuerSigner(TEST_PRIVATE_KEY);
    const address = await signer.getAddress();

    const domain = { chainId: 31337, verifyingContract: "0x1111111111111111111111111111111111111111" as const };
    const message = {
      recipient: "0x2222222222222222222222222222222222222222" as const,
      campaignId: ("0x" + "aa".repeat(32)) as `0x${string}`,
      spotId: ("0x" + "bb".repeat(32)) as `0x${string}`,
      nonce: 42n,
      deadline: 2000000000n,
    };

    const signature = await signer.signClaim(domain, message);
    const typedData = buildClaimTypedData(domain, message);
    const recovered = await recoverTypedDataAddress({ ...typedData, signature });

    expect(recovered.toLowerCase()).toBe(address.toLowerCase());
  });

  it("EnvIssuerSigner는 STAMP_ISSUER_PRIVATE_KEY가 없으면 ConfigMissingError를 던진다", () => {
    expect(() => EnvIssuerSigner.fromEnv({} as NodeJS.ProcessEnv)).toThrow(ConfigMissingError);
  });
});

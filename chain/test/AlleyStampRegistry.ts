// P3-03: 위조 · 재사용 · 권한 · 만료 · 가스 검증.
//
// 이 파일의 테스트는 04(agent_04) 자신이 로컬에서 실행한 개발 검증이다.
// 04-onchain.yaml operating_rules: "04 자신이 실행한 테스트는 개발 검증으로 표시하고
// 01의 독립 재현을 요청한다" - docs/reports/onchain/security-gas.md에 재현 명령을 남긴다.
import assert from "node:assert/strict";
import { describe, it, before } from "node:test";
import { network } from "hardhat";
import {
  getAddress,
  keccak256,
  toBytes,
  type Address,
  type Hex,
} from "viem";

const CLAIM_TYPES = {
  Claim: [
    { name: "recipient", type: "address" },
    { name: "campaignId", type: "bytes32" },
    { name: "spotId", type: "bytes32" },
    { name: "nonce", type: "uint256" },
    { name: "deadline", type: "uint256" },
  ],
} as const;

// chain/fixtures/claim-v1.json과 동일한 값 (파일을 import하면 message.campaignId 등이
// 이미 파생된 bytes32라 재사용하기 좋다).
import claimFixture from "../fixtures/claim-v1.json" with { type: "json" };

type ClaimStruct = {
  recipient: Address;
  campaignId: Hex;
  spotId: Hex;
  nonce: bigint;
  deadline: bigint;
};

describe("AlleyStampRegistry", async function () {
  const { viem, networkHelpers } = await network.create();
  const publicClient = await viem.getPublicClient();
  const chainId = await publicClient.getChainId();
  const walletClients = await viem.getWalletClients();

  const [deployerClient, issuerClient, recipientClient, strangerClient, guardClient] =
    walletClients;
  const admin = getAddress(deployerClient.account.address);
  const issuer = getAddress(issuerClient.account.address);
  const recipient = getAddress(recipientClient.account.address);
  const stranger = getAddress(strangerClient.account.address);

  const campaignId = claimFixture.derived.campaignId as Hex;
  const spotId = claimFixture.derived.chainSpotId as Hex;
  // 메인 spotId가 fixture 갱신(CLAIM-HANDOFF-04 대응)으로 jp-f1이 되어, 서로 다른 두
  // 번째 spot 값으로 jp-c1을 대신 쓴다. 둘 다 src/data/busanAlleys.ts의 실제 카탈로그 ID.
  const otherSpotId = keccak256(toBytes("jp-c1"));

  let nonceCounter = 1n;
  function nextNonce(): bigint {
    nonceCounter += 1n;
    return nonceCounter;
  }

  async function deployRegistry() {
    const registry = await viem.deployContract("AlleyStampRegistry", [admin]);
    return registry;
  }

  async function domainFor(contractAddress: Address) {
    return {
      name: "BusanAlleyStamp",
      version: "1",
      chainId,
      verifyingContract: contractAddress,
    } as const;
  }

  async function signClaim(
    signerClient: (typeof walletClients)[number],
    contractAddress: Address,
    claimStruct: ClaimStruct,
  ) {
    const domain = await domainFor(contractAddress);
    return signerClient.signTypedData({
      account: signerClient.account,
      domain,
      types: CLAIM_TYPES,
      primaryType: "Claim",
      message: claimStruct,
    });
  }

  async function setUpActiveCampaign(registry: Awaited<ReturnType<typeof deployRegistry>>) {
    await registry.write.setIssuer([issuer, true], { account: admin });
    await registry.write.setCampaign([campaignId, true], { account: admin });
    await registry.write.setCampaignSpot([campaignId, spotId, true], { account: admin });
  }

  function futureDeadline(latest: number, offsetSeconds = 3600): bigint {
    return BigInt(latest + offsetSeconds);
  }

  /**
   * viem.assertions.revert()는 "커스텀 에러가 아닌" 일반 revert만 매칭하므로
   * (커스텀 에러 revert는 실패로 처리한다), 커스텀 에러 여부를 가리지 않고
   * "어쨌든 reject되어야 한다"만 확인할 때는 이 헬퍼를 사용한다.
   */
  async function assertReverts(promise: Promise<unknown>): Promise<void> {
    try {
      await promise;
    } catch {
      return;
    }
    assert.fail("트랜잭션이 revert되어야 하는데 성공했다");
  }

  // -------------------------------------------------------------------
  // 1. fixture parity - chain/fixtures/claim-v1.json의 EIP-712 계산 로직이
  //    실제 배포된 계약의 _hashTypedDataV4 구현과 정확히 일치하는지 확인한다.
  //    fixture의 domain.verifyingContract(0x1111...)은 claim-v1.md 명시대로 합성
  //    주소이므로, 실제 배포 주소로 domain을 재구성해 digest 계산 "공식"이
  //    일치하는지를 검증한다 (숫자 자체의 우연한 일치가 아니라 알고리즘 일치).
  // -------------------------------------------------------------------
  describe("fixture parity (P3-01 claim-v1.json)", function () {
    it("hashClaim()이 viem hashTypedData와 동일한 digest를 반환한다", async function () {
      const registry = await deployRegistry();
      const claimStruct: ClaimStruct = {
        recipient: claimFixture.message.recipient as Address,
        campaignId: claimFixture.message.campaignId as Hex,
        spotId: claimFixture.message.spotId as Hex,
        nonce: BigInt(claimFixture.message.nonce),
        deadline: BigInt(claimFixture.message.deadline),
      };

      const onChainDigest = await registry.read.hashClaim([claimStruct]);

      const { hashTypedData } = await import("viem");
      const domain = await domainFor(registry.address);
      const offChainDigest = hashTypedData({
        domain,
        types: CLAIM_TYPES,
        primaryType: "Claim",
        message: claimStruct,
      });

      assert.equal(onChainDigest.toLowerCase(), offChainDigest.toLowerCase());
    });
  });

  // -------------------------------------------------------------------
  // 2. 정상 경로
  // -------------------------------------------------------------------
  describe("정상 claim", function () {
    it("승인된 방문에 대해 정확히 1회 발급되고 이벤트가 발생한다", async function () {
      const registry = await deployRegistry();
      await setUpActiveCampaign(registry);

      const latest = await networkHelpers.time.latest();
      const claimStruct: ClaimStruct = {
        recipient,
        campaignId,
        spotId,
        nonce: nextNonce(),
        deadline: futureDeadline(latest),
      };
      const signature = await signClaim(issuerClient, registry.address, claimStruct);

      await viem.assertions.emitWithArgs(
        registry.write.claim([claimStruct, signature], { account: recipient }),
        registry,
        "StampClaimed",
        [recipient, campaignId, spotId, claimStruct.nonce],
      );

      assert.equal(await registry.read.hasStamp([recipient, campaignId, spotId]), true);
      assert.equal(await registry.read.isNonceUsed([recipient, claimStruct.nonce]), true);
    });
  });

  // -------------------------------------------------------------------
  // 3. 재사용 / 중복
  // -------------------------------------------------------------------
  describe("재사용 및 중복 방지", function () {
    it("동일 서명 재제출은 StampAlreadyClaimed로 거절된다", async function () {
      const registry = await deployRegistry();
      await setUpActiveCampaign(registry);
      const latest = await networkHelpers.time.latest();
      const claimStruct: ClaimStruct = {
        recipient,
        campaignId,
        spotId,
        nonce: nextNonce(),
        deadline: futureDeadline(latest),
      };
      const signature = await signClaim(issuerClient, registry.address, claimStruct);

      await registry.write.claim([claimStruct, signature], { account: recipient });

      await viem.assertions.revertWithCustomError(
        registry.write.claim([claimStruct, signature], { account: recipient }),
        registry,
        "StampAlreadyClaimed",
      );
    });

    it("새 nonce로 같은 recipient/campaign/spot 재발급도 StampAlreadyClaimed로 거절된다", async function () {
      const registry = await deployRegistry();
      await setUpActiveCampaign(registry);
      const latest = await networkHelpers.time.latest();

      const first: ClaimStruct = {
        recipient,
        campaignId,
        spotId,
        nonce: nextNonce(),
        deadline: futureDeadline(latest),
      };
      await registry.write.claim(
        [first, await signClaim(issuerClient, registry.address, first)],
        { account: recipient },
      );

      const second: ClaimStruct = {
        recipient,
        campaignId,
        spotId,
        nonce: nextNonce(), // 완전히 새로운 nonce
        deadline: futureDeadline(latest),
      };
      const secondSignature = await signClaim(issuerClient, registry.address, second);

      await viem.assertions.revertWithCustomError(
        registry.write.claim([second, secondSignature], { account: recipient }),
        registry,
        "StampAlreadyClaimed",
      );
    });

    it("같은 nonce로 다른 spot claim은 NonceAlreadyUsed로 거절된다", async function () {
      const registry = await deployRegistry();
      await setUpActiveCampaign(registry);
      await registry.write.setCampaignSpot([campaignId, otherSpotId, true], { account: admin });
      const latest = await networkHelpers.time.latest();
      const sharedNonce = nextNonce();

      const first: ClaimStruct = { recipient, campaignId, spotId, nonce: sharedNonce, deadline: futureDeadline(latest) };
      await registry.write.claim(
        [first, await signClaim(issuerClient, registry.address, first)],
        { account: recipient },
      );

      const second: ClaimStruct = {
        recipient,
        campaignId,
        spotId: otherSpotId,
        nonce: sharedNonce,
        deadline: futureDeadline(latest),
      };
      const secondSignature = await signClaim(issuerClient, registry.address, second);

      await viem.assertions.revertWithCustomError(
        registry.write.claim([second, secondSignature], { account: recipient }),
        registry,
        "NonceAlreadyUsed",
      );
    });

    it("동시 제출된 두 claim 중 하나만 상태를 변경한다", async function () {
      const registry = await deployRegistry();
      await setUpActiveCampaign(registry);
      const latest = await networkHelpers.time.latest();

      const claimA: ClaimStruct = { recipient, campaignId, spotId, nonce: nextNonce(), deadline: futureDeadline(latest) };
      const claimB: ClaimStruct = { recipient, campaignId, spotId, nonce: nextNonce(), deadline: futureDeadline(latest) };
      const [sigA, sigB] = await Promise.all([
        signClaim(issuerClient, registry.address, claimA),
        signClaim(issuerClient, registry.address, claimB),
      ]);

      const results = await Promise.allSettled([
        registry.write.claim([claimA, sigA], { account: recipient }),
        registry.write.claim([claimB, sigB], { account: recipient }),
      ]);

      const fulfilled = results.filter((r) => r.status === "fulfilled");
      const rejected = results.filter((r) => r.status === "rejected");
      assert.equal(fulfilled.length, 1, "정확히 하나의 claim만 성공해야 한다");
      assert.equal(rejected.length, 1, "나머지 하나는 반드시 거절되어야 한다");
      assert.equal(await registry.read.hasStamp([recipient, campaignId, spotId]), true);
    });
  });

  // -------------------------------------------------------------------
  // 4. 위조 / 권한
  // -------------------------------------------------------------------
  describe("위조 및 권한 검증", function () {
    it("허용되지 않은 서명자(발급 권한 없음)는 UnauthorizedIssuer로 거절된다", async function () {
      const registry = await deployRegistry();
      await setUpActiveCampaign(registry);
      const latest = await networkHelpers.time.latest();
      const claimStruct: ClaimStruct = { recipient, campaignId, spotId, nonce: nextNonce(), deadline: futureDeadline(latest) };
      // recipient 본인이 서명 (issuer 권한 없음)
      const forgedSignature = await signClaim(recipientClient, registry.address, claimStruct);

      await viem.assertions.revertWithCustomError(
        registry.write.claim([claimStruct, forgedSignature], { account: recipient }),
        registry,
        "UnauthorizedIssuer",
      );
    });

    it("폐기된 issuer의 서명은 이후 거절된다", async function () {
      const registry = await deployRegistry();
      await setUpActiveCampaign(registry);
      await registry.write.setIssuer([issuer, false], { account: admin }); // 즉시 폐기

      const latest = await networkHelpers.time.latest();
      const claimStruct: ClaimStruct = { recipient, campaignId, spotId, nonce: nextNonce(), deadline: futureDeadline(latest) };
      const signature = await signClaim(issuerClient, registry.address, claimStruct);

      await viem.assertions.revertWithCustomError(
        registry.write.claim([claimStruct, signature], { account: recipient }),
        registry,
        "UnauthorizedIssuer",
      );
    });

    for (const field of ["recipient", "campaignId", "spotId", "nonce", "deadline"] as const) {
      it(`${field} 변조 시 서명 검증에 실패한다`, async function () {
        const registry = await deployRegistry();
        await setUpActiveCampaign(registry);
        await registry.write.setCampaignSpot([campaignId, otherSpotId, true], { account: admin });
        const latest = await networkHelpers.time.latest();
        const original: ClaimStruct = { recipient, campaignId, spotId, nonce: nextNonce(), deadline: futureDeadline(latest) };
        const signature = await signClaim(issuerClient, registry.address, original);

        const tampered: ClaimStruct = { ...original };
        if (field === "recipient") tampered.recipient = stranger;
        if (field === "campaignId") tampered.campaignId = keccak256(toBytes("busan-alley:demo:other:v1"));
        if (field === "spotId") tampered.spotId = otherSpotId;
        if (field === "nonce") tampered.nonce = nextNonce();
        if (field === "deadline") tampered.deadline = original.deadline + 1n;

        // recipient가 바뀐 경우 원래 recipient로 제출하면 NotRecipient가 먼저 걸리므로
        // msg.sender도 함께 tampered.recipient로 맞춰 서명 불일치 자체를 검증한다.
        const sender = field === "recipient" ? stranger : recipient;

        await assertReverts(
          registry.write.claim([tampered, signature], { account: sender }),
        );
      });
    }

    it("다른 chainId로 서명된 claim은 domain 불일치로 거절된다", async function () {
      const registry = await deployRegistry();
      await setUpActiveCampaign(registry);
      const latest = await networkHelpers.time.latest();
      const claimStruct: ClaimStruct = { recipient, campaignId, spotId, nonce: nextNonce(), deadline: futureDeadline(latest) };

      const wrongDomainSignature = await issuerClient.signTypedData({
        account: issuerClient.account,
        domain: { name: "BusanAlleyStamp", version: "1", chainId: 1, verifyingContract: registry.address },
        types: CLAIM_TYPES,
        primaryType: "Claim",
        message: claimStruct,
      });

      await viem.assertions.revertWithCustomError(
        registry.write.claim([claimStruct, wrongDomainSignature], { account: recipient }),
        registry,
        "UnauthorizedIssuer",
      );
    });

    it("다른 계약 주소로 서명된 claim은 domain 불일치로 거절된다", async function () {
      const registryA = await deployRegistry();
      const registryB = await deployRegistry();
      await setUpActiveCampaign(registryA);
      await setUpActiveCampaign(registryB);
      const latest = await networkHelpers.time.latest();
      const claimStruct: ClaimStruct = { recipient, campaignId, spotId, nonce: nextNonce(), deadline: futureDeadline(latest) };

      // registryB 도메인으로 서명한 것을 registryA에 제출
      const signatureForB = await signClaim(issuerClient, registryB.address, claimStruct);

      await viem.assertions.revertWithCustomError(
        registryA.write.claim([claimStruct, signatureForB], { account: recipient }),
        registryA,
        "UnauthorizedIssuer",
      );
    });

    it("제3자가 유효한 서명을 그대로 제출하면 NotRecipient로 거절된다", async function () {
      const registry = await deployRegistry();
      await setUpActiveCampaign(registry);
      const latest = await networkHelpers.time.latest();
      const claimStruct: ClaimStruct = { recipient, campaignId, spotId, nonce: nextNonce(), deadline: futureDeadline(latest) };
      const signature = await signClaim(issuerClient, registry.address, claimStruct);

      await viem.assertions.revertWithCustomErrorWithArgs(
        registry.write.claim([claimStruct, signature], { account: stranger }),
        registry,
        "NotRecipient",
        [stranger, recipient],
      );
    });

    it("비활성 캠페인은 CampaignNotActive로 거절된다", async function () {
      const registry = await deployRegistry();
      await registry.write.setIssuer([issuer, true], { account: admin });
      // setCampaign을 호출하지 않음 -> 비활성 상태
      await registry.write.setCampaignSpot([campaignId, spotId, true], { account: admin });
      const latest = await networkHelpers.time.latest();
      const claimStruct: ClaimStruct = { recipient, campaignId, spotId, nonce: nextNonce(), deadline: futureDeadline(latest) };
      const signature = await signClaim(issuerClient, registry.address, claimStruct);

      await viem.assertions.revertWithCustomErrorWithArgs(
        registry.write.claim([claimStruct, signature], { account: recipient }),
        registry,
        "CampaignNotActive",
        [campaignId],
      );
    });

    it("미등록 장소는 SpotNotAllowed로 거절된다", async function () {
      const registry = await deployRegistry();
      await registry.write.setIssuer([issuer, true], { account: admin });
      await registry.write.setCampaign([campaignId, true], { account: admin });
      // setCampaignSpot을 호출하지 않음
      const latest = await networkHelpers.time.latest();
      const claimStruct: ClaimStruct = { recipient, campaignId, spotId, nonce: nextNonce(), deadline: futureDeadline(latest) };
      const signature = await signClaim(issuerClient, registry.address, claimStruct);

      await viem.assertions.revertWithCustomErrorWithArgs(
        registry.write.claim([claimStruct, signature], { account: recipient }),
        registry,
        "SpotNotAllowed",
        [campaignId, spotId],
      );
    });

    it("권한 없는 계정의 setCampaign/setIssuer/pause 호출은 거절된다", async function () {
      const registry = await deployRegistry();

      await viem.assertions.revertWithCustomError(
        registry.write.setCampaign([campaignId, true], { account: stranger }),
        registry,
        "AccessControlUnauthorizedAccount",
      );
      await viem.assertions.revertWithCustomError(
        registry.write.setIssuer([issuer, true], { account: stranger }),
        registry,
        "AccessControlUnauthorizedAccount",
      );
      await viem.assertions.revertWithCustomError(
        registry.write.pause([], { account: stranger }),
        registry,
        "AccessControlUnauthorizedAccount",
      );
    });
  });

  // -------------------------------------------------------------------
  // 5. 만료 경계
  // -------------------------------------------------------------------
  describe("만료(deadline) 경계", function () {
    it("deadline과 정확히 같은 블록 시각은 허용된다", async function () {
      const registry = await deployRegistry();
      await setUpActiveCampaign(registry);
      const latest = await networkHelpers.time.latest();
      const targetTimestamp = latest + 1000;
      const claimStruct: ClaimStruct = { recipient, campaignId, spotId, nonce: nextNonce(), deadline: BigInt(targetTimestamp) };
      const signature = await signClaim(issuerClient, registry.address, claimStruct);

      // claim 트랜잭션 자신이 채굴될 블록의 timestamp가 정확히 deadline이 되도록
      // 한 발 앞선 시각까지만 미리 진행시킨다 (자동 채굴은 매 블록 +1초씩 증가시킨다).
      await networkHelpers.time.increaseTo(targetTimestamp - 1);
      const txHash = await registry.write.claim([claimStruct, signature], { account: recipient });
      const receipt = await publicClient.getTransactionReceipt({ hash: txHash });
      const minedBlock = await publicClient.getBlock({ blockNumber: receipt.blockNumber });
      assert.equal(minedBlock.timestamp, BigInt(targetTimestamp), "테스트 전제: 채굴 블록 시각이 deadline과 정확히 같아야 한다");
      assert.equal(receipt.status, "success");
      assert.equal(await registry.read.hasStamp([recipient, campaignId, spotId]), true);
    });

    it("deadline 직후(block.timestamp > deadline)는 ClaimExpired로 거절된다", async function () {
      const registry = await deployRegistry();
      await setUpActiveCampaign(registry);
      const latest = await networkHelpers.time.latest();
      const targetTimestamp = latest + 2000;
      const claimStruct: ClaimStruct = { recipient, campaignId, spotId, nonce: nextNonce(), deadline: BigInt(targetTimestamp) };
      const signature = await signClaim(issuerClient, registry.address, claimStruct);

      await networkHelpers.time.increaseTo(targetTimestamp + 1);

      await viem.assertions.revertWithCustomError(
        registry.write.claim([claimStruct, signature], { account: recipient }),
        registry,
        "ClaimExpired",
      );
    });
  });

  // -------------------------------------------------------------------
  // 6. 긴급 정지
  // -------------------------------------------------------------------
  describe("pause / unpause 역할 분리", function () {
    it("PAUSER_ROLE은 pause만 가능하고 unpause는 CAMPAIGN_ADMIN_ROLE만 가능하다", async function () {
      const registry = await deployRegistry();
      await setUpActiveCampaign(registry);
      const pauserRole = await registry.read.PAUSER_ROLE();
      await registry.write.grantRole([pauserRole, guardClient.account.address], { account: admin });

      await registry.write.pause([], { account: guardClient.account.address });

      const latest = await networkHelpers.time.latest();
      const claimStruct: ClaimStruct = { recipient, campaignId, spotId, nonce: nextNonce(), deadline: futureDeadline(latest) };
      const signature = await signClaim(issuerClient, registry.address, claimStruct);

      await viem.assertions.revertWithCustomError(
        registry.write.claim([claimStruct, signature], { account: recipient }),
        registry,
        "EnforcedPause",
      );

      // guard는 CAMPAIGN_ADMIN_ROLE이 없으므로 unpause 불가
      await viem.assertions.revertWithCustomError(
        registry.write.unpause([], { account: guardClient.account.address }),
        registry,
        "AccessControlUnauthorizedAccount",
      );

      // admin(CAMPAIGN_ADMIN_ROLE)은 unpause 가능
      await registry.write.unpause([], { account: admin });

      await viem.assertions.emit(
        registry.write.claim([claimStruct, signature], { account: recipient }),
        registry,
        "StampClaimed",
      );
    });
  });

  // -------------------------------------------------------------------
  // 7. 가스 스냅샷 - docs/reports/onchain/security-gas.md에 옮겨 기록한다.
  // -------------------------------------------------------------------
  describe("가스 스냅샷", function () {
    it("주요 경로의 gasUsed를 출력한다", async function () {
      const registry = await deployRegistry();
      const rows: Array<{ label: string; gasUsed: bigint }> = [];

      async function measure(label: string, txHashPromise: Promise<Hex>) {
        const txHash = await txHashPromise;
        const receipt = await publicClient.getTransactionReceipt({ hash: txHash });
        rows.push({ label, gasUsed: receipt.gasUsed });
      }

      await measure(
        "setIssuer(issuer,true)",
        registry.write.setIssuer([issuer, true], { account: admin }),
      );
      await measure(
        "setCampaign(campaignId,true)",
        registry.write.setCampaign([campaignId, true], { account: admin }),
      );
      await measure(
        "setCampaignSpot(campaignId,spotId,true)",
        registry.write.setCampaignSpot([campaignId, spotId, true], { account: admin }),
      );

      const latest = await networkHelpers.time.latest();
      const claimStruct: ClaimStruct = { recipient, campaignId, spotId, nonce: nextNonce(), deadline: futureDeadline(latest) };
      const signature = await signClaim(issuerClient, registry.address, claimStruct);
      await measure("claim(happy path)", registry.write.claim([claimStruct, signature], { account: recipient }));

      await measure("pause()", registry.write.pause([], { account: admin }));
      await measure("unpause()", registry.write.unpause([], { account: admin }));

      // 실패 경로 가스도 기록 (revert도 가스를 소비하므로 참고용으로 남긴다)
      const failClaim: ClaimStruct = { recipient, campaignId, spotId, nonce: nextNonce(), deadline: futureDeadline(latest) };
      const badSignature = await signClaim(recipientClient, registry.address, failClaim);
      try {
        await registry.write.claim([failClaim, badSignature], { account: recipient });
      } catch {
        // 예상된 revert - 가스는 별도로 측정하지 않음(revert 시 receipt 취득 불가한 자동 마이닝 환경)
      }

      // eslint-disable-next-line no-console
      console.log("\n=== GAS SNAPSHOT (agent_04 개발 측정, docs/reports/onchain/security-gas.md 참고) ===");
      for (const row of rows) {
        // eslint-disable-next-line no-console
        console.log(`${row.label.padEnd(40)} ${row.gasUsed.toString()}`);
      }
      assert.ok(rows.length > 0);
    });
  });
});

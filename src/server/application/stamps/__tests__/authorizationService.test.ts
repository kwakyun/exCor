import { describe, expect, it } from "vitest";
import { privateKeyToAccount, generatePrivateKey } from "viem/accounts";
import { recoverTypedDataAddress } from "viem";
import { InMemoryStampsRepository } from "../testing/inMemoryStampsRepository.js";
import { FakeChainReader, UnavailableChainReader } from "../testing/fakeChainReader.js";
import { SystemClock } from "../systemClock.js";
import { CryptoNonceGenerator } from "../systemClock.js";
import { WalletAuthService } from "../walletAuthService.js";
import { VisitService, MockVisitVerifierAuthorizer } from "../visitService.js";
import { AuthorizationService } from "../authorizationService.js";
import { InMemoryTestIssuerSigner } from "../../../providers/signing/issuerSigner.js";
import { buildClaimTypedData, campaignIdToBytes32, spotIdToBytes32 } from "../../../providers/signing/claimTypedData.js";
import type { ChainReader } from "../../../providers/rpc/chainClient.js";

const VERIFIER_TOKEN = "test-verifier-token";
const CAMPAIGN = "busan-alley:demo:jeonpo:v1";
const SPOT = "jp-c1";

async function setup(chainReader: ChainReader = new FakeChainReader()) {
  const repo = new InMemoryStampsRepository();
  const clock = new SystemClock();
  const walletAuth = new WalletAuthService(repo, clock);
  const visits = new VisitService(repo, clock, new MockVisitVerifierAuthorizer(VERIFIER_TOKEN), walletAuth);
  const issuer = new InMemoryTestIssuerSigner(generatePrivateKey());
  const authorizations = new AuthorizationService(repo, clock, new CryptoNonceGenerator(), issuer, chainReader, visits);

  const account = privateKeyToAccount(generatePrivateKey());
  const challenge = await walletAuth.requestChallenge(account.address);
  const signature = await account.signMessage({ message: challenge.message });
  const session = await walletAuth.createSession(challenge.challengeId, signature);
  const visit = await visits.requestVisitChallenge(session.sessionId, CAMPAIGN, SPOT);
  await visits.approveVisit(visit.id, VERIFIER_TOKEN);

  return { repo, clock, authorizations, issuer, session, visit, chainReader };
}

describe("AuthorizationService", () => {
  it("승인된 방문에 대해 유효한 claim 서명을 발급한다", async () => {
    const { authorizations, issuer, session, visit } = await setup();
    const result = await authorizations.issueAuthorization(session.address, visit.id, "idem-1");

    expect(result.replayed).toBe(false);
    expect(result.payload.campaignId).toBe(campaignIdToBytes32(CAMPAIGN));
    expect(result.payload.spotId).toBe(spotIdToBytes32(SPOT));

    const typedData = buildClaimTypedData(
      { chainId: result.payload.chainId, verifyingContract: result.payload.verifyingContract },
      {
        recipient: result.payload.recipient,
        campaignId: result.payload.campaignId,
        spotId: result.payload.spotId,
        nonce: BigInt(result.payload.nonce),
        deadline: BigInt(result.payload.deadline),
      },
    );
    const recovered = await recoverTypedDataAddress({ ...typedData, signature: result.signature });
    expect(recovered.toLowerCase()).toBe((await issuer.getAddress()).toLowerCase());
  });

  it("같은 Idempotency-Key 재시도는 동일 payload를 반환한다 (재서명하지 않음)", async () => {
    const { authorizations, session, visit } = await setup();
    const first = await authorizations.issueAuthorization(session.address, visit.id, "idem-1");
    const second = await authorizations.issueAuthorization(session.address, visit.id, "idem-1");

    expect(second.replayed).toBe(true);
    expect(second.payload.nonce).toBe(first.payload.nonce);
    expect(second.signature).toBe(first.signature);
  });

  it("승인되지 않은 방문에는 발급하지 않는다", async () => {
    const repo = new InMemoryStampsRepository();
    const clock = new SystemClock();
    const walletAuth = new WalletAuthService(repo, clock);
    const visits = new VisitService(repo, clock, new MockVisitVerifierAuthorizer(VERIFIER_TOKEN), walletAuth);
    const issuer = new InMemoryTestIssuerSigner(generatePrivateKey());
    const authorizations = new AuthorizationService(
      repo, clock, new CryptoNonceGenerator(), issuer, new FakeChainReader(), visits,
    );
    const account = privateKeyToAccount(generatePrivateKey());
    const challenge = await walletAuth.requestChallenge(account.address);
    const signature = await account.signMessage({ message: challenge.message });
    const session = await walletAuth.createSession(challenge.challengeId, signature);
    const visit = await visits.requestVisitChallenge(session.sessionId, CAMPAIGN, SPOT); // 승인 안 함

    await expect(
      authorizations.issueAuthorization(session.address, visit.id, "idem-1"),
    ).rejects.toMatchObject({ code: "VISIT_NOT_APPROVED" });
  });

  it("다른 지갑 세션으로 남의 승인된 방문에 발급을 요청하면 거절된다", async () => {
    const { authorizations, visit } = await setup();
    const stranger = privateKeyToAccount(generatePrivateKey());
    await expect(
      authorizations.issueAuthorization(stranger.address, visit.id, "idem-1"),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("이미 온체인에 확정된 스탬프는 새로 발급하지 않는다", async () => {
    const chainReader = new FakeChainReader();
    const { authorizations, session, visit } = await setup(chainReader);
    chainReader.markStamped(session.address, campaignIdToBytes32(CAMPAIGN), spotIdToBytes32(SPOT));

    await expect(
      authorizations.issueAuthorization(session.address, visit.id, "idem-1"),
    ).rejects.toMatchObject({ code: "STAMP_ALREADY_CONFIRMED" });
  });

  it("RPC 장애 시 새 승인 발급을 503으로 보류한다", async () => {
    const { authorizations, session, visit } = await setup(new UnavailableChainReader());
    await expect(
      authorizations.issueAuthorization(session.address, visit.id, "idem-1"),
    ).rejects.toMatchObject({ code: "RPC_UNAVAILABLE" });
  });

  it("Idempotency-Key 없이는 요청할 수 없다", async () => {
    const { authorizations, session, visit } = await setup();
    await expect(
      authorizations.issueAuthorization(session.address, visit.id, undefined),
    ).rejects.toMatchObject({ code: "INVALID_INPUT" });
  });
});

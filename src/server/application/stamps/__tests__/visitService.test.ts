import { describe, expect, it } from "vitest";
import { privateKeyToAccount, generatePrivateKey } from "viem/accounts";
import { InMemoryStampsRepository } from "../testing/inMemoryStampsRepository.js";
import { SystemClock } from "../systemClock.js";
import { WalletAuthService } from "../walletAuthService.js";
import { VisitService, MockVisitVerifierAuthorizer } from "../visitService.js";

const VERIFIER_TOKEN = "test-verifier-token";

async function makeSession() {
  const repo = new InMemoryStampsRepository();
  const clock = new SystemClock();
  const walletAuth = new WalletAuthService(repo, clock);
  const account = privateKeyToAccount(generatePrivateKey());
  const challenge = await walletAuth.requestChallenge(account.address);
  const signature = await account.signMessage({ message: challenge.message });
  const session = await walletAuth.createSession(challenge.challengeId, signature);
  const visits = new VisitService(repo, clock, new MockVisitVerifierAuthorizer(VERIFIER_TOKEN), walletAuth);
  return { repo, clock, walletAuth, visits, session, account };
}

describe("VisitService", () => {
  it("세션이 있는 지갑은 방문 challenge를 만들 수 있다", async () => {
    const { visits, session } = await makeSession();
    const visit = await visits.requestVisitChallenge(session.sessionId, "busan-alley:demo:jeonpo:v1", "jp-c1");
    expect(visit.state).toBe("requested");
    expect(visit.wallet.toLowerCase()).toBe(session.address.toLowerCase());
  });

  it("세션 없이는 방문 challenge를 요청할 수 없다", async () => {
    const { visits } = await makeSession();
    await expect(
      visits.requestVisitChallenge(undefined, "busan-alley:demo:jeonpo:v1", "jp-c1"),
    ).rejects.toMatchObject({ code: "UNAUTHENTICATED" });
  });

  it("올바른 verifier 토큰만 승인을 처리할 수 있다", async () => {
    const { visits, session } = await makeSession();
    const visit = await visits.requestVisitChallenge(session.sessionId, "busan-alley:demo:jeonpo:v1", "jp-c1");

    await expect(visits.approveVisit(visit.id, "wrong-token")).rejects.toMatchObject({ code: "FORBIDDEN" });

    const approved = await visits.approveVisit(visit.id, VERIFIER_TOKEN);
    expect(approved.state).toBe("approved");
    expect(approved.verifierId).toBe("mock-verifier");
  });

  it("이미 승인된 방문을 다시 승인하면 거절된다", async () => {
    const { visits, session } = await makeSession();
    const visit = await visits.requestVisitChallenge(session.sessionId, "busan-alley:demo:jeonpo:v1", "jp-c1");
    await visits.approveVisit(visit.id, VERIFIER_TOKEN);

    await expect(visits.approveVisit(visit.id, VERIFIER_TOKEN)).rejects.toMatchObject({
      code: "INVALID_INPUT",
    });
  });

  it("다른 지갑 세션의 승인된 방문은 requireApprovedVisitForWallet에서 거절된다", async () => {
    const { visits, session } = await makeSession();
    const { account: otherAccount } = await makeSession();
    const visit = await visits.requestVisitChallenge(session.sessionId, "busan-alley:demo:jeonpo:v1", "jp-c1");
    await visits.approveVisit(visit.id, VERIFIER_TOKEN);

    await expect(
      visits.requireApprovedVisitForWallet(visit.id, otherAccount.address),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("만료된 방문 요청 승인은 거절된다", async () => {
    const repo = new InMemoryStampsRepository();
    const fakeClock = { current: 1_000_000, nowSeconds() { return this.current; } };
    const walletAuth = new WalletAuthService(repo, fakeClock);
    const account = privateKeyToAccount(generatePrivateKey());
    const challenge = await walletAuth.requestChallenge(account.address);
    const signature = await account.signMessage({ message: challenge.message });
    const session = await walletAuth.createSession(challenge.challengeId, signature);
    const visits = new VisitService(repo, fakeClock, new MockVisitVerifierAuthorizer(VERIFIER_TOKEN), walletAuth);

    const visit = await visits.requestVisitChallenge(session.sessionId, "busan-alley:demo:jeonpo:v1", "jp-c1");
    fakeClock.current += 10 * 60; // 5분 만료 초과

    await expect(visits.approveVisit(visit.id, VERIFIER_TOKEN)).rejects.toMatchObject({
      code: "VISIT_EXPIRED",
    });
  });
});

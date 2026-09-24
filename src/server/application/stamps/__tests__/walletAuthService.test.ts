import { describe, expect, it } from "vitest";
import { privateKeyToAccount, generatePrivateKey } from "viem/accounts";
import { InMemoryStampsRepository } from "../testing/inMemoryStampsRepository.js";
import { SystemClock } from "../systemClock.js";
import { WalletAuthService } from "../walletAuthService.js";
import { StampsApplicationError } from "../errors.js";

function makeService() {
  const repo = new InMemoryStampsRepository();
  const clock = new SystemClock();
  return { service: new WalletAuthService(repo, clock), repo };
}

describe("WalletAuthService", () => {
  it("challenge 요청 -> 올바른 서명으로 세션 생성", async () => {
    const { service } = makeService();
    const account = privateKeyToAccount(generatePrivateKey());

    const challenge = await service.requestChallenge(account.address);
    expect(challenge.message).toContain(account.address.toLowerCase());

    const signature = await account.signMessage({ message: challenge.message });
    const session = await service.createSession(challenge.challengeId, signature);

    expect(session.address.toLowerCase()).toBe(account.address.toLowerCase());
  });

  it("같은 challenge를 두 번 소비하면 두 번째는 실패한다 (1회 소비)", async () => {
    const { service } = makeService();
    const account = privateKeyToAccount(generatePrivateKey());
    const challenge = await service.requestChallenge(account.address);
    const signature = await account.signMessage({ message: challenge.message });

    await service.createSession(challenge.challengeId, signature);

    await expect(service.createSession(challenge.challengeId, signature)).rejects.toThrow(
      StampsApplicationError,
    );
  });

  it("다른 지갑의 서명으로는 세션을 만들 수 없다", async () => {
    const { service } = makeService();
    const owner = privateKeyToAccount(generatePrivateKey());
    const attacker = privateKeyToAccount(generatePrivateKey());

    const challenge = await service.requestChallenge(owner.address);
    const wrongSignature = await attacker.signMessage({ message: challenge.message });

    await expect(service.createSession(challenge.challengeId, wrongSignature)).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
  });

  it("잘못된 address 형식은 즉시 거절한다", async () => {
    const { service } = makeService();
    await expect(service.requestChallenge("not-an-address")).rejects.toMatchObject({
      code: "INVALID_INPUT",
    });
  });

  it("만료된 세션은 requireSession에서 거절된다", async () => {
    const repo = new InMemoryStampsRepository();
    const fakeClock = { current: 1_000_000, nowSeconds() { return this.current; } };
    const service = new WalletAuthService(repo, fakeClock);
    const account = privateKeyToAccount(generatePrivateKey());

    const challenge = await service.requestChallenge(account.address);
    const signature = await account.signMessage({ message: challenge.message });
    const session = await service.createSession(challenge.challengeId, signature);

    fakeClock.current += 60 * 60; // 1시간 경과, 세션 TTL(15분) 초과
    await expect(service.requireSession(session.sessionId)).rejects.toMatchObject({
      code: "UNAUTHENTICATED",
    });
  });
});

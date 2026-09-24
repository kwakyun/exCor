/**
 * P3-04 지갑 소유 확인 (로그인용 서명). claim 발급용 EIP-712 서명과 절대 혼용하지 않는다
 * (03-onchain-system.md 4절: "지갑 서명은 로그인용과 스탬프 승인용을 구분한다").
 *
 * 정책 메모: 세션 TTL/challenge 문구의 정확한 운영값은 claim-v1.md 기준 미결정 정책이다.
 * 아래 상수는 로컬 초안이며 공개 환경 적용 전 사람 승인이 필요하다.
 */
import { randomBytes } from "node:crypto";
import { verifyMessage, type Address } from "viem";
import type { Clock, StampsRepository, WalletSessionRecord } from "./ports.js";
import { Errors } from "./errors.js";

export const WALLET_CHALLENGE_TTL_SECONDS = 5 * 60; // claim-v1.md 로컬 초안: 5분 1회 소비
export const WALLET_SESSION_TTL_SECONDS = 15 * 60; // 로컬 초안. 공개 정책 미결정.

function generateNonce(): string {
  return randomBytes(16).toString("hex");
}

function buildChallengeMessage(address: Address, nonce: string, expiresAtSeconds: number): string {
  return [
    "busan-alley-balancer wallet login",
    `address: ${address.toLowerCase()}`,
    `nonce: ${nonce}`,
    `purpose: login`,
    `expires_at: ${expiresAtSeconds}`,
  ].join("\n");
}

export interface WalletChallengeResponse {
  challengeId: string;
  message: string;
  expiresAt: number;
}

export class WalletAuthService {
  constructor(
    private readonly repo: StampsRepository,
    private readonly clock: Clock,
  ) {}

  async requestChallenge(address: string): Promise<WalletChallengeResponse> {
    if (!/^0x[0-9a-fA-F]{40}$/.test(address)) {
      throw Errors.invalidInput("address 형식이 올바르지 않다.", { address: "INVALID_ADDRESS" });
    }
    const nonce = generateNonce();
    const expiresAt = this.clock.nowSeconds() + WALLET_CHALLENGE_TTL_SECONDS;
    const message = buildChallengeMessage(address as Address, nonce, expiresAt);
    const record = await this.repo.createWalletChallenge({
      address: address as Address,
      nonce,
      message,
      expiresAt,
    });
    return { challengeId: record.id, message: record.message, expiresAt: record.expiresAt };
  }

  async createSession(
    challengeId: string,
    signature: `0x${string}`,
  ): Promise<{ sessionId: string; address: Address; expiresAt: number }> {
    const consumed = await this.repo.consumeWalletChallenge(challengeId);
    if (!consumed) {
      throw Errors.invalidInput("challenge가 존재하지 않거나 이미 사용되었다.", {
        challengeId: "CONSUMED_OR_NOT_FOUND",
      });
    }
    if (consumed.expiresAt < this.clock.nowSeconds()) {
      throw Errors.invalidInput("challenge가 만료되었다.", { challengeId: "EXPIRED" });
    }

    const isValid = await verifyMessage({
      address: consumed.address,
      message: consumed.message,
      signature,
    });
    if (!isValid) {
      throw Errors.forbidden("서명이 challenge의 지갑 주소와 일치하지 않는다.");
    }

    const expiresAt = this.clock.nowSeconds() + WALLET_SESSION_TTL_SECONDS;
    const session: WalletSessionRecord = await this.repo.createWalletSession({
      address: consumed.address,
      expiresAt,
    });
    return { sessionId: session.id, address: session.address, expiresAt: session.expiresAt };
  }

  async requireSession(sessionId: string | undefined): Promise<WalletSessionRecord> {
    if (!sessionId) throw Errors.unauthenticated();
    const session = await this.repo.getWalletSession(sessionId);
    if (!session) throw Errors.unauthenticated();
    if (session.expiresAt < this.clock.nowSeconds()) {
      throw Errors.unauthenticated("세션이 만료되었다.");
    }
    return session;
  }
}

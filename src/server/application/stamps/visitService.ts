/**
 * P3-04 방문 승인 유스케이스.
 *
 * 중요: 이 서비스는 "신뢰된 승인자가 발급을 허용했다는 사실"만 기록한다. 실제 물리적
 * 방문을 이 코드가 보증하지 않는다 (04-onchain.yaml 역할 지침 3번). 초기 데모의
 * verifier는 모의 확인이며, 공개 환경에는 모의 승인 route를 등록하지 않는다
 * (claim-v1.md: "로컬 모의 방문 승인만 준비하고 공개 환경에는 mock 승인 route를
 * 등록하지 않는다"). MOCK_VISIT_VERIFIER_ENABLED 플래그로 이를 명시적으로 구분한다.
 */
import type { Address } from "viem";
import type { Clock, StampsRepository, VisitRequestRecord } from "./ports.js";
import { Errors } from "./errors.js";
import type { WalletAuthService } from "./walletAuthService.js";

export const VISIT_CHALLENGE_TTL_SECONDS = 5 * 60; // 03-onchain-system.md 4절: 5분 만료

export interface VisitVerifierAuthorizer {
  /**
   * 호출자가 "방문 확인자" 권한을 갖는지 검사한다. 로컬 데모 구현은 고정 토큰 비교이며
   * 운영 verifier 인증 정책은 미결정이다 (claim-v1.md). 절대 이 결과를 실제 방문의
   * 물리적 증거로 취급하지 않는다.
   */
  isAuthorizedVerifier(verifierToken: string | undefined): Promise<string | null>; // verifierId | null
}

/** 로컬/테스트 전용 모의 verifier. 공개 환경 배포 시 반드시 다른 구현으로 교체한다. */
export class MockVisitVerifierAuthorizer implements VisitVerifierAuthorizer {
  constructor(private readonly sharedToken: string) {}

  async isAuthorizedVerifier(verifierToken: string | undefined): Promise<string | null> {
    if (!verifierToken || verifierToken !== this.sharedToken) return null;
    return "mock-verifier";
  }
}

export class VisitService {
  constructor(
    private readonly repo: StampsRepository,
    private readonly clock: Clock,
    private readonly verifierAuthorizer: VisitVerifierAuthorizer,
    private readonly walletAuth: WalletAuthService,
  ) {}

  async requestVisitChallenge(
    sessionId: string | undefined,
    campaignNamespace: string,
    canonicalSpotId: string,
  ): Promise<VisitRequestRecord> {
    const session = await this.walletAuth.requireSession(sessionId);
    if (!campaignNamespace || !canonicalSpotId) {
      throw Errors.invalidInput("campaignNamespace/canonicalSpotId가 필요하다.");
    }
    const expiresAt = this.clock.nowSeconds() + VISIT_CHALLENGE_TTL_SECONDS;
    return this.repo.createVisitRequest({
      wallet: session.address,
      campaignNamespace,
      canonicalSpotId,
      expiresAt,
    });
  }

  async approveVisit(
    visitId: string,
    verifierToken: string | undefined,
  ): Promise<VisitRequestRecord> {
    const verifierId = await this.verifierAuthorizer.isAuthorizedVerifier(verifierToken);
    if (!verifierId) {
      throw Errors.forbidden("방문 확인자 권한이 없다.");
    }
    const visit = await this.repo.getVisitRequest(visitId);
    if (!visit) throw Errors.visitNotFound();
    if (visit.expiresAt < this.clock.nowSeconds()) {
      throw Errors.visitExpired();
    }
    const approved = await this.repo.approveVisitRequest(visitId, verifierId);
    if (!approved) {
      throw Errors.invalidInput("방문 요청이 이미 처리되었다(승인/거절/만료).", {
        visitId: "ALREADY_PROCESSED",
      });
    }
    return approved;
  }

  /** authorizationService가 재사용하는 내부 조회 - 지갑 결합/만료를 함께 검증한다. */
  async requireApprovedVisitForWallet(
    visitId: string,
    wallet: Address,
  ): Promise<VisitRequestRecord> {
    const visit = await this.repo.getVisitRequest(visitId);
    if (!visit) throw Errors.visitNotFound();
    if (visit.wallet.toLowerCase() !== wallet.toLowerCase()) {
      throw Errors.forbidden("이 방문 요청은 다른 지갑 세션에 속한다.");
    }
    if (visit.state !== "approved") {
      throw Errors.visitNotApproved();
    }
    if (visit.expiresAt < this.clock.nowSeconds()) {
      throw Errors.visitExpired();
    }
    return visit;
  }
}

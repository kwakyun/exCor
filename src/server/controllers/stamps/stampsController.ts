/**
 * P3-04 stamps controller factory.
 *
 * 04 write_scope: 이 파일과 하위 모듈만 소유한다. src/server/app.ts에 route를 실제로
 * 등록하는 것은 03의 몫이다 (shared_resource_locks.route_registration:
 * "04는 controllers/stamps factory를 내보내고 03이 route 등록").
 *
 * 사용 예 (03이 app.ts에서):
 *   import { createStampsController } from "./controllers/stamps/stampsController";
 *   const stamps = createStampsController({ walletAuth, visits, authorizations, status });
 *   // 아래 stampsRouteTable을 순회하며 기존 app.ts 스타일의 if(method && pattern) 분기에
 *   // 추가하거나, 각 메서드를 직접 호출해 배선한다.
 */
import type { Address } from "viem";
import type { WalletAuthService } from "../../application/stamps/walletAuthService.js";
import type { VisitService } from "../../application/stamps/visitService.js";
import type { AuthorizationService } from "../../application/stamps/authorizationService.js";
import type { StatusService } from "../../application/stamps/statusService.js";
import type { ChainReader } from "../../providers/rpc/chainClient.js";
import { Errors } from "../../application/stamps/errors.js";
import { fail, newRequestId, ok, type HttpResponse } from "./httpEnvelope.js";
import { campaignIdToBytes32, spotIdToBytes32 } from "../../providers/signing/claimTypedData.js";

export interface StampsControllerDeps {
  walletAuth: WalletAuthService;
  visits: VisitService;
  authorizations: AuthorizationService;
  status: StatusService;
  rpcProvider: ChainReader;
}

function asHex(value: unknown, fieldName: string): `0x${string}` {
  if (typeof value !== "string" || !value.startsWith("0x")) {
    throw Errors.invalidInput(`${fieldName}는 0x로 시작하는 hex 문자열이어야 한다.`, {
      [fieldName]: "INVALID_HEX",
    });
  }
  return value as `0x${string}`;
}

export function createStampsController(deps: StampsControllerDeps) {
  return {
    /** POST /api/v1/wallet/challenges */
    async postWalletChallenge(body: any): Promise<HttpResponse> {
      const requestId = newRequestId();
      try {
        if (!body || typeof body.address !== "string") {
          throw Errors.invalidInput("address가 필요하다.");
        }
        const result = await deps.walletAuth.requestChallenge(body.address);
        return ok(201, result, requestId);
      } catch (err) {
        return fail(err, requestId);
      }
    },

    /** POST /api/v1/wallet/sessions */
    async postWalletSession(body: any): Promise<HttpResponse> {
      const requestId = newRequestId();
      try {
        if (!body || typeof body.challengeId !== "string" || typeof body.signature !== "string") {
          throw Errors.invalidInput("challengeId/signature가 필요하다.");
        }
        const result = await deps.walletAuth.createSession(body.challengeId, asHex(body.signature, "signature"));
        return ok(201, result, requestId);
      } catch (err) {
        return fail(err, requestId);
      }
    },

    /** POST /api/v1/visits/challenges (Authorization: Bearer <sessionId>) */
    async postVisitChallenge(sessionId: string | undefined, body: any): Promise<HttpResponse> {
      const requestId = newRequestId();
      try {
        if (!body || typeof body.campaignId !== "string" || typeof body.spotId !== "string") {
          throw Errors.invalidInput("campaignId/spotId(사람이 읽는 문자열 ID)가 필요하다.");
        }
        const visit = await deps.visits.requestVisitChallenge(sessionId, body.campaignId, body.spotId);
        return ok(201, visit, requestId);
      } catch (err) {
        return fail(err, requestId);
      }
    },

    /** POST /api/v1/visits/:id/approve (별도 확인자 권한 헤더) */
    async postVisitApprove(visitId: string, verifierToken: string | undefined): Promise<HttpResponse> {
      const requestId = newRequestId();
      try {
        const visit = await deps.visits.approveVisit(visitId, verifierToken);
        return ok(200, visit, requestId);
      } catch (err) {
        return fail(err, requestId);
      }
    },

    /** POST /api/v1/stamps/authorizations (지갑 세션, Idempotency-Key) */
    async postStampAuthorization(
      sessionId: string | undefined,
      body: any,
      idempotencyKey: string | undefined,
    ): Promise<HttpResponse> {
      const requestId = newRequestId();
      try {
        const session = await deps.walletAuth.requireSession(sessionId);
        if (!body || typeof body.visitId !== "string") {
          throw Errors.invalidInput("visitId가 필요하다.");
        }
        const result = await deps.authorizations.issueAuthorization(
          session.address,
          body.visitId,
          idempotencyKey,
        );
        return ok(result.replayed ? 200 : 201, result, requestId);
      } catch (err) {
        return fail(err, requestId);
      }
    },

    /** GET /api/v1/stamps?address=&campaignId=&spotId= (공개 조회) */
    async getStamps(query: { address?: string; campaignId?: string; spotId?: string }): Promise<HttpResponse> {
      const requestId = newRequestId();
      try {
        if (!query.address || !query.campaignId || !query.spotId) {
          throw Errors.invalidInput("address/campaignId/spotId 쿼리 파라미터가 필요하다.");
        }
        const campaignBytes = campaignIdToBytes32(query.campaignId);
        const spotBytes = spotIdToBytes32(query.spotId);
        let hasStamp: boolean;
        try {
          hasStamp = await deps.rpcProvider.hasStamp(query.address as Address, campaignBytes, spotBytes);
        } catch {
          throw Errors.rpcUnavailable();
        }
        return ok(
          200,
          {
            address: query.address,
            campaignId: campaignBytes,
            spotId: spotBytes,
            hasStamp,
            chainId: deps.rpcProvider.chainId,
            contractAddress: deps.rpcProvider.contractAddress,
            note: "온체인 공개 기록의 직접 조회 결과다. DB 인덱스/동기화 지연은 GET .../status에서 별도로 표시한다.",
          },
          requestId,
        );
      } catch (err) {
        return fail(err, requestId);
      }
    },

    /** GET /api/v1/stamps/status?address=&campaignId=&spotId= */
    async getStampStatus(query: { address?: string; campaignId?: string; spotId?: string }): Promise<HttpResponse> {
      const requestId = newRequestId();
      try {
        if (!query.address || !query.campaignId || !query.spotId) {
          throw Errors.invalidInput("address/campaignId/spotId 쿼리 파라미터가 필요하다.");
        }
        const result = await deps.status.getStatus(
          query.address as Address,
          query.campaignId,
          query.spotId,
          false, // pending 여부는 P3-06 projection 연동 후 authorizations 조회로 대체 예정
        );
        return ok(200, result, requestId);
      } catch (err) {
        return fail(err, requestId);
      }
    },
  };
}

export type StampsController = ReturnType<typeof createStampsController>;

/**
 * 03이 app.ts 기존 if-분기 스타일에 그대로 옮겨 붙일 수 있도록 route 표를 함께 내보낸다.
 * 실제 등록(app.ts 수정)은 03이 수행한다.
 */
export const stampsRouteTable = [
  { method: "POST", pattern: "/api/v1/wallet/challenges" },
  { method: "POST", pattern: "/api/v1/wallet/sessions" },
  { method: "POST", pattern: "/api/v1/visits/challenges" },
  { method: "POST", pattern: "/api/v1/visits/:id/approve" },
  { method: "POST", pattern: "/api/v1/stamps/authorizations" },
  { method: "GET", pattern: "/api/v1/stamps" },
  { method: "GET", pattern: "/api/v1/stamps/status" },
] as const;

/**
 * docs/contracts/api-v1.md 공통 오류 코드/HTTP 상태를 stamps 유스케이스에 적용한다.
 */
export class StampsApplicationError extends Error {
  readonly httpStatus: number;
  readonly code: string;
  readonly fields?: Record<string, string>;

  constructor(httpStatus: number, code: string, message: string, fields?: Record<string, string>) {
    super(message);
    this.name = "StampsApplicationError";
    this.httpStatus = httpStatus;
    this.code = code;
    this.fields = fields;
  }
}

export const Errors = {
  invalidInput: (message: string, fields?: Record<string, string>) =>
    new StampsApplicationError(400, "INVALID_INPUT", message, fields),
  unauthenticated: (message = "지갑 세션이 없거나 만료되었다.") =>
    new StampsApplicationError(401, "UNAUTHENTICATED", message),
  forbidden: (message = "요청 지갑과 세션 지갑이 일치하지 않는다.") =>
    new StampsApplicationError(403, "FORBIDDEN", message),
  visitNotFound: () => new StampsApplicationError(404, "VISIT_NOT_FOUND", "방문 요청을 찾을 수 없다."),
  idempotencyConflict: (message = "동일 Idempotency-Key로 다른 요청 본문이 재사용되었다.") =>
    new StampsApplicationError(409, "IDEMPOTENCY_CONFLICT", message),
  visitNotApproved: () =>
    new StampsApplicationError(422, "VISIT_NOT_APPROVED", "방문이 아직 승인되지 않았다."),
  visitExpired: () => new StampsApplicationError(422, "VISIT_EXPIRED", "방문 요청이 만료되었다."),
  rpcUnavailable: (message = "체인 RPC에 연결할 수 없어 새 승인 발급을 보류한다.") =>
    new StampsApplicationError(503, "RPC_UNAVAILABLE", message),
  alreadyConfirmed: () =>
    new StampsApplicationError(
      409,
      "STAMP_ALREADY_CONFIRMED",
      "이미 온체인에 확정된 스탬프다. 새 승인을 발급하지 않는다.",
    ),
  internal: (message = "예상하지 못한 오류가 발생했다.") =>
    new StampsApplicationError(500, "INTERNAL_ERROR", message),
};

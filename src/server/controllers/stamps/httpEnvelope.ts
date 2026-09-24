/**
 * docs/contracts/api-v1.md 공통 응답 envelope. `{data, requestId}` / `{error, requestId}`.
 */
import { randomUUID } from "node:crypto";
import { StampsApplicationError } from "../../application/stamps/errors.js";

export interface HttpResponse {
  status: number;
  data: unknown;
}

export function ok(status: number, data: unknown, requestId: string): HttpResponse {
  return { status, data: { data, requestId } };
}

export function fail(err: unknown, requestId: string): HttpResponse {
  if (err instanceof StampsApplicationError) {
    return {
      status: err.httpStatus,
      data: {
        error: { code: err.code, message: err.message, ...(err.fields ? { fields: err.fields } : {}) },
        requestId,
      },
    };
  }
  // 예상하지 못한 오류 - 내부 상세를 노출하지 않는다 (api-v1.md: "내부 상세 미노출").
  return {
    status: 500,
    data: { error: { code: "INTERNAL_ERROR", message: "예상하지 못한 오류가 발생했다." }, requestId },
  };
}

export function newRequestId(): string {
  return randomUUID();
}

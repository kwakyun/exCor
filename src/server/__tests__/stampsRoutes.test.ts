/**
 * P3-ROUTES: app.ts에 등록한 stamps 라우팅을 실제 apiHandler 호출로 검증한다.
 * ChainRpcProvider/EnvIssuerSigner 등 실제 클래스를 그대로 사용하고(테스트 더블 아님),
 * 이 샌드박스에는 로컬 체인(RPC)이 없다는 사실 자체를 테스트 조건으로 활용한다:
 * 네트워크가 전혀 필요 없는 엔드포인트(wallet challenge 발급)는 실제로 성공해야 하고,
 * RPC가 필요한 엔드포인트는 STAMPS_UNAVAILABLE이 아니라 RPC_UNAVAILABLE로 명확히
 * 구분되어야 한다("DB/체인 장애를 null/not-found로 삼키지 않는다" 원칙).
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { IncomingMessage, ServerResponse } from 'http';
import { apiHandler, __resetStampsSingletonForTests } from '../app';

// 테스트 전용 개인키(hardhat #0 계정) - 실제 자금/배포와 무관, 공개적으로 널리 알려진 값.
const TEST_ISSUER_PRIVATE_KEY = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';

function fakeRequest(method: string, url: string, headers: Record<string, string> = {}, body?: unknown): IncomingMessage {
  const listeners: Record<string, ((...args: any[]) => void)[]> = {};
  const req = {
    method,
    url,
    headers,
    on(event: string, cb: (...args: any[]) => void) {
      (listeners[event] ||= []).push(cb);
      return req;
    },
  } as unknown as IncomingMessage;

  queueMicrotask(() => {
    if (body !== undefined) {
      for (const cb of listeners['data'] ?? []) cb(Buffer.from(JSON.stringify(body)));
    }
    for (const cb of listeners['end'] ?? []) cb();
  });

  return req;
}

function fakeResponse(): { res: ServerResponse; result: Promise<{ status: number; body: any }> } {
  let resolveResult!: (v: { status: number; body: any }) => void;
  const result = new Promise<{ status: number; body: any }>((resolve) => {
    resolveResult = resolve;
  });
  let statusCode = 200;
  const res = {
    setHeader() {},
    get statusCode() {
      return statusCode;
    },
    set statusCode(v: number) {
      statusCode = v;
    },
    end(chunk?: string) {
      resolveResult({ status: statusCode, body: chunk ? JSON.parse(chunk) : undefined });
    },
  } as unknown as ServerResponse;
  return { res, result };
}

describe('P3-ROUTES: app.ts stamps 라우팅', () => {
  const originalIssuerKey = process.env.STAMP_ISSUER_PRIVATE_KEY;
  const originalNodeEnv = process.env.NODE_ENV;

  beforeEach(() => {
    __resetStampsSingletonForTests();
  });

  afterEach(() => {
    if (originalIssuerKey === undefined) delete process.env.STAMP_ISSUER_PRIVATE_KEY;
    else process.env.STAMP_ISSUER_PRIVATE_KEY = originalIssuerKey;
    process.env.NODE_ENV = originalNodeEnv;
    __resetStampsSingletonForTests();
  });

  it('STAMP_ISSUER_PRIVATE_KEY 미설정 시 stamps 엔드포인트는 503 STAMPS_UNAVAILABLE, legacy 라우트는 영향받지 않는다', async () => {
    delete process.env.STAMP_ISSUER_PRIVATE_KEY;

    const req = fakeRequest('POST', '/api/v1/wallet/challenges', {}, { address: '0x000000000000000000000000000000000000dead' });
    const { res, result } = fakeResponse();
    await apiHandler(req, res);
    const { status, body } = await result;
    expect(status).toBe(503);
    expect(body.error.code).toBe('STAMPS_UNAVAILABLE');

    // legacy 라우트는 stamps 설정과 무관하게 그대로 동작해야 한다.
    const legacyReq = fakeRequest('GET', '/api/districts');
    const legacyRes = fakeResponse();
    await apiHandler(legacyReq, legacyRes.res);
    const legacy = await legacyRes.result;
    expect(legacy.status).toBe(200);
  });

  it('STAMP_ISSUER_PRIVATE_KEY 설정 시 지갑 challenge 발급은 네트워크 없이 실제로 성공한다', async () => {
    process.env.STAMP_ISSUER_PRIVATE_KEY = TEST_ISSUER_PRIVATE_KEY;

    const req = fakeRequest('POST', '/api/v1/wallet/challenges', {}, { address: '0x000000000000000000000000000000000000dEaD' });
    const { res, result } = fakeResponse();
    await apiHandler(req, res);
    const { status, body } = await result;
    expect(status).toBe(201);
    expect(typeof body.data.challengeId).toBe('string');
    expect(typeof body.data.message).toBe('string');
    expect(typeof body.requestId).toBe('string');
  });

  it('RPC가 필요한 조회는 STAMPS_UNAVAILABLE이 아니라 RPC_UNAVAILABLE로 명확히 구분된다(로컬 체인 없음)', async () => {
    process.env.STAMP_ISSUER_PRIVATE_KEY = TEST_ISSUER_PRIVATE_KEY;

    const req = fakeRequest(
      'GET',
      '/api/v1/stamps/status?address=0x000000000000000000000000000000000000dEaD&campaignId=jeonpo-2026&spotId=jp-f1',
    );
    const { res, result } = fakeResponse();
    await apiHandler(req, res);
    const { status, body } = await result;
    expect(status).toBe(503);
    expect(body.error.code).toBe('RPC_UNAVAILABLE');
  }, 15000);

  it("NODE_ENV=production에서는 mock 방문 승인 route가 등록되지 않는다(404)", async () => {
    process.env.STAMP_ISSUER_PRIVATE_KEY = TEST_ISSUER_PRIVATE_KEY;
    process.env.NODE_ENV = 'production';

    const req = fakeRequest('POST', '/api/v1/visits/some-visit-id/approve', { 'x-verifier-token': 'local-dev-verifier' });
    const { res, result } = fakeResponse();
    await apiHandler(req, res);
    const { status, body } = await result;
    expect(status).toBe(404);
    expect(body.success).toBe(false);
  });
});

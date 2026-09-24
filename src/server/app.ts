import type { IncomingMessage, ServerResponse } from 'http';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { PlanController } from './controllers/planController';
import {
  createStampsController,
  type StampsController,
} from './controllers/stamps/stampsController';
import { newRequestId, type HttpResponse } from './controllers/stamps/httpEnvelope';
import { WalletAuthService } from './application/stamps/walletAuthService';
import { VisitService, MockVisitVerifierAuthorizer } from './application/stamps/visitService';
import { AuthorizationService } from './application/stamps/authorizationService';
import { StatusService } from './application/stamps/statusService';
import { SystemClock, CryptoNonceGenerator } from './application/stamps/systemClock';
// P3-ROUTES provisional: 실제 StampsRepository(P3-DB의 PgStampsRepository)는 SqlClient 구현체가
// 필요하며 그 부트스트랩은 P1-06(agent_03)+ENV-01(agent_02, @electric-sql/pglite devDependency
// 승인 등)이 선행되어야 한다. 그 전까지 in-memory repository로 배선해 "실제 연동 완료"를
// 주장하지 않는다 (assignments.md: mock 검증 우선, 실제 연동 완료로 잘못 보고 금지).
import { InMemoryStampsRepository } from './application/stamps/testing/inMemoryStampsRepository';
import { ChainRpcProvider, type ChainReader, type ChainDeploymentConfig } from './providers/rpc/chainClient';
import { EnvIssuerSigner } from './providers/signing/issuerSigner';

/**
 * Node.js HTTP 요청 본문(JSON)을 비동기로 파싱하는 헬퍼
 */
async function parseJsonBody(req: IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      // 악의적인 대용량 페이로드 방어 (최대 1MB)
      if (body.length > 1e6) {
        req.destroy();
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      if (!body) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        reject(new Error('Invalid JSON format'));
      }
    });
    req.on('error', (err) => reject(err));
  });
}

/**
 * 응답 헤더 및 JSON 응답 전송 헬퍼
 */
function sendJsonResponse(res: ServerResponse, status: number, data: any) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.statusCode = status;
  res.end(JSON.stringify(data));
}

/**
 * P3-ROUTES: agent_04의 stamps controller factory(`createStampsController`)를 배선한다
 * (04 설계 의도: "04는 controllers/stamps factory를 내보내고 03이 route 등록").
 *
 * 지연 초기화 + 예외 격리: legacy plan 라우트는 stamps 서브시스템 설정(로컬 체인 배포
 * metadata, STAMP_ISSUER_PRIVATE_KEY)이 없어도 절대 영향받지 않는다. 초기화가 처음
 * 실패하면 이후 모든 stamps 요청은 503 STAMPS_UNAVAILABLE을 반환한다(매 요청마다 재시도해
 * 로그를 쏟지 않는다).
 */
let stampsControllerSingleton: StampsController | null | undefined;
let stampsInitError: Error | null = null;

function loadLocalChainDeployment(): ChainDeploymentConfig {
  const here = path.dirname(fileURLToPath(import.meta.url));
  const deploymentPath = path.resolve(here, '../../chain/deployments/local-31337.json');
  const raw = JSON.parse(readFileSync(deploymentPath, 'utf-8'));
  return {
    rpcUrl: process.env.CHAIN_RPC_URL || 'http://127.0.0.1:8545',
    chainId: raw.chainId,
    contractAddress: raw.address,
    deploymentBlockNumber: BigInt(raw.deploymentBlockNumber),
    abi: raw.abi,
  };
}

function initStampsController(): StampsController {
  const deployment = loadLocalChainDeployment();
  const rpcProvider: ChainReader = new ChainRpcProvider(deployment);
  const issuerSigner = EnvIssuerSigner.fromEnv(); // STAMP_ISSUER_PRIVATE_KEY 없으면 즉시 throw

  // TODO(P1-06 + ENV-01): PgStampsRepository(src/server/repositories/pgStampsRepository.ts,
  // P3-DB에서 실제 구현·pglite로 검증 완료)로 교체. 실제 SqlClient 구현체가 준비되면 이
  // 한 줄만 바꾸면 된다 - 그 전까지는 재시작 시 전부 소실되는 provisional 배선이다.
  const repo = new InMemoryStampsRepository();
  const clock = new SystemClock();
  const nonceGenerator = new CryptoNonceGenerator();

  const walletAuth = new WalletAuthService(repo, clock);
  // visitService.ts: "공개 환경에는 mock 승인 route를 등록하지 않는다" - 아래 라우팅에서
  // NODE_ENV==='production'이면 approve 엔드포인트 자체를 등록하지 않아 이 토큰은 쓰이지 않는다.
  const verifierAuthorizer = new MockVisitVerifierAuthorizer(
    process.env.STAMP_MOCK_VERIFIER_TOKEN || 'local-dev-verifier',
  );
  const visits = new VisitService(repo, clock, verifierAuthorizer, walletAuth);
  const authorizations = new AuthorizationService(repo, clock, nonceGenerator, issuerSigner, rpcProvider, visits);
  const status = new StatusService(rpcProvider);

  return createStampsController({ walletAuth, visits, authorizations, status, rpcProvider });
}

function getStampsController(): StampsController | null {
  if (stampsControllerSingleton === undefined) {
    try {
      stampsControllerSingleton = initStampsController();
    } catch (err) {
      stampsInitError = err instanceof Error ? err : new Error(String(err));
      stampsControllerSingleton = null;
      // eslint-disable-next-line no-console
      console.warn(
        `[stamps] 서브시스템 초기화 실패 - /api/v1/{wallet,visits,stamps}* 는 503을 반환한다: ${stampsInitError.message}`,
      );
    }
  }
  return stampsControllerSingleton;
}

/** 테스트 전용 - 모듈 수준 lazy singleton을 초기화 이전 상태로 되돌린다. 프로덕션 코드에서 호출하지 않는다. */
export function __resetStampsSingletonForTests(): void {
  stampsControllerSingleton = undefined;
  stampsInitError = null;
}

function sendStampsResponse(res: ServerResponse, result: HttpResponse): void {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.statusCode = result.status;
  res.end(JSON.stringify(result.data));
}

function stampsUnavailableResponse(): HttpResponse {
  const requestId = newRequestId();
  return {
    status: 503,
    data: {
      error: {
        code: 'STAMPS_UNAVAILABLE',
        message: 'stamps 서브시스템을 사용할 수 없다(로컬 체인 배포 metadata 또는 발급 서명자 설정 누락).',
      },
      requestId,
    },
  };
}

/**
 * 백엔드 REST API 메인 핸들러
 * (Vite dev server 미들웨어 및 독립 http 서버 양쪽 모두에서 호환)
 */
export async function apiHandler(
  req: IncomingMessage,
  res: ServerResponse,
  next?: () => void
): Promise<void> {
  const parsedUrl = new URL(req.url || '/', `http://${req.headers.host || 'localhost:5173'}`);
  const pathname = parsedUrl.pathname;

  // /api 접두사 경로만 처리
  if (!pathname.startsWith('/api')) {
    if (next) next();
    return;
  }

  // CORS 프리플라이트(OPTIONS) 요청 대응
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.statusCode = 204;
    res.end();
    return;
  }

  const baseUrl = `${parsedUrl.protocol}//${parsedUrl.host}`;

  try {
    // 1. POST /api/plans (신규 코스 저장)
    if (req.method === 'POST' && pathname === '/api/plans') {
      const body = await parseJsonBody(req);
      const result = await PlanController.createPlan(body, baseUrl);
      sendJsonResponse(res, result.status, result.data);
      return;
    }

    // 2. POST /api/plans/:slug/like (좋아요)
    const likeMatch = pathname.match(/^\/api\/plans\/([a-zA-Z0-9_-]+)\/like$/);
    if (req.method === 'POST' && likeMatch) {
      const slug = likeMatch[1];
      const result = await PlanController.likePlan(slug);
      sendJsonResponse(res, result.status, result.data);
      return;
    }

    // 3. GET /api/plans/:slug (코스 조회)
    const planMatch = pathname.match(/^\/api\/plans\/([a-zA-Z0-9_-]+)$/);
    if (req.method === 'GET' && planMatch) {
      const slug = planMatch[1];
      const result = await PlanController.getPlan(slug);
      sendJsonResponse(res, result.status, result.data);
      return;
    }

    // 4. GET /api/curations/popular (인기 큐레이션)
    if (req.method === 'GET' && pathname === '/api/curations/popular') {
      const limit = Number(parsedUrl.searchParams.get('limit')) || 6;
      const result = await PlanController.getPopularCurations(limit);
      sendJsonResponse(res, result.status, result.data);
      return;
    }

    // 5. GET /api/spots (스팟 필터링)
    if (req.method === 'GET' && pathname === '/api/spots') {
      const districtId = parsedUrl.searchParams.get('districtId') || undefined;
      const category = parsedUrl.searchParams.get('category') || undefined;
      const maxPriceStr = parsedUrl.searchParams.get('maxPrice');
      const maxPrice = maxPriceStr ? Number(maxPriceStr) : undefined;

      const result = await PlanController.getSpots({ districtId, category, maxPrice });
      sendJsonResponse(res, result.status, result.data);
      return;
    }

    // 6. GET /api/districts (골목 권역 메타)
    if (req.method === 'GET' && pathname === '/api/districts') {
      const result = await PlanController.getDistricts();
      sendJsonResponse(res, result.status, result.data);
      return;
    }

    // --- P3-ROUTES: stamps 서브시스템 (agent_04 P3-04 controller, 03이 여기서 등록) ---
    if (
      pathname.startsWith('/api/v1/wallet/') ||
      pathname.startsWith('/api/v1/visits') ||
      pathname.startsWith('/api/v1/stamps')
    ) {
      const stamps = getStampsController();
      if (!stamps) {
        sendStampsResponse(res, stampsUnavailableResponse());
        return;
      }

      const authHeader = req.headers['authorization'];
      const sessionId =
        typeof authHeader === 'string' && authHeader.startsWith('Bearer ')
          ? authHeader.slice('Bearer '.length)
          : undefined;
      const verifierTokenHeader = req.headers['x-verifier-token'];
      const verifierToken = typeof verifierTokenHeader === 'string' ? verifierTokenHeader : undefined;
      const idempotencyKeyHeader = req.headers['idempotency-key'];
      const idempotencyKey = typeof idempotencyKeyHeader === 'string' ? idempotencyKeyHeader : undefined;

      if (req.method === 'POST' && pathname === '/api/v1/wallet/challenges') {
        const body = await parseJsonBody(req);
        sendStampsResponse(res, await stamps.postWalletChallenge(body));
        return;
      }
      if (req.method === 'POST' && pathname === '/api/v1/wallet/sessions') {
        const body = await parseJsonBody(req);
        sendStampsResponse(res, await stamps.postWalletSession(body));
        return;
      }
      if (req.method === 'POST' && pathname === '/api/v1/visits/challenges') {
        const body = await parseJsonBody(req);
        sendStampsResponse(res, await stamps.postVisitChallenge(sessionId, body));
        return;
      }
      const visitApproveMatch = pathname.match(/^\/api\/v1\/visits\/([a-zA-Z0-9_-]+)\/approve$/);
      if (req.method === 'POST' && visitApproveMatch) {
        if (process.env.NODE_ENV === 'production') {
          // visitService.ts 문서화: "공개 환경에는 mock 승인 route를 등록하지 않는다".
          // 실제 verifier 인증 정책이 없으므로 운영 환경에서는 이 경로 자체가 존재하지 않는다.
          sendJsonResponse(res, 404, {
            success: false,
            error: `지원하지 않는 API 경로입니다: ${req.method} ${pathname}`,
          });
          return;
        }
        sendStampsResponse(res, await stamps.postVisitApprove(visitApproveMatch[1], verifierToken));
        return;
      }
      if (req.method === 'POST' && pathname === '/api/v1/stamps/authorizations') {
        const body = await parseJsonBody(req);
        sendStampsResponse(res, await stamps.postStampAuthorization(sessionId, body, idempotencyKey));
        return;
      }
      if (req.method === 'GET' && pathname === '/api/v1/stamps') {
        const query = Object.fromEntries(parsedUrl.searchParams) as {
          address?: string;
          campaignId?: string;
          spotId?: string;
        };
        sendStampsResponse(res, await stamps.getStamps(query));
        return;
      }
      if (req.method === 'GET' && pathname === '/api/v1/stamps/status') {
        const query = Object.fromEntries(parsedUrl.searchParams) as {
          address?: string;
          campaignId?: string;
          spotId?: string;
        };
        sendStampsResponse(res, await stamps.getStampStatus(query));
        return;
      }
      // 위 gate에 걸렸지만 어떤 route에도 일치하지 않음 -> 아래 공통 404로 진행.
    }

    // 일치하는 API 라우트 없음 (404)
    sendJsonResponse(res, 404, {
      success: false,
      error: `지원하지 않는 API 경로입니다: ${req.method} ${pathname}`,
    });
  } catch (err: any) {
    sendJsonResponse(res, 500, {
      success: false,
      error: err.message || '서버 내부 오류가 발생했습니다.',
    });
  }
}

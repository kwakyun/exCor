import type { IncomingMessage, ServerResponse } from 'http';
import { PlanController } from './controllers/planController';

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

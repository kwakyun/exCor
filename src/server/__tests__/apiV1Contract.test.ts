/**
 * P1-05 계약 기반 mock transport 테스트.
 *
 * 중요: 이 테스트는 실제 HTTP 서버(src/server/app.ts)나 실제 DB를 전혀 거치지 않는다.
 * docs/contracts/fixtures/{api-v1,core-v1}.json 고정 fixture와 InMemoryPlanRepository만 사용해
 * "DTO 모양"과 "idempotency 재생/충돌 분기"가 계약과 일치하는지만 확인한다.
 * 통과해도 실제 PostgreSQL 저장이 동작한다는 증거가 아니다 (P1-06에서 별도 검증).
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import {
  API_ERROR_HTTP_STATUS,
  buildErrorEnvelope,
  buildSuccessEnvelope,
  type CreatePlanRequestDTO,
  type PlanV2DTO,
} from '../../shared/api/dto';
import { InMemoryPlanRepository } from '../repositories/inMemoryPlanRepository';
import { validatePlannerInput, checkRecommendationConstraints } from '../application/plans/validatePlannerInput';
import { normalizeRequestHash } from '../application/plans/normalizeRequestHash';
import { IDEMPOTENCY_KEY_TTL_HOURS } from '../repositories/planRepository';

const here = dirname(fileURLToPath(import.meta.url));
const fixturesDir = join(here, '../../../docs/contracts/fixtures');

function readFixture<T>(name: string): T {
  return JSON.parse(readFileSync(join(fixturesDir, `${name}-v1.json`), 'utf8')) as T;
}

interface CoreFixture {
  version: string;
  catalog: {
    version: string;
    pricingPolicyVersion: string;
    spots: Array<{ id: string; districtId: string; name: string; category: string; active: boolean; unitPriceKRW: number; pricingUnit: string; tags: string[] }>;
    transit: Array<{ type: string; perPersonLegKRW: number; perVehicleLegKRW: number; vehicleCapacity: number }>;
  };
  cases: Array<{
    id: string;
    input: Record<string, unknown>;
    expected: Record<string, unknown>;
  }>;
}

interface ApiFixtureCase {
  id: string;
  method?: string;
  path?: string;
  headers?: Record<string, string>;
  body?: CreatePlanRequestDTO;
  expectedHttp: number;
  response?: { data?: Record<string, unknown>; error?: { code: string; message: string }; requestId: string };
  expectedSnapshotCase?: string;
  retry?: string;
}

interface RequestFixtureCase {
  id: string;
  body: { query: string; constraints?: Record<string, unknown>; catalogVersion: string };
  expectedHttp: number;
  expectedStatus?: string;
  expectedCode?: string;
}

interface ApiFixture {
  version: string;
  cases: ApiFixtureCase[];
  requestCases?: RequestFixtureCase[];
}

const core = readFixture<CoreFixture>('core');
const api = readFixture<ApiFixture>('api');
const REQUEST_ID = 'test-request-id';

function requestHashOf(body: CreatePlanRequestDTO): string {
  return normalizeRequestHash(body);
}

function buildSnapshotFromCoreCase(caseId: string, catalog: CoreFixture['catalog']): PlanV2DTO {
  const c = core.cases.find((x) => x.id === caseId)!;
  const expected = c.expected as { orderedSpotIds: string[]; transitCostKRW: number; totalSpent: number; remainingBudget: number };
  const items = expected.orderedSpotIds.map((id, idx) => {
    const spot = catalog.spots.find((s) => s.id === id)!;
    const partySize = (c.input as { partySize: number }).partySize;
    return {
      order: idx + 1,
      spotId: spot.id,
      name: spot.name,
      category: spot.category as PlanV2DTO['items'][number]['category'],
      unitPriceKRW: spot.unitPriceKRW,
      pricingUnit: 'perPerson' as const,
      costKRW: spot.unitPriceKRW * partySize,
    };
  });
  return {
    schemaVersion: 2,
    catalogVersion: catalog.version,
    pricingPolicyVersion: catalog.pricingPolicyVersion,
    preference: c.input as unknown as PlanV2DTO['preference'],
    districtId: (c.input as { districtId: PlanV2DTO['districtId'] }).districtId,
    items,
    transitCostKRW: expected.transitCostKRW,
    totalSpent: expected.totalSpent,
    remainingBudget: expected.remainingBudget,
  };
}

describe('P1-05 api-v1 contract (mock repository, no real server/DB)', () => {
  let repo: InMemoryPlanRepository;

  beforeEach(() => {
    repo = new InMemoryPlanRepository();
  });

  it('POST /api/v1/plans save case: 201 envelope with slug/snapshot/createdAt', async () => {
    const saveCase = api.cases.find((c) => c.id === 'save')!;
    const snapshot = buildSnapshotFromCoreCase(saveCase.expectedSnapshotCase!, core.catalog);
    const result = await repo.saveIdempotent({
      scope: 'plans',
      key: saveCase.headers!['Idempotency-Key'],
      requestHash: requestHashOf(saveCase.body!),
      snapshot,
    });
    expect(result.kind).toBe('created');
    if (result.kind === 'created' || result.kind === 'replayed') {
      const envelope = buildSuccessEnvelope(
        { slug: result.record.slug, snapshot: result.record.snapshot, createdAt: result.record.createdAt },
        REQUEST_ID
      );
      expect(envelope.data.snapshot.totalSpent).toBe(28200);
      expect(envelope.data.snapshot.remainingBudget).toBe(1800);
      expect(saveCase.expectedHttp).toBe(201);
    }
  });

  it('same Idempotency-Key + same body replays the same slug/snapshot/createdAt', async () => {
    const saveCase = api.cases.find((c) => c.id === 'save')!;
    const snapshot = buildSnapshotFromCoreCase(saveCase.expectedSnapshotCase!, core.catalog);
    const input = {
      scope: 'plans',
      key: saveCase.headers!['Idempotency-Key'],
      requestHash: requestHashOf(saveCase.body!),
      snapshot,
    };
    const first = await repo.saveIdempotent(input);
    const second = await repo.saveIdempotent(input);
    expect(first.kind).toBe('created');
    expect(second.kind).toBe('replayed');
    if (first.kind !== 'conflict' && second.kind !== 'conflict') {
      expect(second.record.slug).toBe(first.record.slug);
      expect(second.record.createdAt).toBe(first.record.createdAt);
    }
  });

  it('same Idempotency-Key + different body -> 409 IDEMPOTENCY_CONFLICT envelope', async () => {
    const conflictCase = api.cases.find((c) => c.id === 'conflict')!;
    const snapshot = buildSnapshotFromCoreCase('two-person', core.catalog);
    await repo.saveIdempotent({ scope: 'plans', key: 'dup-key', requestHash: 'body-a', snapshot });
    const second = await repo.saveIdempotent({ scope: 'plans', key: 'dup-key', requestHash: 'body-b', snapshot });
    expect(second.kind).toBe('conflict');

    const envelope = buildErrorEnvelope('IDEMPOTENCY_CONFLICT', conflictCase.response!.error!.message, REQUEST_ID);
    expect(API_ERROR_HTTP_STATUS[envelope.error.code]).toBe(conflictCase.expectedHttp);
    expect(envelope.error.code).toBe(conflictCase.response!.error!.code);
  });

  it('findBySlug miss -> 404 PLAN_NOT_FOUND matches fixture message exactly', async () => {
    const missingCase = api.cases.find((c) => c.id === 'missing')!;
    const found = await repo.findBySlug('does-not-exist');
    expect(found).toBeNull();

    const envelope = buildErrorEnvelope('PLAN_NOT_FOUND', missingCase.response!.error!.message, REQUEST_ID);
    expect(envelope.error.message).toBe(missingCase.response!.error!.message);
    expect(API_ERROR_HTTP_STATUS[envelope.error.code]).toBe(missingCase.expectedHttp);
  });

  it('storage failure surfaces as 503 STORAGE_UNAVAILABLE, never a silent null', async () => {
    const storageDownCase = api.cases.find((c) => c.id === 'storage-down')!;
    repo.simulateStorageFailureOnce();
    const snapshot = buildSnapshotFromCoreCase('two-person', core.catalog);
    await expect(
      repo.saveIdempotent({ scope: 'plans', key: 'k', requestHash: 'h', snapshot })
    ).rejects.toThrow();

    const envelope = buildErrorEnvelope('STORAGE_UNAVAILABLE', storageDownCase.response!.error!.message, REQUEST_ID);
    expect(API_ERROR_HTTP_STATUS[envelope.error.code]).toBe(storageDownCase.expectedHttp);
  });

  it('RAG fixture cases (clarify/insufficient/infeasible/model-down) map to declared error codes or 200 statuses only', () => {
    for (const c of ['clarify', 'insufficient', 'infeasible', 'model-down']) {
      const fixtureCase = api.cases.find((x) => x.id === c)!;
      if (fixtureCase.response?.error) {
        expect(API_ERROR_HTTP_STATUS[fixtureCase.response.error.code as keyof typeof API_ERROR_HTTP_STATUS]).toBe(
          fixtureCase.expectedHttp
        );
      } else {
        expect(fixtureCase.expectedHttp).toBe(200);
        expect(['clarify', 'insufficient_evidence', 'infeasible', 'ok']).toContain(
          (fixtureCase.response!.data as { status: string }).status
        );
      }
    }
  });

  it('core-v1 invalid-input fixture cases map to INVALID_INPUT with the same field codes', () => {
    const invalidParty = core.cases.find((c) => c.id === 'invalid-party')!;
    const zeroBudget = core.cases.find((c) => c.id === 'zero-budget')!;

    const r1 = validatePlannerInput(invalidParty.input as never);
    const r2 = validatePlannerInput(zeroBudget.input as never);

    expect(r1.valid).toBe(false);
    expect(r2.valid).toBe(false);
    if (!r1.valid) expect(r1.fields).toEqual((invalidParty.expected as { fields: Record<string, string> }).fields);
    if (!r2.valid) expect(r2.fields).toEqual((zeroBudget.expected as { fields: Record<string, string> }).fields);
  });

  it('valid core-v1 case passes format validation (feasibility is the engine\'s job, not this layer)', () => {
    const ok = core.cases.find((c) => c.id === 'two-person')!;
    const result = validatePlannerInput(ok.input as never);
    expect(result.valid).toBe(true);
  });

  describe('POST /api/v1/recommendations constraints (api-v1.0.0-rc3, Partial<PlannerInput>)', () => {
    const requestCases = api.requestCases ?? [];

    it('fixture has the 4 rc3 requestCases this contract expects', () => {
      expect(requestCases.map((c) => c.id).sort()).toEqual(
        ['conflicting-budget', 'invalid-party-type', 'invalid-provided-party', 'missing-budget-party'].sort()
      );
    });

    it('missing-budget-party: required fields absent -> clarify (200), not an error', () => {
      const c = requestCases.find((x) => x.id === 'missing-budget-party')!;
      const result = checkRecommendationConstraints(c.body.constraints as never);
      expect(result.status).toBe('clarify');
      expect(c.expectedHttp).toBe(200);
      expect(c.expectedStatus).toBe('clarify');
      if (result.status === 'clarify') {
        expect(result.missingFields).toEqual(expect.arrayContaining(['budgetKRW', 'partySize']));
      }
    });

    it('invalid-provided-party: partySize=0 provided -> INVALID_INPUT (400), not clarify', () => {
      const c = requestCases.find((x) => x.id === 'invalid-provided-party')!;
      const result = checkRecommendationConstraints(c.body.constraints as never);
      expect(result.status).toBe('invalid');
      expect(c.expectedHttp).toBe(400);
      expect(c.expectedCode).toBe('INVALID_INPUT');
      if (result.status === 'invalid') {
        expect(result.fields.partySize).toBe('OUT_OF_RANGE');
        expect(API_ERROR_HTTP_STATUS.INVALID_INPUT).toBe(c.expectedHttp);
      }
    });

    it('invalid-party-type: partySize is a string -> INVALID_INPUT (400)', () => {
      const c = requestCases.find((x) => x.id === 'invalid-party-type')!;
      const result = checkRecommendationConstraints(c.body.constraints as never);
      expect(result.status).toBe('invalid');
      expect(c.expectedHttp).toBe(400);
      expect(c.expectedCode).toBe('INVALID_INPUT');
      if (result.status === 'invalid') {
        expect(result.fields.partySize).toBe('INVALID_TYPE');
      }
    });

    it(
      'conflicting-budget: NL query ("5만원") vs explicit constraints.budgetKRW=30000 -- ' +
        'NOT resolvable at this DTO layer. Documented gap, not faked: conflict detection needs ' +
        'query parsing (extractConstraints, P2-04). This layer only confirms the explicit fields ' +
        'are individually well-formed and complete.',
      () => {
        const c = requestCases.find((x) => x.id === 'conflicting-budget')!;
        const result = checkRecommendationConstraints(c.body.constraints as never);
        expect(result.status).toBe('complete');
        expect(c.expectedStatus).toBe('clarify');
        expect(c.expectedHttp).toBe(200);
      }
    );
  });

  describe('Idempotency-Key TTL boundary + normalized request hash (03 proposal, local mock candidate — not a confirmed production policy)', () => {
    it('normalizeRequestHash is stable under key reordering and sensitive to value changes', () => {
      const a: CreatePlanRequestDTO = {
        preference: { budgetKRW: 30000, partySize: 2, districtId: 'jeonpo', theme: 'all', transitType: 'transit_walk' },
        orderedSpotIds: ['qa-f1', 'qa-c1', 'qa-a1'],
        catalogVersion: 'qa-synthetic-v1',
      };
      // 같은 값, 필드 순서만 다른 객체 (JS는 리터럴 키 순서를 보존하므로 재구성해 순서를 바꾼다)
      const bReordered = JSON.parse(
        JSON.stringify({
          catalogVersion: a.catalogVersion,
          orderedSpotIds: a.orderedSpotIds,
          preference: {
            transitType: a.preference.transitType,
            theme: a.preference.theme,
            districtId: a.preference.districtId,
            partySize: a.preference.partySize,
            budgetKRW: a.preference.budgetKRW,
          },
        })
      ) as CreatePlanRequestDTO;
      const c = { ...a, preference: { ...a.preference, budgetKRW: 40000 } };

      expect(normalizeRequestHash(a)).toBe(normalizeRequestHash(bReordered));
      expect(normalizeRequestHash(a)).not.toBe(normalizeRequestHash(c));
    });

    it('just before the 24h boundary: same key/same body still replays (same slug, same createdAt)', async () => {
      const t0 = new Date('2026-09-24T00:00:00.000Z');
      const justBefore = new Date(t0.getTime() + IDEMPOTENCY_KEY_TTL_HOURS * 60 * 60 * 1000 - 1);
      let now = t0;
      const repo = new InMemoryPlanRepository(() => now);
      const snapshot = buildSnapshotFromCoreCase('two-person', core.catalog);
      const input = { scope: 'plans', key: 'ttl-key', requestHash: 'h', snapshot };

      const first = await repo.saveIdempotent(input);
      now = justBefore;
      const second = await repo.saveIdempotent(input);

      expect(first.kind).toBe('created');
      expect(second.kind).toBe('replayed');
      if (first.kind !== 'conflict' && second.kind !== 'conflict') {
        expect(second.record.slug).toBe(first.record.slug);
        expect(second.record.createdAt).toBe(first.record.createdAt);
      }
    });

    it('at/after the 24h boundary: same key is treated as a brand-new request (new slug), not a conflict', async () => {
      const t0 = new Date('2026-09-24T00:00:00.000Z');
      const atBoundary = new Date(t0.getTime() + IDEMPOTENCY_KEY_TTL_HOURS * 60 * 60 * 1000);
      let now = t0;
      const repo = new InMemoryPlanRepository(() => now);
      const snapshot = buildSnapshotFromCoreCase('two-person', core.catalog);

      const first = await repo.saveIdempotent({ scope: 'plans', key: 'ttl-key', requestHash: 'h-old', snapshot });
      now = atBoundary;
      const second = await repo.saveIdempotent({ scope: 'plans', key: 'ttl-key', requestHash: 'h-new', snapshot });

      expect(first.kind).toBe('created');
      expect(second.kind).toBe('created');
      if (first.kind !== 'conflict' && second.kind !== 'conflict') {
        expect(second.record.slug).not.toBe(first.record.slug);
      }
    });
  });
});

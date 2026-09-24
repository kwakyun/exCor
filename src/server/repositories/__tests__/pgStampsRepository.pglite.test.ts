/**
 * P3-DB 실제 검증: PgStampsRepository를 @electric-sql/pglite(WASM 임베디드 PostgreSQL
 * 호환 엔진) 위에서 실행해, in-memory fake가 아닌 진짜 UNIQUE 제약/원자적 갱신을 확인한다.
 *
 * @electric-sql/pglite는 아직 root devDependency로 승인되지 않았다(agent_02 창구 요청
 * 대상). 미설치 환경(다른 agent 셸, CI)에서는 describe.skipIf로 조용히 건너뛴다.
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { Address } from 'viem';
import { PgStampsRepository } from '../pgStampsRepository';
import { createPgliteTestClient, isPgliteAvailable, type PgliteTestClient } from '../testing/pgliteSqlClient';

const available = await isPgliteAvailable();

describe.skipIf(!available)('PgStampsRepository (pglite 실제 DB)', () => {
  let client: PgliteTestClient;
  let repo: PgStampsRepository;

  beforeEach(async () => {
    const created = await createPgliteTestClient();
    if (!created) throw new Error('pglite unexpectedly unavailable after availability check');
    client = created;
    repo = new PgStampsRepository(client.sql);
  });

  afterEach(async () => {
    await client.close();
  });

  const RECIPIENT = '0x0000000000000000000000000000000000000001' as Address;

  it('createWalletChallenge -> consumeWalletChallenge: 1회만 소비 가능(원자적)', async () => {
    const challenge = await repo.createWalletChallenge({
      address: RECIPIENT,
      nonce: 'nonce-1',
      message: 'sign me',
      expiresAt: 1_700_000_100,
    });
    expect(challenge.consumedAt).toBeNull();

    const first = await repo.consumeWalletChallenge(challenge.id);
    expect(first).not.toBeNull();
    expect(first?.consumedAt).not.toBeNull();

    // 두 번째 소비 시도는 반드시 null (UPDATE ... WHERE consumed_at IS NULL이 0행 갱신)
    const second = await repo.consumeWalletChallenge(challenge.id);
    expect(second).toBeNull();
  });

  it('createVisitRequest -> approveVisitRequest: requested 상태에서만 성공', async () => {
    const visit = await repo.createVisitRequest({
      wallet: RECIPIENT,
      campaignNamespace: 'jeonpo-2026',
      canonicalSpotId: 'jp-f1',
      expiresAt: 1_700_000_200,
    });
    expect(visit.state).toBe('requested');

    const approved = await repo.approveVisitRequest(visit.id, 'verifier-1');
    expect(approved?.state).toBe('approved');
    expect(approved?.verifierId).toBe('verifier-1');

    // 이미 approved -> 재승인 시도는 0행 갱신 -> null
    const secondApproval = await repo.approveVisitRequest(visit.id, 'verifier-2');
    expect(secondApproval).toBeNull();
  });

  it('createAuthorizationIdempotent: 같은 키+같은 해시 -> replayed, 같은 키+다른 해시 -> conflict', async () => {
    const visit = await repo.createVisitRequest({
      wallet: RECIPIENT,
      campaignNamespace: 'jeonpo-2026',
      canonicalSpotId: 'jp-f1',
      expiresAt: 1_700_000_200,
    });
    await repo.approveVisitRequest(visit.id, 'verifier-1');

    const baseInput = {
      visitId: visit.id,
      recipient: RECIPIENT,
      chainId: 84532,
      contractAddress: '0x0000000000000000000000000000000000000002' as Address,
      campaignId: '0x01' as `0x${string}`,
      spotId: '0x02' as `0x${string}`,
      nonce: 'auth-nonce-1',
      deadline: '1700003600',
      requestBodyHash: '0xhash1' as `0x${string}`,
      signature: '0xsig1' as `0x${string}`,
      idempotencyScope: 'stamps:issue',
      idempotencyKey: 'idem-key-1',
    };

    const created = await repo.createAuthorizationIdempotent(baseInput);
    expect(created.kind).toBe('created');

    const replayed = await repo.createAuthorizationIdempotent(baseInput);
    expect(replayed.kind).toBe('replayed');

    const conflicting = await repo.createAuthorizationIdempotent({
      ...baseInput,
      requestBodyHash: '0xdifferent' as `0x${string}`,
    });
    expect(conflicting.kind).toBe('conflict');
  });

  it('createAuthorizationIdempotent: recipient+nonce UNIQUE 위반 -> conflict (idempotency key가 달라도)', async () => {
    const visit = await repo.createVisitRequest({
      wallet: RECIPIENT,
      campaignNamespace: 'jeonpo-2026',
      canonicalSpotId: 'jp-f1',
      expiresAt: 1_700_000_200,
    });
    await repo.approveVisitRequest(visit.id, 'verifier-1');

    const first = await repo.createAuthorizationIdempotent({
      visitId: visit.id,
      recipient: RECIPIENT,
      chainId: 84532,
      contractAddress: '0x0000000000000000000000000000000000000002' as Address,
      campaignId: '0x01' as `0x${string}`,
      spotId: '0x02' as `0x${string}`,
      nonce: 'reused-nonce',
      deadline: '1700003600',
      requestBodyHash: '0xhashA' as `0x${string}`,
      signature: '0xsigA' as `0x${string}`,
      idempotencyScope: 'stamps:issue',
      idempotencyKey: 'idem-key-A',
    });
    expect(first.kind).toBe('created');

    const second = await repo.createAuthorizationIdempotent({
      visitId: visit.id,
      recipient: RECIPIENT,
      chainId: 84532,
      contractAddress: '0x0000000000000000000000000000000000000002' as Address,
      campaignId: '0x01' as `0x${string}`,
      spotId: '0x02' as `0x${string}`,
      nonce: 'reused-nonce',
      deadline: '1700003700',
      requestBodyHash: '0xhashB' as `0x${string}`,
      signature: '0xsigB' as `0x${string}`,
      idempotencyScope: 'stamps:issue',
      idempotencyKey: 'idem-key-B',
    });
    expect(second.kind).toBe('conflict');
  });
});

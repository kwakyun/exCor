/**
 * 테스트 전용 mock 구현. 영속성/트랜잭션/동시성 보장이 없다.
 * "실제 저장 통과"의 증거로 인용하지 않는다 (docs/contracts/api-v1.md, AGENTS 협업 규칙).
 * 목적: P1-05 계약(에러 envelope, idempotency 재생/충돌 분기)을 실제 서버 없이 검증하기 위한 transport 테스트 fixture.
 */
import type {
  CatalogRepository,
  PlanRepository,
  SaveIdempotentInput,
  SaveIdempotentResult,
  SavedPlanRecord,
} from './planRepository';
import { IDEMPOTENCY_KEY_TTL_HOURS } from './planRepository';
import type { CatalogSnapshotDTO } from '../../shared/api/dto';

export class InMemoryCatalogRepository implements CatalogRepository {
  constructor(private readonly snapshots: Map<string, CatalogSnapshotDTO>) {}

  async get(version?: string): Promise<CatalogSnapshotDTO | null> {
    if (version) return this.snapshots.get(version) ?? null;
    // 버전 미지정 시 가장 최근에 등록된 스냅샷을 반환 (mock 한정 규칙, 서버 구현과 다를 수 있음)
    const values = [...this.snapshots.values()];
    return values.length > 0 ? values[values.length - 1] : null;
  }
}

interface StoredEntry {
  record: SavedPlanRecord;
}

export class InMemoryPlanRepository implements PlanRepository {
  private bySlug = new Map<string, StoredEntry>();
  private byIdempotencyKey = new Map<string, StoredEntry>(); // key: `${scope}:${key}`
  private slugCounter = 0;
  private failNext: 'storage-down' | null = null;

  /**
   * 테스트에서 TTL 만료 경계를 재현하기 위한 시계 주입 훅.
   * 기본은 실제 시계(Date.now)이며, 테스트만 고정 시각을 넣는다.
   */
  constructor(private readonly now: () => Date = () => new Date()) {}

  /** 테스트에서 STORAGE_UNAVAILABLE(503) 분기를 재현하기 위한 훅. 실제 구현에는 없다. */
  simulateStorageFailureOnce() {
    this.failNext = 'storage-down';
  }

  private nextSlug(): string {
    this.slugCounter += 1;
    return `bsn-mock${String(this.slugCounter).padStart(4, '0')}`;
  }

  private isExpired(record: SavedPlanRecord): boolean {
    return this.now().getTime() >= new Date(record.expiresAt).getTime();
  }

  async saveIdempotent(input: SaveIdempotentInput): Promise<SaveIdempotentResult> {
    if (this.failNext === 'storage-down') {
      this.failNext = null;
      throw new Error('STORAGE_UNAVAILABLE');
    }

    const idemKey = `${input.scope}:${input.key}`;
    const existing = this.byIdempotencyKey.get(idemKey);
    if (existing && !this.isExpired(existing.record)) {
      if (existing.record.requestHash !== input.requestHash) {
        return { kind: 'conflict' };
      }
      return { kind: 'replayed', record: existing.record };
    }
    // existing이 없거나 만료됨 -> 완전히 새 요청으로 취급(만료된 키 재사용은 conflict가 아니다).
    if (existing) {
      this.byIdempotencyKey.delete(idemKey);
    }

    const createdAt = this.now();
    const expiresAt = new Date(createdAt.getTime() + IDEMPOTENCY_KEY_TTL_HOURS * 60 * 60 * 1000);
    const record: SavedPlanRecord = {
      slug: this.nextSlug(),
      snapshot: input.snapshot,
      createdAt: createdAt.toISOString(),
      expiresAt: expiresAt.toISOString(),
      idempotencyScope: input.scope,
      idempotencyKey: input.key,
      requestHash: input.requestHash,
    };
    const entry: StoredEntry = { record };
    this.bySlug.set(record.slug, entry);
    this.byIdempotencyKey.set(idemKey, entry);
    return { kind: 'created', record };
  }

  async findBySlug(slug: string): Promise<SavedPlanRecord | null> {
    return this.bySlug.get(slug)?.record ?? null;
  }
}

/**
 * Idempotency-Key 충돌 판별용 "정규화된 요청 해시".
 * 같은 논리적 요청이 키 순서/공백만 다르게 도착해도 같은 해시가 나와야
 * (그래야 진짜 같은 요청의 재시도를 오탐 conflict로 만들지 않는다), 다른 값이 섞이면
 * 반드시 달라져야 한다(그래야 진짜 다른 본문의 키 재사용을 conflict로 잡아낸다).
 *
 * 알고리즘: 객체 키를 재귀적으로 정렬한 뒤 JSON.stringify -> sha256 hex.
 * 이 파일은 P1-05 범위이며 실제 PostgreSQL 저장 시에도 애플리케이션 계층에서
 * 동일 함수를 재사용해야 한다(레포지토리가 자체적으로 재정규화하지 않는다).
 */
import { createHash } from 'node:crypto';
import type { CreatePlanRequestDTO } from '../../../shared/api/dto';

function sortKeysDeep(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortKeysDeep);
  }
  if (value !== null && typeof value === 'object') {
    const sorted: Record<string, unknown> = {};
    for (const key of Object.keys(value as Record<string, unknown>).sort()) {
      sorted[key] = sortKeysDeep((value as Record<string, unknown>)[key]);
    }
    return sorted;
  }
  return value;
}

export function normalizeRequestHash(body: CreatePlanRequestDTO): string {
  const normalized = JSON.stringify(sortKeysDeep(body));
  return createHash('sha256').update(normalized, 'utf8').digest('hex');
}

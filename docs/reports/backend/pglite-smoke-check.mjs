/**
 * @electric-sql/pglite (WASM 임베디드 PostgreSQL) 동작 확인용 1회성 smoke check.
 *
 * 이 저장소의 device_bash 샌드박스에는 psql/docker/실제 PostgreSQL 서버가 없어
 * (ENV-01, agent_02 미착수) db/migrations + repository 구현을 "메모리 fake"가 아니라
 * 실제 SQL 엔진(UNIQUE 제약, transaction rollback)으로 검증하기 위해 사용했다.
 * 아직 package.json/package-lock.json에는 추가하지 않았다 (루트 의존성은 02 소유 —
 * docs/reports/backend/api-contract.md의 dependency_request로 devDependency 추가를 요청함).
 * 로컬 확인 시: `npm install @electric-sql/pglite --no-save` 후 `node docs/reports/backend/pglite-smoke-check.mjs`.
 *
 * 실행 결과(이 세션에서 확인, 2026-09-24):
 *   UNIQUE constraint enforced as expected: duplicate key value violates unique constraint "t_pkey"
 *   transaction threw as expected: rollback-trigger
 *   rows for b after rollback (should be 0): 0
 *   OK
 */
import { PGlite } from '@electric-sql/pglite';

const db = new PGlite();
await db.exec(`CREATE TABLE t (id text PRIMARY KEY, val text);`);
await db.query(`INSERT INTO t (id, val) VALUES ($1,$2)`, ['a', '1']);

try {
  await db.query(`INSERT INTO t (id, val) VALUES ($1,$2)`, ['a', '2']);
  console.log('UNIQUE VIOLATION NOT DETECTED - FAIL');
} catch (e) {
  console.log('UNIQUE constraint enforced as expected:', e.message);
}

try {
  await db.transaction(async (tx) => {
    await tx.query(`INSERT INTO t (id, val) VALUES ($1,$2)`, ['b', '1']);
    throw new Error('rollback-trigger');
  });
} catch (e) {
  console.log('transaction threw as expected:', e.message);
}

const res = await db.query(`SELECT * FROM t WHERE id = 'b'`);
console.log('rows for b after rollback (should be 0):', res.rows.length);
console.log('OK');

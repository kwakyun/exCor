/**
 * P3-DB 테스트 전용 SqlClient. `@electric-sql/pglite`(WASM 임베디드 PostgreSQL 호환
 * 엔진)를 실제 SQL 실행기로 사용해 pgStampsRepository/pgIndexerRepository를 진짜
 * UNIQUE 제약·transaction·rollback 위에서 검증한다 ("메모리 fake는 영속성 통과 증거가
 * 아니다" - in-memory 참조 구현만으로는 부족하다는 프로젝트 원칙에 따른 것).
 *
 * `@electric-sql/pglite`는 아직 root devDependency로 승인되지 않았다(02 창구 요청 대상,
 * dependency-requests.md 참고). 그 전까지 이 파일은 동적 import로만 로드하고, 패키지가
 * 없는 환경(다른 agent의 셸, CI 등)에서는 null을 반환해 테스트가 조용히 skip되도록 한다.
 * 절대로 이 devDependency를 package.json에 직접 추가하지 않는다.
 */
import type { SqlClient, SqlExecutor } from '../../storage/sqlClient';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '../../../..');
const MIGRATIONS = ['0030_stamps_core.sql', '0031_chain_indexer.sql'];

export interface PgliteTestClient {
  sql: SqlClient;
  close(): Promise<void>;
}

/**
 * pglite를 동적 import로 로드하고 0030/0031 migration을 적용한 인스턴스를 만든다.
 * 패키지가 설치되어 있지 않으면 null을 반환한다 (호출측이 describe.skipIf로 건너뛴다).
 */
export async function createPgliteTestClient(): Promise<PgliteTestClient | null> {
  let PGlite: typeof import('@electric-sql/pglite').PGlite;
  try {
    ({ PGlite } = await import('@electric-sql/pglite'));
  } catch {
    return null;
  }

  const db = new PGlite();

  for (const file of MIGRATIONS) {
    const sqlText = readFileSync(path.join(REPO_ROOT, 'db', 'migrations', file), 'utf-8');
    await db.exec(sqlText);
  }

  const executor: SqlExecutor = {
    async query<Row = Record<string, unknown>>(sqlText: string, params: unknown[] = []) {
      const result = await db.query<Row>(sqlText, params);
      return { rows: result.rows };
    },
  };

  const sql: SqlClient = {
    query: executor.query.bind(executor),
    async withTransaction<T>(fn: (tx: SqlExecutor) => Promise<T>): Promise<T> {
      return db.transaction(async (tx) => {
        const txExecutor: SqlExecutor = {
          async query<Row = Record<string, unknown>>(sqlText: string, params: unknown[] = []) {
            const result = await tx.query<Row>(sqlText, params);
            return { rows: result.rows };
          },
        };
        return fn(txExecutor);
      });
    },
  };

  return {
    sql,
    async close() {
      await db.close();
    },
  };
}

/** 이 프로세스에서 pglite를 사용할 수 있는지 미리 확인한다 (describe.skipIf용). */
export async function isPgliteAvailable(): Promise<boolean> {
  try {
    await import('@electric-sql/pglite');
    return true;
  } catch {
    return false;
  }
}

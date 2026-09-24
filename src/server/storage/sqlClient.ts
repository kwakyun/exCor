/**
 * P3-DB: repository 구현이 의존하는 최소 SQL 실행 추상화.
 *
 * 왜 `pg`(node-postgres)를 직접 import하지 않는가: 루트 새 패키지 추가는 02 소유
 * (assignments.md shared_resource_locks: "서버/체인 새 패키지는 각각 02/04 창구에 요청").
 * 대신 이 좁은 구조적 인터페이스(파라미터 바인딩 쿼리 + transaction)만 의존하게 만들어,
 * ENV-01에서 실제 드라이버(`pg`, `postgres.js` 등)를 무엇으로 정하든 이 파일의 repository
 * 코드는 바꿀 필요가 없다. 지금 당장은 `src/server/repositories/testing/pgliteSqlClient.ts`
 * (테스트 전용, @electric-sql/pglite 동적 import)로 실제 PostgreSQL 호환 엔진 위에서
 * migration/트랜잭션/UNIQUE 제약을 검증한다.
 */

export interface SqlExecutor {
  // Row는 의도적으로 인덱스 시그니처를 요구하지 않는다: repository 코드가 좁은 컬럼별
  // 인터페이스(WalletChallengeRow 등)를 그대로 타입 인자로 넘기기 때문이며, TS는 명시적
  // 인덱스 시그니처가 없는 interface를 `Record<string, unknown>` 제약에 대해 구조적으로
  // 만족시키지 못한다고 판단한다(TS2344). 실행 시점에는 어차피 드라이버가 plain object 행을
  // 반환하므로 안전하다.
  query<Row = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<{ rows: Row[] }>;
}

export interface SqlClient extends SqlExecutor {
  withTransaction<T>(fn: (tx: SqlExecutor) => Promise<T>): Promise<T>;
}

/** Postgres unique_violation SQLSTATE. pg/pglite 모두 error.code에 이 값을 채운다. */
export const PG_UNIQUE_VIOLATION = '23505';

export function isUniqueViolation(err: unknown): err is { code: string; constraint?: string } {
  return (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    (err as { code?: unknown }).code === PG_UNIQUE_VIOLATION
  );
}

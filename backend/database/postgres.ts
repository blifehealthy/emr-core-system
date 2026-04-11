import { Pool } from 'pg';

export type Queryable = {
  query: <T = unknown>(sql: string, params?: unknown[]) => Promise<{ rows: T[] }>;
};

export function createPostgresDb(connectionString: string): Queryable & {
  healthCheck: () => Promise<void>;
  close: () => Promise<void>;
} {
  const pool = new Pool({
    connectionString,
  });

  return {
    async query<T>(sql: string, params?: unknown[]) {
      const result = await pool.query(sql, params);
      return { rows: result.rows as T[] };
    },
    async healthCheck() {
      await pool.query('SELECT 1');
    },
    async close() {
      await pool.end();
    },
  };
}

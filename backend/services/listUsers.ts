export function listUsers(db: {
  query: <T = unknown>(sql: string, params?: unknown[]) => Promise<{ rows: T[] }>;
}) {
  return async function run(input: { clinicId: string }) {
    const result = await db.query(
      `
        SELECT *
        FROM users
        WHERE clinic_id = $1
          AND deleted_at IS NULL
        ORDER BY created_at DESC
      `,
      [input.clinicId]
    );

    return result.rows;
  };
}

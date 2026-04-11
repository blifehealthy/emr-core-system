export function listUsers(db: {
  query: <T = unknown>(sql: string, params?: unknown[]) => Promise<{ rows: T[] }>;
}) {
  return async function run(input: { clinicId: string }) {
    const result = await db.query(
      `
        SELECT
          id,
          clinic_id,
          username,
          display_name,
          role,
          is_active,
          created_at,
          updated_at,
          deleted_at
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

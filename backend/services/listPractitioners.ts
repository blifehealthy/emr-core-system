export function listPractitioners(db: {
  query: <T = unknown>(sql: string, params?: unknown[]) => Promise<{ rows: T[] }>;
}) {
  return async function run(input: { clinicId: string }) {
    const result = await db.query(
      `
        SELECT
          id,
          clinic_id,
          user_id,
          practitioner_code,
          first_name,
          last_name,
          license_number,
          specialty,
          is_active,
          created_at,
          updated_at,
          deleted_at
        FROM practitioners
        WHERE clinic_id = $1
          AND deleted_at IS NULL
        ORDER BY created_at DESC
      `,
      [input.clinicId]
    );

    return result.rows;
  };
}

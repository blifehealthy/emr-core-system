export function getPatientFlagById(db: {
  query: <T = unknown>(sql: string, params?: unknown[]) => Promise<{ rows: T[] }>;
}) {
  return async function run(input: { flagId: string }) {
    const result = await db.query(
      `
        SELECT
          id,
          patient_id,
          flag_type,
          label,
          description,
          severity,
          status,
          source,
          starts_at,
          ends_at,
          created_by_user_id,
          notes,
          created_at,
          updated_at,
          deleted_at
        FROM patient_flags
        WHERE id = $1
          AND deleted_at IS NULL
      `,
      [input.flagId]
    );

    return result.rows[0] ?? null;
  };
}

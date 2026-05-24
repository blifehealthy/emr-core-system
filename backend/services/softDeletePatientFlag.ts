export function softDeletePatientFlag(db: {
  query: <T = unknown>(sql: string, params?: unknown[]) => Promise<{ rows: T[] }>;
}) {
  return async function run(input: { flagId: string }) {
    const result = await db.query(
      `
        UPDATE patient_flags
        SET deleted_at = COALESCE(deleted_at, NOW())
        WHERE id = $1
          AND deleted_at IS NULL
        RETURNING
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
      `,
      [input.flagId]
    );

    return result.rows[0] ?? null;
  };
}

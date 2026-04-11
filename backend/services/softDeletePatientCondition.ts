export function softDeletePatientCondition(db: {
  query: <T = unknown>(sql: string, params?: unknown[]) => Promise<{ rows: T[] }>;
}) {
  return async function run(input: { conditionId: string }) {
    const result = await db.query(
      `
        UPDATE patient_conditions
        SET deleted_at = COALESCE(deleted_at, NOW())
        WHERE id = $1
          AND deleted_at IS NULL
        RETURNING
          id,
          patient_id,
          condition_code,
          coding_system,
          condition_name,
          clinical_status,
          onset_date,
          abatement_date,
          notes,
          created_at,
          updated_at,
          deleted_at
      `,
      [input.conditionId]
    );

    return result.rows[0] ?? null;
  };
}

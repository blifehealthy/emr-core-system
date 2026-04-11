export function getPatientConditionById(db: {
  query: <T = unknown>(sql: string, params?: unknown[]) => Promise<{ rows: T[] }>;
}) {
  return async function run(input: { conditionId: string }) {
    const result = await db.query(
      `
        SELECT
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
        FROM patient_conditions
        WHERE id = $1
          AND deleted_at IS NULL
      `,
      [input.conditionId]
    );

    return result.rows[0] ?? null;
  };
}

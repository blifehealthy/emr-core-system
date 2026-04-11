export function getPatientMedicationById(db: {
  query: <T = unknown>(sql: string, params?: unknown[]) => Promise<{ rows: T[] }>;
}) {
  return async function run(input: { medicationId: string }) {
    const result = await db.query(
      `
        SELECT
          id,
          patient_id,
          prescribed_by_practitioner_id,
          medication_name,
          rxnorm_code,
          dosage,
          route,
          frequency,
          instructions,
          status,
          start_date,
          end_date,
          notes,
          created_at,
          updated_at,
          deleted_at
        FROM patient_medications
        WHERE id = $1
          AND deleted_at IS NULL
      `,
      [input.medicationId]
    );

    return result.rows[0] ?? null;
  };
}

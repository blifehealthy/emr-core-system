export function softDeletePatientMedication(db: {
  query: <T = unknown>(sql: string, params?: unknown[]) => Promise<{ rows: T[] }>;
}) {
  return async function run(input: { medicationId: string }) {
    const result = await db.query(
      `
        UPDATE patient_medications
        SET deleted_at = COALESCE(deleted_at, NOW())
        WHERE id = $1
          AND deleted_at IS NULL
        RETURNING
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
      `,
      [input.medicationId]
    );

    return result.rows[0] ?? null;
  };
}

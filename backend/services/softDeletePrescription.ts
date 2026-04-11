export function softDeletePrescription(db: {
  query: <T = unknown>(sql: string, params?: unknown[]) => Promise<{ rows: T[] }>;
}) {
  return async function run(input: { prescriptionId: string }) {
    const result = await db.query(
      `
        UPDATE prescriptions
        SET deleted_at = COALESCE(deleted_at, NOW())
        WHERE id = $1
          AND deleted_at IS NULL
        RETURNING
          id,
          encounter_id,
          clinical_note_id,
          prescribed_by_practitioner_id,
          medication_name,
          rxnorm_code,
          dosage,
          route,
          frequency,
          duration_text,
          instructions,
          status,
          start_date,
          end_date,
          created_at,
          updated_at,
          deleted_at
      `,
      [input.prescriptionId]
    );

    return result.rows[0] ?? null;
  };
}

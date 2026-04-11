export function getDiagnosisById(db: {
  query: <T = unknown>(sql: string, params?: unknown[]) => Promise<{ rows: T[] }>;
}) {
  return async function run(input: { diagnosisId: string }) {
    const result = await db.query(
      `
        SELECT
          id,
          encounter_id,
          clinical_note_id,
          diagnosis_code,
          coding_system,
          diagnosis_name,
          diagnosis_type,
          status,
          sequence_number,
          diagnosed_at,
          resolution_note,
          notes,
          created_at,
          updated_at,
          deleted_at
        FROM diagnoses
        WHERE id = $1
          AND deleted_at IS NULL
      `,
      [input.diagnosisId]
    );

    return result.rows[0] ?? null;
  };
}

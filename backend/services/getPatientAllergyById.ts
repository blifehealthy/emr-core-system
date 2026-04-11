export function getPatientAllergyById(db: {
  query: <T = unknown>(sql: string, params?: unknown[]) => Promise<{ rows: T[] }>;
}) {
  return async function run(input: { allergyId: string }) {
    const result = await db.query(
      `
        SELECT
          id,
          patient_id,
          allergen_name,
          allergen_category,
          reaction,
          severity,
          status,
          criticality,
          recorded_at,
          last_occurrence_at,
          notes,
          created_at,
          updated_at,
          deleted_at
        FROM patient_allergies
        WHERE id = $1
          AND deleted_at IS NULL
      `,
      [input.allergyId]
    );

    return result.rows[0] ?? null;
  };
}

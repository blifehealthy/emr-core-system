import type { AllergyStatus } from '../api/types.ts';

export function listPatientAllergies(db: {
  query: <T = unknown>(sql: string, params?: unknown[]) => Promise<{ rows: T[] }>;
}) {
  return async function run(input: { patientId: string; status?: AllergyStatus }) {
    const conditions = ['patient_id = $1', 'deleted_at IS NULL'];
    const params: unknown[] = [input.patientId];

    if (input.status) {
      params.push(input.status);
      conditions.push(`status = $${params.length}`);
    }

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
        WHERE ${conditions.join('\n          AND ')}
        ORDER BY recorded_at DESC, created_at DESC
      `,
      params
    );

    return result.rows;
  };
}

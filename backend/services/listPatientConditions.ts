import type { PatientConditionStatus } from '../api/types.ts';

export function listPatientConditions(db: {
  query: <T = unknown>(sql: string, params?: unknown[]) => Promise<{ rows: T[] }>;
}) {
  return async function run(input: { patientId: string; clinicalStatus?: PatientConditionStatus }) {
    const conditions = ['patient_id = $1', 'deleted_at IS NULL'];
    const params: unknown[] = [input.patientId];

    if (input.clinicalStatus) {
      params.push(input.clinicalStatus);
      conditions.push(`clinical_status = $${params.length}`);
    }

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
        WHERE ${conditions.join('\n          AND ')}
        ORDER BY created_at DESC
      `,
      params
    );

    return result.rows;
  };
}

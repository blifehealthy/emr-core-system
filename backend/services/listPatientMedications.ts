import type { PatientMedicationStatus } from '../api/types.ts';

export function listPatientMedications(db: {
  query: <T = unknown>(sql: string, params?: unknown[]) => Promise<{ rows: T[] }>;
}) {
  return async function run(input: { patientId: string; status?: PatientMedicationStatus }) {
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
        WHERE ${conditions.join('\n          AND ')}
        ORDER BY created_at DESC
      `,
      params
    );

    return result.rows;
  };
}

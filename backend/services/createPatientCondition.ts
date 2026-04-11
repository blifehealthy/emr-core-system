import type { PatientConditionStatus } from '../api/types.ts';

export function createPatientCondition(db: {
  query: <T = unknown>(sql: string, params?: unknown[]) => Promise<{ rows: T[] }>;
}) {
  return async function run(input: {
    patientId: string;
    conditionCode?: string | null;
    codingSystem?: string | null;
    conditionName: string;
    clinicalStatus?: PatientConditionStatus;
    onsetDate?: string | null;
    abatementDate?: string | null;
    notes?: string | null;
  }) {
    const result = await db.query(
      `
        INSERT INTO patient_conditions (
          patient_id,
          condition_code,
          coding_system,
          condition_name,
          clinical_status,
          onset_date,
          abatement_date,
          notes
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
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
      [
        input.patientId,
        input.conditionCode ?? null,
        input.codingSystem ?? null,
        input.conditionName,
        input.clinicalStatus ?? 'active',
        input.onsetDate ?? null,
        input.abatementDate ?? null,
        input.notes ?? null,
      ]
    );

    return result.rows[0];
  };
}

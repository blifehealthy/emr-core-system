import type { PatientMedicationStatus } from '../api/types.ts';

export function createPatientMedication(db: {
  query: <T = unknown>(sql: string, params?: unknown[]) => Promise<{ rows: T[] }>;
}) {
  return async function run(input: {
    patientId: string;
    prescribedByPractitionerId?: string | null;
    medicationName: string;
    rxnormCode?: string | null;
    dosage?: string | null;
    route?: string | null;
    frequency?: string | null;
    instructions?: string | null;
    status?: PatientMedicationStatus;
    startDate?: string | null;
    endDate?: string | null;
    notes?: string | null;
  }) {
    const result = await db.query(
      `
        INSERT INTO patient_medications (
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
          notes
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
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
      [
        input.patientId,
        input.prescribedByPractitionerId ?? null,
        input.medicationName,
        input.rxnormCode ?? null,
        input.dosage ?? null,
        input.route ?? null,
        input.frequency ?? null,
        input.instructions ?? null,
        input.status ?? 'active',
        input.startDate ?? null,
        input.endDate ?? null,
        input.notes ?? null,
      ]
    );

    return result.rows[0];
  };
}

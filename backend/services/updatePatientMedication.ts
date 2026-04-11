import type { PatientMedicationStatus } from '../api/types.ts';

export function updatePatientMedication(db: {
  query: <T = unknown>(sql: string, params?: unknown[]) => Promise<{ rows: T[] }>;
}) {
  return async function run(input: {
    medicationId: string;
    prescribedByPractitionerId?: string | null;
    medicationName?: string;
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
    const assignments: string[] = [];
    const params: unknown[] = [input.medicationId];

    if (Object.hasOwn(input, 'prescribedByPractitionerId')) {
      params.push(input.prescribedByPractitionerId ?? null);
      assignments.push(`prescribed_by_practitioner_id = $${params.length}`);
    }

    if (Object.hasOwn(input, 'medicationName')) {
      params.push(input.medicationName ?? null);
      assignments.push(`medication_name = $${params.length}`);
    }

    if (Object.hasOwn(input, 'rxnormCode')) {
      params.push(input.rxnormCode ?? null);
      assignments.push(`rxnorm_code = $${params.length}`);
    }

    if (Object.hasOwn(input, 'dosage')) {
      params.push(input.dosage ?? null);
      assignments.push(`dosage = $${params.length}`);
    }

    if (Object.hasOwn(input, 'route')) {
      params.push(input.route ?? null);
      assignments.push(`route = $${params.length}`);
    }

    if (Object.hasOwn(input, 'frequency')) {
      params.push(input.frequency ?? null);
      assignments.push(`frequency = $${params.length}`);
    }

    if (Object.hasOwn(input, 'instructions')) {
      params.push(input.instructions ?? null);
      assignments.push(`instructions = $${params.length}`);
    }

    if (Object.hasOwn(input, 'status')) {
      params.push(input.status ?? null);
      assignments.push(`status = $${params.length}`);
    }

    if (Object.hasOwn(input, 'startDate')) {
      params.push(input.startDate ?? null);
      assignments.push(`start_date = $${params.length}`);
    }

    if (Object.hasOwn(input, 'endDate')) {
      params.push(input.endDate ?? null);
      assignments.push(`end_date = $${params.length}`);
    }

    if (Object.hasOwn(input, 'notes')) {
      params.push(input.notes ?? null);
      assignments.push(`notes = $${params.length}`);
    }

    const result = await db.query(
      `
        UPDATE patient_medications
        SET ${assignments.join(',\n            ')}
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
      params
    );

    return result.rows[0] ?? null;
  };
}

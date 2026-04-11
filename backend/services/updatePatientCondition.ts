import type { PatientConditionStatus } from '../api/types.ts';

export function updatePatientCondition(db: {
  query: <T = unknown>(sql: string, params?: unknown[]) => Promise<{ rows: T[] }>;
}) {
  return async function run(input: {
    conditionId: string;
    conditionCode?: string | null;
    codingSystem?: string | null;
    conditionName?: string;
    clinicalStatus?: PatientConditionStatus;
    onsetDate?: string | null;
    abatementDate?: string | null;
    notes?: string | null;
  }) {
    const assignments: string[] = [];
    const params: unknown[] = [input.conditionId];

    if (Object.hasOwn(input, 'conditionCode')) {
      params.push(input.conditionCode ?? null);
      assignments.push(`condition_code = $${params.length}`);
    }

    if (Object.hasOwn(input, 'codingSystem')) {
      params.push(input.codingSystem ?? null);
      assignments.push(`coding_system = $${params.length}`);
    }

    if (Object.hasOwn(input, 'conditionName')) {
      params.push(input.conditionName ?? null);
      assignments.push(`condition_name = $${params.length}`);
    }

    if (Object.hasOwn(input, 'clinicalStatus')) {
      params.push(input.clinicalStatus ?? null);
      assignments.push(`clinical_status = $${params.length}`);
    }

    if (Object.hasOwn(input, 'onsetDate')) {
      params.push(input.onsetDate ?? null);
      assignments.push(`onset_date = $${params.length}`);
    }

    if (Object.hasOwn(input, 'abatementDate')) {
      params.push(input.abatementDate ?? null);
      assignments.push(`abatement_date = $${params.length}`);
    }

    if (Object.hasOwn(input, 'notes')) {
      params.push(input.notes ?? null);
      assignments.push(`notes = $${params.length}`);
    }

    const result = await db.query(
      `
        UPDATE patient_conditions
        SET ${assignments.join(',\n            ')}
        WHERE id = $1
          AND deleted_at IS NULL
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
      params
    );

    return result.rows[0] ?? null;
  };
}

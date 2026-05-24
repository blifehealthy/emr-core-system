import type { PatientFlagSeverity, PatientFlagStatus } from '../api/types.ts';

export function updatePatientFlag(db: {
  query: <T = unknown>(sql: string, params?: unknown[]) => Promise<{ rows: T[] }>;
}) {
  return async function run(input: {
    flagId: string;
    flagType?: string;
    label?: string;
    description?: string | null;
    severity?: PatientFlagSeverity;
    status?: PatientFlagStatus;
    source?: string | null;
    startsAt?: string | null;
    endsAt?: string | null;
    notes?: string | null;
  }) {
    const assignments: string[] = [];
    const params: unknown[] = [input.flagId];

    if (Object.hasOwn(input, 'flagType')) {
      params.push(input.flagType ?? null);
      assignments.push(`flag_type = $${params.length}`);
    }

    if (Object.hasOwn(input, 'label')) {
      params.push(input.label ?? null);
      assignments.push(`label = $${params.length}`);
    }

    if (Object.hasOwn(input, 'description')) {
      params.push(input.description ?? null);
      assignments.push(`description = $${params.length}`);
    }

    if (Object.hasOwn(input, 'severity')) {
      params.push(input.severity ?? null);
      assignments.push(`severity = $${params.length}`);
    }

    if (Object.hasOwn(input, 'status')) {
      params.push(input.status ?? null);
      assignments.push(`status = $${params.length}`);
    }

    if (Object.hasOwn(input, 'source')) {
      params.push(input.source ?? null);
      assignments.push(`source = $${params.length}`);
    }

    if (Object.hasOwn(input, 'startsAt')) {
      params.push(input.startsAt ?? null);
      assignments.push(`starts_at = $${params.length}`);
    }

    if (Object.hasOwn(input, 'endsAt')) {
      params.push(input.endsAt ?? null);
      assignments.push(`ends_at = $${params.length}`);
    }

    if (Object.hasOwn(input, 'notes')) {
      params.push(input.notes ?? null);
      assignments.push(`notes = $${params.length}`);
    }

    const result = await db.query(
      `
        UPDATE patient_flags
        SET ${assignments.join(',\n            ')}
        WHERE id = $1
          AND deleted_at IS NULL
        RETURNING
          id,
          patient_id,
          flag_type,
          label,
          description,
          severity,
          status,
          source,
          starts_at,
          ends_at,
          created_by_user_id,
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

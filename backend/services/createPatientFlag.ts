import type { PatientFlagSeverity, PatientFlagStatus } from '../api/types.ts';

export function createPatientFlag(db: {
  query: <T = unknown>(sql: string, params?: unknown[]) => Promise<{ rows: T[] }>;
}) {
  return async function run(input: {
    patientId: string;
    flagType: string;
    label: string;
    description?: string | null;
    severity?: PatientFlagSeverity;
    status?: PatientFlagStatus;
    source?: string | null;
    startsAt?: string | null;
    endsAt?: string | null;
    createdByUserId?: string | null;
    notes?: string | null;
  }) {
    const result = await db.query(
      `
        INSERT INTO patient_flags (
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
          notes
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
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
      [
        input.patientId,
        input.flagType,
        input.label,
        input.description ?? null,
        input.severity ?? 'caution',
        input.status ?? 'active',
        input.source ?? null,
        input.startsAt ?? null,
        input.endsAt ?? null,
        input.createdByUserId ?? null,
        input.notes ?? null,
      ]
    );

    return result.rows[0];
  };
}

import type { PatientFlagSeverity, PatientFlagStatus } from '../api/types.ts';

export function listPatientFlags(db: {
  query: <T = unknown>(sql: string, params?: unknown[]) => Promise<{ rows: T[] }>;
}) {
  return async function run(input: {
    patientId: string;
    status?: PatientFlagStatus;
    severity?: PatientFlagSeverity;
  }) {
    const conditions = ['patient_id = $1', 'deleted_at IS NULL'];
    const params: unknown[] = [input.patientId];

    if (input.status) {
      params.push(input.status);
      conditions.push(`status = $${params.length}`);
    }

    if (input.severity) {
      params.push(input.severity);
      conditions.push(`severity = $${params.length}`);
    }

    const result = await db.query(
      `
        SELECT
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
        FROM patient_flags
        WHERE ${conditions.join('\n          AND ')}
        ORDER BY created_at DESC
      `,
      params
    );

    return result.rows;
  };
}

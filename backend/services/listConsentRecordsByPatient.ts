import type { ConsentStatus } from '../api/types.ts';

export function listConsentRecordsByPatient(db: {
  query: <T = unknown>(sql: string, params?: unknown[]) => Promise<{ rows: T[] }>;
}) {
  return async function run(input: { patientId: string; status?: ConsentStatus }) {
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
          clinic_id,
          patient_id,
          consent_type,
          status,
          granted_at,
          revoked_at,
          expires_at,
          captured_by_user_id,
          document_reference,
          notes,
          created_at,
          updated_at,
          deleted_at
        FROM consent_records
        WHERE ${conditions.join('\n          AND ')}
        ORDER BY created_at DESC
      `,
      params
    );

    return result.rows;
  };
}

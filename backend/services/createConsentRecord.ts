import type { ConsentStatus } from '../api/types.ts';

export function createConsentRecord(db: {
  query: <T = unknown>(sql: string, params?: unknown[]) => Promise<{ rows: T[] }>;
}) {
  return async function run(input: {
    clinicId: string;
    patientId: string;
    consentType: string;
    status?: ConsentStatus;
    grantedAt?: string | null;
    revokedAt?: string | null;
    expiresAt?: string | null;
    capturedByUserId?: string | null;
    documentReference?: string | null;
    notes?: string | null;
  }) {
    const result = await db.query(
      `
        INSERT INTO consent_records (
          clinic_id,
          patient_id,
          consent_type,
          status,
          granted_at,
          revoked_at,
          expires_at,
          captured_by_user_id,
          document_reference,
          notes
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING
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
      `,
      [
        input.clinicId,
        input.patientId,
        input.consentType,
        input.status ?? 'granted',
        input.grantedAt ?? null,
        input.revokedAt ?? null,
        input.expiresAt ?? null,
        input.capturedByUserId ?? null,
        input.documentReference ?? null,
        input.notes ?? null,
      ]
    );

    return result.rows[0];
  };
}

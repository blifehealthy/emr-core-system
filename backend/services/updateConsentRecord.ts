import type { ConsentStatus } from '../api/types.ts';

export function updateConsentRecord(db: {
  query: <T = unknown>(sql: string, params?: unknown[]) => Promise<{ rows: T[] }>;
}) {
  return async function run(input: {
    consentId: string;
    consentType?: string;
    status?: ConsentStatus;
    grantedAt?: string | null;
    revokedAt?: string | null;
    expiresAt?: string | null;
    capturedByUserId?: string | null;
    documentReference?: string | null;
    notes?: string | null;
  }) {
    const assignments: string[] = [];
    const params: unknown[] = [input.consentId];

    if (Object.hasOwn(input, 'consentType')) {
      params.push(input.consentType ?? null);
      assignments.push(`consent_type = $${params.length}`);
    }

    if (Object.hasOwn(input, 'status')) {
      params.push(input.status ?? null);
      assignments.push(`status = $${params.length}`);
    }

    if (Object.hasOwn(input, 'grantedAt')) {
      params.push(input.grantedAt ?? null);
      assignments.push(`granted_at = $${params.length}`);
    }

    if (Object.hasOwn(input, 'revokedAt')) {
      params.push(input.revokedAt ?? null);
      assignments.push(`revoked_at = $${params.length}`);
    }

    if (Object.hasOwn(input, 'expiresAt')) {
      params.push(input.expiresAt ?? null);
      assignments.push(`expires_at = $${params.length}`);
    }

    if (Object.hasOwn(input, 'capturedByUserId')) {
      params.push(input.capturedByUserId ?? null);
      assignments.push(`captured_by_user_id = $${params.length}`);
    }

    if (Object.hasOwn(input, 'documentReference')) {
      params.push(input.documentReference ?? null);
      assignments.push(`document_reference = $${params.length}`);
    }

    if (Object.hasOwn(input, 'notes')) {
      params.push(input.notes ?? null);
      assignments.push(`notes = $${params.length}`);
    }

    const result = await db.query(
      `
        UPDATE consent_records
        SET ${assignments.join(',\n            ')}
        WHERE id = $1
          AND deleted_at IS NULL
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
      params
    );

    return result.rows[0] ?? null;
  };
}

export function getConsentRecordById(db: {
  query: <T = unknown>(sql: string, params?: unknown[]) => Promise<{ rows: T[] }>;
}) {
  return async function run(input: { consentId: string }) {
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
        WHERE id = $1
          AND deleted_at IS NULL
      `,
      [input.consentId]
    );

    return result.rows[0] ?? null;
  };
}

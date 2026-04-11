export function signClinicalNote(db: {
  query: <T = unknown>(sql: string, params?: unknown[]) => Promise<{ rows: T[] }>;
}) {
  return async function run(input: {
    clinicalNoteId: string;
    signedAt?: string | null;
    authoredByPractitionerId?: string | null;
  }) {
    const result = await db.query<{
      id: string;
      status: string;
      signed_at: string | null;
      authored_by_practitioner_id: string | null;
      updated_at: string;
    }>(
      `
        UPDATE clinical_notes
        SET status = 'final',
            signed_at = COALESCE($2, NOW()),
            authored_by_practitioner_id = COALESCE($3, authored_by_practitioner_id)
        WHERE id = $1
          AND deleted_at IS NULL
        RETURNING *
      `,
      [input.clinicalNoteId, input.signedAt ?? null, input.authoredByPractitionerId ?? null]
    );

    return result.rows[0] ?? null;
  };
}

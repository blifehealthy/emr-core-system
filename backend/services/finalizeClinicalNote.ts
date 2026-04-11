export function finalizeClinicalNote(db: {
  query: <T = unknown>(sql: string, params?: unknown[]) => Promise<{ rows: T[] }>;
}) {
  return async function run(input: {
    clinicalNoteId: string;
    finalizedAt?: string | null;
  }) {
    const result = await db.query<{
      id: string;
      status: string;
      finalized_at: string | null;
      updated_at: string;
    }>(
      `
        UPDATE clinical_notes
        SET status = 'final',
            finalized_at = COALESCE($2, NOW())
        WHERE id = $1
          AND deleted_at IS NULL
        RETURNING *
      `,
      [input.clinicalNoteId, input.finalizedAt ?? null]
    );

    return result.rows[0] ?? null;
  };
}

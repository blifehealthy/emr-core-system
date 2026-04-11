export function softDeleteSoapNote(db: {
  query: <T = unknown>(sql: string, params?: unknown[]) => Promise<{ rows: T[] }>;
}) {
  return async function run(input: { clinicalNoteId: string }) {
    const result = await db.query(
      `
        UPDATE soap_notes
        SET deleted_at = COALESCE(deleted_at, NOW())
        WHERE clinical_note_id = $1
          AND deleted_at IS NULL
        RETURNING *
      `,
      [input.clinicalNoteId]
    );

    return result.rows[0] ?? null;
  };
}

export function getSoapNoteByClinicalNoteId(db: {
  query: <T = unknown>(sql: string, params?: unknown[]) => Promise<{ rows: T[] }>;
}) {
  return async function run(input: { clinicalNoteId: string }) {
    const result = await db.query(
      `
        SELECT
          clinical_note_id,
          subjective,
          objective,
          assessment,
          plan,
          created_at,
          updated_at,
          deleted_at
        FROM soap_notes
        WHERE clinical_note_id = $1
          AND deleted_at IS NULL
      `,
      [input.clinicalNoteId]
    );

    return result.rows[0] ?? null;
  };
}

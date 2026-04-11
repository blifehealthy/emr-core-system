export function updateSoapNote(db: {
  query: <T = unknown>(sql: string, params?: unknown[]) => Promise<{ rows: T[] }>;
}) {
  return async function run(input: {
    clinicalNoteId: string;
    subjective?: string | null;
    objective?: string | null;
    assessment?: string | null;
    plan?: string | null;
  }) {
    const result = await db.query<{
      clinical_note_id: string;
      subjective: string | null;
      objective: string | null;
      assessment: string | null;
      plan: string | null;
      created_at: string;
      updated_at: string;
    }>(
      `
        UPDATE soap_notes
        SET subjective = COALESCE($2, subjective),
            objective = COALESCE($3, objective),
            assessment = COALESCE($4, assessment),
            plan = COALESCE($5, plan)
        WHERE clinical_note_id = $1
          AND deleted_at IS NULL
        RETURNING *
      `,
      [
        input.clinicalNoteId,
        input.subjective ?? null,
        input.objective ?? null,
        input.assessment ?? null,
        input.plan ?? null,
      ]
    );

    return result.rows[0] ?? null;
  };
}

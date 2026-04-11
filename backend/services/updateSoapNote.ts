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
    const assignments: string[] = [];
    const params: unknown[] = [input.clinicalNoteId];

    if (Object.hasOwn(input, 'subjective')) {
      params.push(input.subjective ?? null);
      assignments.push(`subjective = $${params.length}`);
    }

    if (Object.hasOwn(input, 'objective')) {
      params.push(input.objective ?? null);
      assignments.push(`objective = $${params.length}`);
    }

    if (Object.hasOwn(input, 'assessment')) {
      params.push(input.assessment ?? null);
      assignments.push(`assessment = $${params.length}`);
    }

    if (Object.hasOwn(input, 'plan')) {
      params.push(input.plan ?? null);
      assignments.push(`plan = $${params.length}`);
    }

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
        SET ${assignments.join(',\n            ')}
        WHERE clinical_note_id = $1
          AND deleted_at IS NULL
        RETURNING *
      `,
      params
    );

    return result.rows[0] ?? null;
  };
}

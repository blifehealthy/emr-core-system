export function listDiagnosesByEncounter(db: {
  query: <T = unknown>(sql: string, params?: unknown[]) => Promise<{ rows: T[] }>;
}) {
  return async function run(input: {
    encounterId: string;
    clinicalNoteId?: string;
    status?: 'active' | 'resolved' | 'entered_in_error';
    limit?: number;
    offset?: number;
  }) {
    const effectiveLimit = input.limit ?? 50;
    const effectiveOffset = input.offset ?? 0;
    const conditions = ['encounter_id = $1', 'deleted_at IS NULL'];
    const params: unknown[] = [input.encounterId];

    if (input.clinicalNoteId !== undefined) {
      params.push(input.clinicalNoteId);
      conditions.push(`clinical_note_id = $${params.length}`);
    }

    if (input.status !== undefined) {
      params.push(input.status);
      conditions.push(`status = $${params.length}`);
    }

    params.push(effectiveLimit + 1);
    const limitParamIndex = params.length;
    params.push(effectiveOffset);
    const offsetParamIndex = params.length;

    const result = await db.query(
      `
        SELECT
          id,
          encounter_id,
          clinical_note_id,
          diagnosis_code,
          coding_system,
          diagnosis_name,
          diagnosis_type,
          status,
          sequence_number,
          diagnosed_at,
          resolution_note,
          notes,
          created_at,
          updated_at,
          deleted_at
        FROM diagnoses
        WHERE ${conditions.join('\n          AND ')}
        ORDER BY sequence_number ASC NULLS LAST, created_at DESC
        LIMIT $${limitParamIndex}
        OFFSET $${offsetParamIndex}
      `,
      params
    );

    const hasMore = result.rows.length > effectiveLimit;
    const rows = hasMore ? result.rows.slice(0, effectiveLimit) : result.rows;

    return {
      rows,
      meta: {
        limit: effectiveLimit,
        offset: effectiveOffset,
        hasMore,
        nextOffset: hasMore ? effectiveOffset + effectiveLimit : null,
      },
    };
  };
}

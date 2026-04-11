export function listPrescriptionsByEncounter(db: {
  query: <T = unknown>(sql: string, params?: unknown[]) => Promise<{ rows: T[] }>;
}) {
  return async function run(input: {
    encounterId: string;
    clinicalNoteId?: string;
    status?: 'active' | 'completed' | 'cancelled';
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
          prescribed_by_practitioner_id,
          medication_name,
          rxnorm_code,
          dosage,
          route,
          frequency,
          duration_text,
          instructions,
          status,
          start_date,
          end_date,
          created_at,
          updated_at,
          deleted_at
        FROM prescriptions
        WHERE ${conditions.join('\n          AND ')}
        ORDER BY created_at DESC
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

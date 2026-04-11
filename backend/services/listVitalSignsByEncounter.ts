export function listVitalSignsByEncounter(db: {
  query: <T = unknown>(sql: string, params?: unknown[]) => Promise<{ rows: T[] }>;
}) {
  return async function run(input: {
    encounterId: string;
    clinicalNoteId?: string;
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
          measured_at,
          measured_by_practitioner_id,
          body_temperature_c,
          heart_rate_bpm,
          respiratory_rate_bpm,
          systolic_bp_mmhg,
          diastolic_bp_mmhg,
          oxygen_saturation_pct,
          weight_kg,
          height_cm,
          bmi,
          pain_score,
          notes,
          created_at,
          updated_at,
          deleted_at
        FROM vital_signs
        WHERE ${conditions.join('\n          AND ')}
        ORDER BY measured_at DESC, created_at DESC
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

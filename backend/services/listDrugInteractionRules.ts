export function listDrugInteractionRules(db: {
  query: <T = unknown>(sql: string, params?: unknown[]) => Promise<{ rows: T[] }>;
}) {
  return async function run(input: {
    clinicId: string;
    active?: 'active' | 'inactive' | 'all';
    limit?: number;
    offset?: number;
  }) {
    const effectiveLimit = input.limit ?? 50;
    const effectiveOffset = input.offset ?? 0;
    const conditions = ['clinic_id = $1', 'deleted_at IS NULL'];
    const params: unknown[] = [input.clinicId];

    if (input.active === 'active') {
      conditions.push('is_active IS TRUE');
    } else if (input.active === 'inactive') {
      conditions.push('is_active IS FALSE');
    }

    params.push(effectiveLimit + 1);
    const limitParamIndex = params.length;
    params.push(effectiveOffset);
    const offsetParamIndex = params.length;

    const result = await db.query(
      `
        SELECT
          id,
          clinic_id,
          primary_drug_catalog_id,
          interacting_drug_catalog_id,
          primary_rxnorm_code,
          interacting_rxnorm_code,
          primary_medication_name,
          interacting_medication_name,
          severity,
          description,
          recommendation,
          is_active,
          created_at,
          updated_at,
          deleted_at
        FROM drug_interaction_rules
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

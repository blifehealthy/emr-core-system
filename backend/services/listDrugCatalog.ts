export function listDrugCatalog(db: {
  query: <T = unknown>(sql: string, params?: unknown[]) => Promise<{ rows: T[] }>;
}) {
  return async function run(input: {
    clinicId: string;
    search?: string;
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

    if (input.search !== undefined) {
      params.push(`%${input.search}%`);
      conditions.push(`(
        medication_name ILIKE $${params.length}
        OR generic_name ILIKE $${params.length}
        OR rxnorm_code ILIKE $${params.length}
        OR array_to_string(allergen_tags, ' ') ILIKE $${params.length}
      )`);
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
          medication_name,
          rxnorm_code,
          generic_name,
          strength,
          dosage_form,
          route,
          allergen_tags,
          is_active,
          created_at,
          updated_at,
          deleted_at
        FROM drug_catalog
        WHERE ${conditions.join('\n          AND ')}
        ORDER BY medication_name ASC, created_at DESC
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

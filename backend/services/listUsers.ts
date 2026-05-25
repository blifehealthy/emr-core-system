export function listUsers(db: {
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
        username ILIKE $${params.length}
        OR display_name ILIKE $${params.length}
        OR role::text ILIKE $${params.length}
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
          username,
          display_name,
          role,
          oidc_subject,
          last_login_at,
          failed_login_count,
          locked_until,
          is_active,
          created_at,
          updated_at,
          deleted_at
        FROM users
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

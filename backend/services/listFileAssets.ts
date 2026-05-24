export function listFileAssets(db: {
  query: <T = unknown>(sql: string, params?: unknown[]) => Promise<{ rows: T[] }>;
}) {
  return async function run(input: {
    clinicId: string;
    search?: string;
    limit?: number;
    offset?: number;
  }) {
    const effectiveLimit = input.limit ?? 50;
    const effectiveOffset = input.offset ?? 0;
    const conditions = ['clinic_id = $1', 'deleted_at IS NULL'];
    const params: unknown[] = [input.clinicId];

    if (input.search !== undefined) {
      params.push(`%${input.search}%`);
      conditions.push(`(
        storage_key ILIKE $${params.length}
        OR original_filename ILIKE $${params.length}
        OR COALESCE(mime_type, '') ILIKE $${params.length}
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
          storage_key,
          original_filename,
          mime_type,
          byte_size,
          checksum_sha256,
          uploaded_by_user_id,
          created_at,
          updated_at,
          deleted_at
        FROM file_assets
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

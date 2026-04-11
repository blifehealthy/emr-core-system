export function getFileAssetById(db: {
  query: <T = unknown>(sql: string, params?: unknown[]) => Promise<{ rows: T[] }>;
}) {
  return async function run(input: { fileAssetId: string }) {
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
        WHERE id = $1
          AND deleted_at IS NULL
      `,
      [input.fileAssetId]
    );

    return result.rows[0] ?? null;
  };
}

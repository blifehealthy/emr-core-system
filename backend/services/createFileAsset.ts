export function createFileAsset(db: {
  query: <T = unknown>(sql: string, params?: unknown[]) => Promise<{ rows: T[] }>;
}) {
  return async function run(input: {
    clinicId: string;
    storageKey: string;
    originalFilename: string;
    mimeType?: string | null;
    byteSize: number;
    checksumSha256?: string | null;
    uploadedByUserId?: string | null;
  }) {
    const result = await db.query(
      `
        INSERT INTO file_assets (
          clinic_id,
          storage_key,
          original_filename,
          mime_type,
          byte_size,
          checksum_sha256,
          uploaded_by_user_id
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING
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
      `,
      [
        input.clinicId,
        input.storageKey,
        input.originalFilename,
        input.mimeType ?? null,
        input.byteSize,
        input.checksumSha256 ?? null,
        input.uploadedByUserId ?? null,
      ]
    );

    return result.rows[0];
  };
}

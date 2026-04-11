import type { AttachmentTargetType } from '../api/types.ts';

export function listAttachmentsByTarget(db: {
  query: <T = unknown>(sql: string, params?: unknown[]) => Promise<{ rows: T[] }>;
}) {
  return async function run(input: {
    targetType: AttachmentTargetType;
    targetId: string;
  }) {
    const result = await db.query(
      `
        SELECT
          al.id,
          al.file_asset_id,
          al.target_type,
          al.target_id,
          al.label,
          al.created_at,
          al.updated_at,
          al.deleted_at,
          fa.clinic_id,
          fa.storage_key,
          fa.original_filename,
          fa.mime_type,
          fa.byte_size,
          fa.checksum_sha256,
          fa.uploaded_by_user_id
        FROM attachment_links al
        INNER JOIN file_assets fa
          ON fa.id = al.file_asset_id
         AND fa.deleted_at IS NULL
        WHERE al.target_type = $1
          AND al.target_id = $2
          AND al.deleted_at IS NULL
        ORDER BY al.created_at DESC
      `,
      [input.targetType, input.targetId]
    );

    return result.rows;
  };
}

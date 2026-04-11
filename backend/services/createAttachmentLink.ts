import type { AttachmentTargetType } from '../api/types.ts';

export function createAttachmentLink(db: {
  query: <T = unknown>(sql: string, params?: unknown[]) => Promise<{ rows: T[] }>;
}) {
  return async function run(input: {
    fileAssetId: string;
    targetType: AttachmentTargetType;
    targetId: string;
    label?: string | null;
  }) {
    const result = await db.query(
      `
        INSERT INTO attachment_links (
          file_asset_id,
          target_type,
          target_id,
          label
        )
        VALUES ($1, $2, $3, $4)
        RETURNING
          id,
          file_asset_id,
          target_type,
          target_id,
          label,
          created_at,
          updated_at,
          deleted_at
      `,
      [input.fileAssetId, input.targetType, input.targetId, input.label ?? null]
    );

    return result.rows[0];
  };
}

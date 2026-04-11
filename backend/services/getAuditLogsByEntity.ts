export function getAuditLogsByEntity(db: {
  query: <T = unknown>(sql: string, params?: unknown[]) => Promise<{ rows: T[] }>;
}) {
  return async function run(input: {
    entityType: string;
    entityId: string;
    limit?: number;
  }) {
    const result = await db.query<{
      id: string;
      entity_type: string;
      entity_id: string;
      action: string;
      actor_user_id: string | null;
      actor_practitioner_id: string | null;
      metadata: Record<string, unknown>;
      created_at: string;
    }>(
      `
        SELECT *
        FROM audit_logs
        WHERE entity_type = $1
          AND entity_id = $2
        ORDER BY created_at DESC
        LIMIT $3
      `,
      [input.entityType, input.entityId, input.limit ?? 50]
    );

    return result.rows;
  };
}

export function createAuditLog(db: {
  query: <T = unknown>(sql: string, params?: unknown[]) => Promise<{ rows: T[] }>;
}) {
  return async function run(input: {
    entityType: string;
    entityId: string;
    action: string;
    actorUserId?: string | null;
    actorPractitionerId?: string | null;
    metadata?: Record<string, unknown>;
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
        INSERT INTO audit_logs (
          entity_type,
          entity_id,
          action,
          actor_user_id,
          actor_practitioner_id,
          metadata
        )
        VALUES ($1, $2, $3, $4, $5, $6::jsonb)
        RETURNING *
      `,
      [
        input.entityType,
        input.entityId,
        input.action,
        input.actorUserId ?? null,
        input.actorPractitionerId ?? null,
        JSON.stringify(input.metadata ?? {}),
      ]
    );

    return result.rows[0];
  };
}

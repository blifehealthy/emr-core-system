import { buildPermissionOverrides } from './rolePermissions.ts';

export function resolveActor(db: {
  query: <T = unknown>(sql: string, params?: unknown[]) => Promise<{ rows: T[] }>;
}) {
  return async function run(input: { userId: string }) {
    const result = await db.query<{
      user_id: string;
      role: 'doctor' | 'nurse' | 'admin';
      practitioner_id: string | null;
      clinic_id: string;
      display_name: string;
      permission_overrides: Array<{ permission_key: string; is_allowed: boolean }> | null;
    }>(
      `
        SELECT
          u.id AS user_id,
          u.role,
          p.id AS practitioner_id,
          u.clinic_id,
          u.display_name,
          COALESCE(
            jsonb_agg(
              jsonb_build_object(
                'permission_key', rpo.permission_key,
                'is_allowed', rpo.is_allowed
              )
            ) FILTER (WHERE rpo.permission_key IS NOT NULL),
            '[]'::jsonb
          ) AS permission_overrides
        FROM users u
        LEFT JOIN practitioners p
          ON p.user_id = u.id
         AND p.deleted_at IS NULL
         AND p.is_active = TRUE
        LEFT JOIN role_permission_overrides rpo
          ON rpo.clinic_id = u.clinic_id
         AND rpo.role = u.role::text
         AND rpo.deleted_at IS NULL
        WHERE u.id = $1
          AND u.deleted_at IS NULL
          AND u.is_active = TRUE
        GROUP BY u.id, u.role, p.id, u.clinic_id, u.display_name
      `,
      [input.userId]
    );

    const actor = result.rows[0];
    if (!actor) return null;
    return {
      ...actor,
      permission_overrides: buildPermissionOverrides(actor.permission_overrides ?? []),
    };
  };
}

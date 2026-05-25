export function resolveOidcActor(db: {
  query: <T = unknown>(sql: string, params?: unknown[]) => Promise<{ rows: T[] }>;
}) {
  return async function run(input: { oidcSubject: string }) {
    const result = await db.query<{
      user_id: string;
      role: 'doctor' | 'nurse' | 'admin';
      practitioner_id: string | null;
      clinic_id: string;
      display_name: string;
    }>(
      `
        SELECT
          u.id AS user_id,
          u.role,
          p.id AS practitioner_id,
          u.clinic_id,
          u.display_name
        FROM users u
        LEFT JOIN practitioners p
          ON p.user_id = u.id
         AND p.deleted_at IS NULL
         AND p.is_active = TRUE
        WHERE u.oidc_subject = $1
          AND u.deleted_at IS NULL
          AND u.is_active = TRUE
      `,
      [input.oidcSubject]
    );

    return result.rows[0] ?? null;
  };
}

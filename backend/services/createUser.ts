export function createUser(db: {
  query: <T = unknown>(sql: string, params?: unknown[]) => Promise<{ rows: T[] }>;
}) {
  return async function run(input: {
    clinicId: string;
    username: string;
    displayName: string;
    role: 'doctor' | 'nurse' | 'admin';
    oidcSubject?: string | null;
  }) {
    const result = await db.query(
      `
        INSERT INTO users (clinic_id, username, display_name, role, oidc_subject)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING
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
      `,
      [input.clinicId, input.username, input.displayName, input.role, input.oidcSubject ?? null]
    );

    return result.rows[0];
  };
}

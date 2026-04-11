export function updateUser(db: {
  query: <T = unknown>(sql: string, params?: unknown[]) => Promise<{ rows: T[] }>;
}) {
  return async function run(input: {
    userId: string;
    displayName?: string;
    role?: 'doctor' | 'nurse' | 'admin';
    isActive?: boolean;
  }) {
    const result = await db.query(
      `
        UPDATE users
        SET display_name = COALESCE($2, display_name),
            role = COALESCE($3, role),
            is_active = COALESCE($4, is_active)
        WHERE id = $1
          AND deleted_at IS NULL
        RETURNING
          id,
          clinic_id,
          username,
          display_name,
          role,
          is_active,
          created_at,
          updated_at,
          deleted_at
      `,
      [input.userId, input.displayName ?? null, input.role ?? null, input.isActive ?? null]
    );

    return result.rows[0] ?? null;
  };
}

export function updateUser(db: {
  query: <T = unknown>(sql: string, params?: unknown[]) => Promise<{ rows: T[] }>;
}) {
  return async function run(input: {
    userId: string;
    displayName?: string;
    role?: 'doctor' | 'nurse' | 'admin';
    isActive?: boolean;
  }) {
    const assignments: string[] = [];
    const params: unknown[] = [input.userId];

    if (Object.hasOwn(input, 'displayName')) {
      params.push(input.displayName ?? null);
      assignments.push(`display_name = $${params.length}`);
    }

    if (Object.hasOwn(input, 'role')) {
      params.push(input.role ?? null);
      assignments.push(`role = $${params.length}`);
    }

    if (Object.hasOwn(input, 'isActive')) {
      params.push(input.isActive ?? null);
      assignments.push(`is_active = $${params.length}`);
    }

    const result = await db.query(
      `
        UPDATE users
        SET ${assignments.join(',\n            ')}
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
      params
    );

    return result.rows[0] ?? null;
  };
}

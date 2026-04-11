export function createUser(db: {
  query: <T = unknown>(sql: string, params?: unknown[]) => Promise<{ rows: T[] }>;
}) {
  return async function run(input: {
    clinicId: string;
    username: string;
    displayName: string;
    role: 'doctor' | 'nurse' | 'admin';
  }) {
    const result = await db.query(
      `
        INSERT INTO users (clinic_id, username, display_name, role)
        VALUES ($1, $2, $3, $4)
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
      [input.clinicId, input.username, input.displayName, input.role]
    );

    return result.rows[0];
  };
}

export function updatePractitioner(db: {
  query: <T = unknown>(sql: string, params?: unknown[]) => Promise<{ rows: T[] }>;
}) {
  return async function run(input: {
    practitionerId: string;
    userId?: string | null;
    firstName?: string;
    lastName?: string;
    licenseNumber?: string | null;
    specialty?: string | null;
    isActive?: boolean;
  }) {
    const result = await db.query(
      `
        UPDATE practitioners
        SET user_id = COALESCE($2, user_id),
            first_name = COALESCE($3, first_name),
            last_name = COALESCE($4, last_name),
            license_number = COALESCE($5, license_number),
            specialty = COALESCE($6, specialty),
            is_active = COALESCE($7, is_active)
        WHERE id = $1
          AND deleted_at IS NULL
        RETURNING *
      `,
      [
        input.practitionerId,
        input.userId ?? null,
        input.firstName ?? null,
        input.lastName ?? null,
        input.licenseNumber ?? null,
        input.specialty ?? null,
        input.isActive ?? null,
      ]
    );

    return result.rows[0] ?? null;
  };
}

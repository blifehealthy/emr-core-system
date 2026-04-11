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
    const assignments: string[] = [];
    const params: unknown[] = [input.practitionerId];

    if (Object.hasOwn(input, 'userId')) {
      params.push(input.userId ?? null);
      assignments.push(`user_id = $${params.length}`);
    }

    if (Object.hasOwn(input, 'firstName')) {
      params.push(input.firstName ?? null);
      assignments.push(`first_name = $${params.length}`);
    }

    if (Object.hasOwn(input, 'lastName')) {
      params.push(input.lastName ?? null);
      assignments.push(`last_name = $${params.length}`);
    }

    if (Object.hasOwn(input, 'licenseNumber')) {
      params.push(input.licenseNumber ?? null);
      assignments.push(`license_number = $${params.length}`);
    }

    if (Object.hasOwn(input, 'specialty')) {
      params.push(input.specialty ?? null);
      assignments.push(`specialty = $${params.length}`);
    }

    if (Object.hasOwn(input, 'isActive')) {
      params.push(input.isActive ?? null);
      assignments.push(`is_active = $${params.length}`);
    }

    const result = await db.query(
      `
        UPDATE practitioners
        SET ${assignments.join(',\n            ')}
        WHERE id = $1
          AND deleted_at IS NULL
        RETURNING *
      `,
      params
    );

    return result.rows[0] ?? null;
  };
}

export function createPractitioner(db: {
  query: <T = unknown>(sql: string, params?: unknown[]) => Promise<{ rows: T[] }>;
}) {
  return async function run(input: {
    clinicId: string;
    userId?: string | null;
    practitionerCode: string;
    firstName: string;
    lastName: string;
    licenseNumber?: string | null;
    specialty?: string | null;
  }) {
    const result = await db.query(
      `
        INSERT INTO practitioners (
          clinic_id,
          user_id,
          practitioner_code,
          first_name,
          last_name,
          license_number,
          specialty
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING
          id,
          clinic_id,
          user_id,
          practitioner_code,
          first_name,
          last_name,
          license_number,
          specialty,
          is_active,
          created_at,
          updated_at,
          deleted_at
      `,
      [
        input.clinicId,
        input.userId ?? null,
        input.practitionerCode,
        input.firstName,
        input.lastName,
        input.licenseNumber ?? null,
        input.specialty ?? null,
      ]
    );

    return result.rows[0];
  };
}

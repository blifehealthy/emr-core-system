export function getClinicSettings(db: {
  query: <T = unknown>(sql: string, params?: unknown[]) => Promise<{ rows: T[] }>;
}) {
  return async function run(input: { clinicId: string }) {
    const result = await db.query(
      `
        SELECT
          clinic_id,
          display_name,
          address,
          phone_number,
          email,
          website,
          logo_url,
          logo_file_asset_id,
          prescription_footer,
          created_at,
          updated_at,
          deleted_at
        FROM clinic_settings
        WHERE clinic_id = $1
          AND deleted_at IS NULL
      `,
      [input.clinicId]
    );

    return result.rows[0] ?? null;
  };
}

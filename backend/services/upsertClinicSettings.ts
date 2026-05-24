export function upsertClinicSettings(db: {
  query: <T = unknown>(sql: string, params?: unknown[]) => Promise<{ rows: T[] }>;
}) {
  return async function run(input: {
    clinicId: string;
    displayName: string;
    address?: string | null;
    phoneNumber?: string | null;
    email?: string | null;
    website?: string | null;
    logoUrl?: string | null;
    logoFileAssetId?: string | null;
    prescriptionFooter?: string | null;
  }) {
    const result = await db.query(
      `
        INSERT INTO clinic_settings (
          clinic_id,
          display_name,
          address,
          phone_number,
          email,
          website,
          logo_url,
          logo_file_asset_id,
          prescription_footer
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (clinic_id)
        DO UPDATE SET
          display_name = EXCLUDED.display_name,
          address = EXCLUDED.address,
          phone_number = EXCLUDED.phone_number,
          email = EXCLUDED.email,
          website = EXCLUDED.website,
          logo_url = EXCLUDED.logo_url,
          logo_file_asset_id = EXCLUDED.logo_file_asset_id,
          prescription_footer = EXCLUDED.prescription_footer,
          deleted_at = NULL
        RETURNING *
      `,
      [
        input.clinicId,
        input.displayName,
        input.address ?? null,
        input.phoneNumber ?? null,
        input.email ?? null,
        input.website ?? null,
        input.logoUrl ?? null,
        input.logoFileAssetId ?? null,
        input.prescriptionFooter ?? null,
      ]
    );

    return result.rows[0];
  };
}

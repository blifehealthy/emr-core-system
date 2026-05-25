export function createDrugCatalogItem(db: {
  query: <T = unknown>(sql: string, params?: unknown[]) => Promise<{ rows: T[] }>;
}) {
  return async function run(input: {
    clinicId: string;
    medicationName: string;
    rxnormCode?: string | null;
    genericName?: string | null;
    strength?: string | null;
    dosageForm?: string | null;
    route?: string | null;
    allergenTags?: string[];
    isActive?: boolean;
  }) {
    const result = await db.query(
      `
        INSERT INTO drug_catalog (
          clinic_id,
          medication_name,
          rxnorm_code,
          generic_name,
          strength,
          dosage_form,
          route,
          allergen_tags,
          is_active
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING
          id,
          clinic_id,
          medication_name,
          rxnorm_code,
          generic_name,
          strength,
          dosage_form,
          route,
          allergen_tags,
          is_active,
          created_at,
          updated_at,
          deleted_at
      `,
      [
        input.clinicId,
        input.medicationName,
        input.rxnormCode ?? null,
        input.genericName ?? null,
        input.strength ?? null,
        input.dosageForm ?? null,
        input.route ?? null,
        input.allergenTags ?? [],
        input.isActive ?? true,
      ]
    );

    return result.rows[0];
  };
}

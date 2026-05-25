export function updateDrugCatalogItem(db: {
  query: <T = unknown>(sql: string, params?: unknown[]) => Promise<{ rows: T[] }>;
}) {
  return async function run(input: {
    drugCatalogId: string;
    medicationName?: string;
    rxnormCode?: string | null;
    genericName?: string | null;
    strength?: string | null;
    dosageForm?: string | null;
    route?: string | null;
    allergenTags?: string[];
    isActive?: boolean;
  }) {
    const assignments: string[] = [];
    const params: unknown[] = [input.drugCatalogId];

    for (const [field, column] of [
      ['medicationName', 'medication_name'],
      ['rxnormCode', 'rxnorm_code'],
      ['genericName', 'generic_name'],
      ['strength', 'strength'],
      ['dosageForm', 'dosage_form'],
      ['route', 'route'],
      ['allergenTags', 'allergen_tags'],
      ['isActive', 'is_active'],
    ] as const) {
      if (Object.hasOwn(input, field)) {
        params.push(input[field] ?? null);
        assignments.push(`${column} = $${params.length}`);
      }
    }

    const result = await db.query(
      `
        UPDATE drug_catalog
        SET ${assignments.join(',\n            ')}
        WHERE id = $1
          AND deleted_at IS NULL
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
      params
    );

    return result.rows[0] ?? null;
  };
}

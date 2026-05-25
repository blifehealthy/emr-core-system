export function createDrugInteractionRule(db: {
  query: <T = unknown>(sql: string, params?: unknown[]) => Promise<{ rows: T[] }>;
}) {
  return async function run(input: {
    clinicId: string;
    primaryDrugCatalogId?: string | null;
    interactingDrugCatalogId?: string | null;
    primaryRxnormCode?: string | null;
    interactingRxnormCode?: string | null;
    primaryMedicationName?: string | null;
    interactingMedicationName?: string | null;
    severity?: 'info' | 'warning' | 'critical';
    description: string;
    recommendation?: string | null;
    isActive?: boolean;
  }) {
    const result = await db.query(
      `
        INSERT INTO drug_interaction_rules (
          clinic_id,
          primary_drug_catalog_id,
          interacting_drug_catalog_id,
          primary_rxnorm_code,
          interacting_rxnorm_code,
          primary_medication_name,
          interacting_medication_name,
          severity,
          description,
          recommendation,
          is_active
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *
      `,
      [
        input.clinicId,
        input.primaryDrugCatalogId ?? null,
        input.interactingDrugCatalogId ?? null,
        input.primaryRxnormCode ?? null,
        input.interactingRxnormCode ?? null,
        input.primaryMedicationName ?? null,
        input.interactingMedicationName ?? null,
        input.severity ?? 'warning',
        input.description,
        input.recommendation ?? null,
        input.isActive ?? true,
      ]
    );

    return result.rows[0];
  };
}

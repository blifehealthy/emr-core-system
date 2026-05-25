export function updateDrugInteractionRule(db: {
  query: <T = unknown>(sql: string, params?: unknown[]) => Promise<{ rows: T[] }>;
}) {
  return async function run(input: {
    interactionRuleId: string;
    primaryDrugCatalogId?: string | null;
    interactingDrugCatalogId?: string | null;
    primaryRxnormCode?: string | null;
    interactingRxnormCode?: string | null;
    primaryMedicationName?: string | null;
    interactingMedicationName?: string | null;
    severity?: 'info' | 'warning' | 'critical';
    description?: string;
    recommendation?: string | null;
    isActive?: boolean;
  }) {
    const assignments: string[] = [];
    const params: unknown[] = [input.interactionRuleId];

    for (const [field, column] of [
      ['primaryDrugCatalogId', 'primary_drug_catalog_id'],
      ['interactingDrugCatalogId', 'interacting_drug_catalog_id'],
      ['primaryRxnormCode', 'primary_rxnorm_code'],
      ['interactingRxnormCode', 'interacting_rxnorm_code'],
      ['primaryMedicationName', 'primary_medication_name'],
      ['interactingMedicationName', 'interacting_medication_name'],
      ['severity', 'severity'],
      ['description', 'description'],
      ['recommendation', 'recommendation'],
      ['isActive', 'is_active'],
    ] as const) {
      if (Object.hasOwn(input, field)) {
        params.push(input[field] ?? null);
        assignments.push(`${column} = $${params.length}`);
      }
    }

    const result = await db.query(
      `
        UPDATE drug_interaction_rules
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

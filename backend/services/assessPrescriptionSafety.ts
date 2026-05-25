type AllergyRow = {
  id: string;
  allergen_name: string;
  reaction?: string | null;
  severity?: string | null;
  criticality?: string | null;
};

type DrugRow = {
  id: string;
  medication_name: string;
  rxnorm_code?: string | null;
  generic_name?: string | null;
  allergen_tags?: string[] | null;
};

type PrescriptionSafetyWarning = {
  type: 'allergy';
  severity: 'critical' | 'warning';
  message: string;
  allergyId: string;
  allergenName: string;
  medicationName: string;
  matchedOn: string;
  reaction?: string | null;
};

function normalize(value: string | null | undefined): string {
  return (value ?? '').trim().toLowerCase();
}

function includesTerm(source: string, term: string): boolean {
  return term.length >= 3 && source.includes(term);
}

export function assessPrescriptionSafety(db: {
  query: <T = unknown>(sql: string, params?: unknown[]) => Promise<{ rows: T[] }>;
}) {
  return async function run(input: {
    patientId: string;
    medicationName: string;
    rxnormCode?: string | null;
    drugCatalogId?: string | null;
  }) {
    const [allergyResult, drugResult] = await Promise.all([
      db.query<AllergyRow>(
        `
          SELECT
            id,
            allergen_name,
            reaction,
            severity,
            criticality
          FROM patient_allergies
          WHERE patient_id = $1
            AND status = 'active'
            AND deleted_at IS NULL
        `,
        [input.patientId]
      ),
      db.query<DrugRow>(
        `
          SELECT
            id,
            medication_name,
            rxnorm_code,
            generic_name,
            allergen_tags
          FROM drug_catalog
          WHERE deleted_at IS NULL
            AND is_active IS TRUE
            AND (
              ($1::text IS NOT NULL AND id::text = $1::text)
              OR (
                $2::text IS NOT NULL
                AND rxnorm_code = $2::text
                AND clinic_id = (SELECT clinic_id FROM patients WHERE id = $3)
              )
            )
          ORDER BY
            CASE WHEN $1::text IS NOT NULL AND id::text = $1::text THEN 0 ELSE 1 END,
            created_at DESC
          LIMIT 1
        `,
        [input.drugCatalogId ?? null, input.rxnormCode ?? null, input.patientId]
      ),
    ]);

    const drug = drugResult.rows[0] ?? null;
    const medicationName = drug?.medication_name ?? input.medicationName;
    const searchableTerms = [
      input.medicationName,
      input.rxnormCode,
      drug?.medication_name,
      drug?.generic_name,
      drug?.rxnorm_code,
      ...(drug?.allergen_tags ?? []),
    ]
      .map(normalize)
      .filter(Boolean);

    const warnings: PrescriptionSafetyWarning[] = [];

    for (const allergy of allergyResult.rows) {
      const allergenName = normalize(allergy.allergen_name);
      const matchedOn = searchableTerms.find(
        (term) => includesTerm(term, allergenName) || includesTerm(allergenName, term)
      );

      if (!matchedOn) {
        continue;
      }

      const isCritical =
        normalize(allergy.severity) === 'severe' ||
        ['critical', 'high'].includes(normalize(allergy.criticality));
      warnings.push({
        type: 'allergy',
        severity: isCritical ? 'critical' : 'warning',
        message: `Patient has active allergy to ${allergy.allergen_name}`,
        allergyId: allergy.id,
        allergenName: allergy.allergen_name,
        medicationName,
        matchedOn,
        reaction: allergy.reaction ?? null,
      });
    }

    return {
      warnings,
      checkedAt: new Date().toISOString(),
      drugCatalogId: drug?.id ?? input.drugCatalogId ?? null,
    };
  };
}

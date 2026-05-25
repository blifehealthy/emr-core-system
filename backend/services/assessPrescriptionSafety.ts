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
  type: 'allergy' | 'interaction';
  severity: 'critical' | 'warning';
  message: string;
  allergyId?: string;
  allergenName?: string;
  medicationName: string;
  matchedOn: string;
  reaction?: string | null;
  interactionRuleId?: string;
  interactingMedicationName?: string;
  recommendation?: string | null;
};

type InteractionRuleRow = {
  id: string;
  primary_drug_catalog_id?: string | null;
  interacting_drug_catalog_id?: string | null;
  primary_rxnorm_code?: string | null;
  interacting_rxnorm_code?: string | null;
  primary_medication_name?: string | null;
  interacting_medication_name?: string | null;
  severity: 'info' | 'warning' | 'critical';
  description: string;
  recommendation?: string | null;
};

type ActiveMedicationRow = {
  source: 'medication' | 'prescription';
  id: string;
  drug_catalog_id?: string | null;
  medication_name: string;
  rxnorm_code?: string | null;
};

function normalize(value: string | null | undefined): string {
  return (value ?? '').trim().toLowerCase();
}

function includesTerm(source: string, term: string): boolean {
  return term.length >= 3 && source.includes(term);
}

function exactOrNamedMatch(terms: string[], idOrCode?: string | null, name?: string | null): boolean {
  const needle = normalize(idOrCode);
  if (needle && terms.includes(needle)) {
    return true;
  }

  const nameNeedle = normalize(name);
  return Boolean(nameNeedle && terms.some((term) => term === nameNeedle || includesTerm(term, nameNeedle)));
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
    const [allergyResult, drugResult, ruleResult, activeMedicationResult] = await Promise.all([
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
      db.query<InteractionRuleRow>(
        `
          SELECT
            id,
            primary_drug_catalog_id,
            interacting_drug_catalog_id,
            primary_rxnorm_code,
            interacting_rxnorm_code,
            primary_medication_name,
            interacting_medication_name,
            severity,
            description,
            recommendation
          FROM drug_interaction_rules
          WHERE clinic_id = (SELECT clinic_id FROM patients WHERE id = $1)
            AND is_active IS TRUE
            AND deleted_at IS NULL
        `,
        [input.patientId]
      ),
      db.query<ActiveMedicationRow>(
        `
          SELECT
            'medication' AS source,
            id,
            NULL::uuid AS drug_catalog_id,
            medication_name,
            rxnorm_code
          FROM patient_medications
          WHERE patient_id = $1
            AND status = 'active'
            AND deleted_at IS NULL
          UNION ALL
          SELECT
            'prescription' AS source,
            p.id,
            p.drug_catalog_id,
            p.medication_name,
            p.rxnorm_code
          FROM prescriptions p
          JOIN encounters e ON e.id = p.encounter_id
          WHERE e.patient_id = $1
            AND p.status = 'active'
            AND p.deleted_at IS NULL
        `,
        [input.patientId]
      ),
    ]);

    const drug = drugResult.rows[0] ?? null;
    const medicationName = drug?.medication_name ?? input.medicationName;
    const searchableTerms = [
      drug?.id,
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

    for (const rule of ruleResult.rows) {
      const candidatePrimaryMatch = exactOrNamedMatch(
        searchableTerms,
        rule.primary_drug_catalog_id ?? rule.primary_rxnorm_code,
        rule.primary_medication_name
      );
      const candidateInteractingMatch = exactOrNamedMatch(
        searchableTerms,
        rule.interacting_drug_catalog_id ?? rule.interacting_rxnorm_code,
        rule.interacting_medication_name
      );

      if (!candidatePrimaryMatch && !candidateInteractingMatch) {
        continue;
      }

      for (const activeMedication of activeMedicationResult.rows) {
        const activeTerms = [
          activeMedication.drug_catalog_id,
          activeMedication.rxnorm_code,
          activeMedication.medication_name,
        ]
          .map(normalize)
          .filter(Boolean);
        const activeMatches = candidatePrimaryMatch
          ? exactOrNamedMatch(
              activeTerms,
              rule.interacting_drug_catalog_id ?? rule.interacting_rxnorm_code,
              rule.interacting_medication_name
            )
          : exactOrNamedMatch(
              activeTerms,
              rule.primary_drug_catalog_id ?? rule.primary_rxnorm_code,
              rule.primary_medication_name
            );

        if (!activeMatches) {
          continue;
        }

        warnings.push({
          type: 'interaction',
          severity: rule.severity === 'critical' ? 'critical' : 'warning',
          message: rule.description,
          medicationName,
          matchedOn: activeMedication.medication_name,
          interactionRuleId: rule.id,
          interactingMedicationName: activeMedication.medication_name,
          recommendation: rule.recommendation ?? null,
        });
      }
    }

    return {
      warnings,
      checkedAt: new Date().toISOString(),
      drugCatalogId: drug?.id ?? input.drugCatalogId ?? null,
    };
  };
}

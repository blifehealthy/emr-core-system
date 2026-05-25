export function updatePrescription(db: {
  query: <T = unknown>(sql: string, params?: unknown[]) => Promise<{ rows: T[] }>;
}) {
  return async function run(input: {
    prescriptionId: string;
    prescribedByPractitionerId?: string | null;
    drugCatalogId?: string | null;
    medicationName?: string;
    rxnormCode?: string | null;
    dosage?: string | null;
    route?: string | null;
    frequency?: string | null;
    durationText?: string | null;
    instructions?: string | null;
    status?: 'active' | 'completed' | 'cancelled';
    startDate?: string | null;
    endDate?: string | null;
    safetyWarnings?: unknown[];
    safetyOverrideReason?: string | null;
    safetyOverriddenAt?: string | null;
    safetyOverriddenByUserId?: string | null;
    safetyOverriddenByPractitionerId?: string | null;
  }) {
    const assignments: string[] = [];
    const params: unknown[] = [input.prescriptionId];

    if (Object.hasOwn(input, 'prescribedByPractitionerId')) {
      params.push(input.prescribedByPractitionerId ?? null);
      assignments.push(`prescribed_by_practitioner_id = $${params.length}`);
    }

    if (Object.hasOwn(input, 'drugCatalogId')) {
      params.push(input.drugCatalogId ?? null);
      assignments.push(`drug_catalog_id = $${params.length}`);
    }

    if (Object.hasOwn(input, 'medicationName')) {
      params.push(input.medicationName ?? null);
      assignments.push(`medication_name = $${params.length}`);
    }

    if (Object.hasOwn(input, 'rxnormCode')) {
      params.push(input.rxnormCode ?? null);
      assignments.push(`rxnorm_code = $${params.length}`);
    }

    if (Object.hasOwn(input, 'dosage')) {
      params.push(input.dosage ?? null);
      assignments.push(`dosage = $${params.length}`);
    }

    if (Object.hasOwn(input, 'route')) {
      params.push(input.route ?? null);
      assignments.push(`route = $${params.length}`);
    }

    if (Object.hasOwn(input, 'frequency')) {
      params.push(input.frequency ?? null);
      assignments.push(`frequency = $${params.length}`);
    }

    if (Object.hasOwn(input, 'durationText')) {
      params.push(input.durationText ?? null);
      assignments.push(`duration_text = $${params.length}`);
    }

    if (Object.hasOwn(input, 'instructions')) {
      params.push(input.instructions ?? null);
      assignments.push(`instructions = $${params.length}`);
    }

    if (Object.hasOwn(input, 'status')) {
      params.push(input.status ?? null);
      assignments.push(`status = $${params.length}`);
    }

    if (Object.hasOwn(input, 'startDate')) {
      params.push(input.startDate ?? null);
      assignments.push(`start_date = $${params.length}`);
    }

    if (Object.hasOwn(input, 'endDate')) {
      params.push(input.endDate ?? null);
      assignments.push(`end_date = $${params.length}`);
    }

    if (Object.hasOwn(input, 'safetyWarnings')) {
      params.push(JSON.stringify(input.safetyWarnings ?? []));
      assignments.push(`safety_warnings = $${params.length}`);
    }

    if (Object.hasOwn(input, 'safetyOverrideReason')) {
      params.push(input.safetyOverrideReason ?? null);
      assignments.push(`safety_override_reason = $${params.length}`);
    }

    if (Object.hasOwn(input, 'safetyOverriddenAt')) {
      params.push(input.safetyOverriddenAt ?? null);
      assignments.push(`safety_overridden_at = $${params.length}`);
    }

    if (Object.hasOwn(input, 'safetyOverriddenByUserId')) {
      params.push(input.safetyOverriddenByUserId ?? null);
      assignments.push(`safety_overridden_by_user_id = $${params.length}`);
    }

    if (Object.hasOwn(input, 'safetyOverriddenByPractitionerId')) {
      params.push(input.safetyOverriddenByPractitionerId ?? null);
      assignments.push(`safety_overridden_by_practitioner_id = $${params.length}`);
    }

    const result = await db.query(
      `
        UPDATE prescriptions
        SET ${assignments.join(',\n            ')}
        WHERE id = $1
          AND deleted_at IS NULL
        RETURNING
          id,
          encounter_id,
          clinical_note_id,
          prescribed_by_practitioner_id,
          drug_catalog_id,
          medication_name,
          rxnorm_code,
          dosage,
          route,
          frequency,
          duration_text,
          instructions,
          status,
          start_date,
          end_date,
          safety_warnings,
          safety_override_reason,
          safety_overridden_at,
          safety_overridden_by_user_id,
          safety_overridden_by_practitioner_id,
          created_at,
          updated_at,
          deleted_at
      `,
      params
    );

    return result.rows[0] ?? null;
  };
}

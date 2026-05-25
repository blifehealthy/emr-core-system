export function createPrescription(db: {
  query: <T = unknown>(sql: string, params?: unknown[]) => Promise<{ rows: T[] }>;
}) {
  return async function run(input: {
    encounterId: string;
    clinicalNoteId?: string | null;
    prescribedByPractitionerId?: string | null;
    drugCatalogId?: string | null;
    medicationName: string;
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
  }) {
    const result = await db.query(
      `
        INSERT INTO prescriptions (
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
          safety_warnings
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
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
          created_at,
          updated_at,
          deleted_at
      `,
      [
        input.encounterId,
        input.clinicalNoteId ?? null,
        input.prescribedByPractitionerId ?? null,
        input.drugCatalogId ?? null,
        input.medicationName,
        input.rxnormCode ?? null,
        input.dosage ?? null,
        input.route ?? null,
        input.frequency ?? null,
        input.durationText ?? null,
        input.instructions ?? null,
        input.status ?? 'active',
        input.startDate ?? null,
        input.endDate ?? null,
        JSON.stringify(input.safetyWarnings ?? []),
      ]
    );

    return result.rows[0];
  };
}

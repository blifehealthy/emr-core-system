export function updatePrescription(db: {
  query: <T = unknown>(sql: string, params?: unknown[]) => Promise<{ rows: T[] }>;
}) {
  return async function run(input: {
    prescriptionId: string;
    prescribedByPractitionerId?: string | null;
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
  }) {
    const result = await db.query(
      `
        UPDATE prescriptions
        SET prescribed_by_practitioner_id = COALESCE($2, prescribed_by_practitioner_id),
            medication_name = COALESCE($3, medication_name),
            rxnorm_code = COALESCE($4, rxnorm_code),
            dosage = COALESCE($5, dosage),
            route = COALESCE($6, route),
            frequency = COALESCE($7, frequency),
            duration_text = COALESCE($8, duration_text),
            instructions = COALESCE($9, instructions),
            status = COALESCE($10, status),
            start_date = COALESCE($11, start_date),
            end_date = COALESCE($12, end_date)
        WHERE id = $1
          AND deleted_at IS NULL
        RETURNING
          id,
          encounter_id,
          clinical_note_id,
          prescribed_by_practitioner_id,
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
          created_at,
          updated_at,
          deleted_at
      `,
      [
        input.prescriptionId,
        input.prescribedByPractitionerId ?? null,
        input.medicationName ?? null,
        input.rxnormCode ?? null,
        input.dosage ?? null,
        input.route ?? null,
        input.frequency ?? null,
        input.durationText ?? null,
        input.instructions ?? null,
        input.status ?? null,
        input.startDate ?? null,
        input.endDate ?? null,
      ]
    );

    return result.rows[0] ?? null;
  };
}

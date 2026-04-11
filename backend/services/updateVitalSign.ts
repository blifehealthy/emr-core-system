export function updateVitalSign(db: {
  query: <T = unknown>(sql: string, params?: unknown[]) => Promise<{ rows: T[] }>;
}) {
  return async function run(input: {
    vitalSignId: string;
    measuredAt?: string | null;
    measuredByPractitionerId?: string | null;
    bodyTemperatureC?: number | string | null;
    heartRateBpm?: number | null;
    respiratoryRateBpm?: number | null;
    systolicBpMmhg?: number | null;
    diastolicBpMmhg?: number | null;
    oxygenSaturationPct?: number | string | null;
    weightKg?: number | string | null;
    heightCm?: number | string | null;
    bmi?: number | string | null;
    painScore?: number | null;
    notes?: string | null;
  }) {
    const result = await db.query<{
      id: string;
      measured_at: string;
      updated_at: string;
    }>(
      `
        UPDATE vital_signs
        SET measured_at = COALESCE($2, measured_at),
            measured_by_practitioner_id = COALESCE($3, measured_by_practitioner_id),
            body_temperature_c = COALESCE($4, body_temperature_c),
            heart_rate_bpm = COALESCE($5, heart_rate_bpm),
            respiratory_rate_bpm = COALESCE($6, respiratory_rate_bpm),
            systolic_bp_mmhg = COALESCE($7, systolic_bp_mmhg),
            diastolic_bp_mmhg = COALESCE($8, diastolic_bp_mmhg),
            oxygen_saturation_pct = COALESCE($9, oxygen_saturation_pct),
            weight_kg = COALESCE($10, weight_kg),
            height_cm = COALESCE($11, height_cm),
            bmi = COALESCE($12, bmi),
            pain_score = COALESCE($13, pain_score),
            notes = COALESCE($14, notes)
        WHERE id = $1
          AND deleted_at IS NULL
        RETURNING
          id,
          encounter_id,
          clinical_note_id,
          measured_at,
          measured_by_practitioner_id,
          body_temperature_c,
          heart_rate_bpm,
          respiratory_rate_bpm,
          systolic_bp_mmhg,
          diastolic_bp_mmhg,
          oxygen_saturation_pct,
          weight_kg,
          height_cm,
          bmi,
          pain_score,
          notes,
          created_at,
          updated_at,
          deleted_at
      `,
      [
        input.vitalSignId,
        input.measuredAt ?? null,
        input.measuredByPractitionerId ?? null,
        input.bodyTemperatureC ?? null,
        input.heartRateBpm ?? null,
        input.respiratoryRateBpm ?? null,
        input.systolicBpMmhg ?? null,
        input.diastolicBpMmhg ?? null,
        input.oxygenSaturationPct ?? null,
        input.weightKg ?? null,
        input.heightCm ?? null,
        input.bmi ?? null,
        input.painScore ?? null,
        input.notes ?? null,
      ]
    );

    return result.rows[0] ?? null;
  };
}

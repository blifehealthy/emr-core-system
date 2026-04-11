export function createVitalSign(db: {
  query: <T = unknown>(sql: string, params?: unknown[]) => Promise<{ rows: T[] }>;
}) {
  return async function run(input: {
    encounterId: string;
    clinicalNoteId?: string | null;
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
    const result = await db.query(
      `
        INSERT INTO vital_signs (
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
          notes
        )
        VALUES ($1, $2, COALESCE($3, NOW()), $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
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
        input.encounterId,
        input.clinicalNoteId ?? null,
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

    return result.rows[0];
  };
}

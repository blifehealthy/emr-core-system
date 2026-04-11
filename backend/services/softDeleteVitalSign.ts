export function softDeleteVitalSign(db: {
  query: <T = unknown>(sql: string, params?: unknown[]) => Promise<{ rows: T[] }>;
}) {
  return async function run(input: { vitalSignId: string }) {
    const result = await db.query(
      `
        UPDATE vital_signs
        SET deleted_at = COALESCE(deleted_at, NOW())
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
      [input.vitalSignId]
    );

    return result.rows[0] ?? null;
  };
}

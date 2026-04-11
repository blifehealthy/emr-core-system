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
    const assignments: string[] = [];
    const params: unknown[] = [input.vitalSignId];

    if (Object.hasOwn(input, 'measuredAt')) {
      params.push(input.measuredAt ?? null);
      assignments.push(`measured_at = $${params.length}`);
    }

    if (Object.hasOwn(input, 'measuredByPractitionerId')) {
      params.push(input.measuredByPractitionerId ?? null);
      assignments.push(`measured_by_practitioner_id = $${params.length}`);
    }

    if (Object.hasOwn(input, 'bodyTemperatureC')) {
      params.push(input.bodyTemperatureC ?? null);
      assignments.push(`body_temperature_c = $${params.length}`);
    }

    if (Object.hasOwn(input, 'heartRateBpm')) {
      params.push(input.heartRateBpm ?? null);
      assignments.push(`heart_rate_bpm = $${params.length}`);
    }

    if (Object.hasOwn(input, 'respiratoryRateBpm')) {
      params.push(input.respiratoryRateBpm ?? null);
      assignments.push(`respiratory_rate_bpm = $${params.length}`);
    }

    if (Object.hasOwn(input, 'systolicBpMmhg')) {
      params.push(input.systolicBpMmhg ?? null);
      assignments.push(`systolic_bp_mmhg = $${params.length}`);
    }

    if (Object.hasOwn(input, 'diastolicBpMmhg')) {
      params.push(input.diastolicBpMmhg ?? null);
      assignments.push(`diastolic_bp_mmhg = $${params.length}`);
    }

    if (Object.hasOwn(input, 'oxygenSaturationPct')) {
      params.push(input.oxygenSaturationPct ?? null);
      assignments.push(`oxygen_saturation_pct = $${params.length}`);
    }

    if (Object.hasOwn(input, 'weightKg')) {
      params.push(input.weightKg ?? null);
      assignments.push(`weight_kg = $${params.length}`);
    }

    if (Object.hasOwn(input, 'heightCm')) {
      params.push(input.heightCm ?? null);
      assignments.push(`height_cm = $${params.length}`);
    }

    if (Object.hasOwn(input, 'bmi')) {
      params.push(input.bmi ?? null);
      assignments.push(`bmi = $${params.length}`);
    }

    if (Object.hasOwn(input, 'painScore')) {
      params.push(input.painScore ?? null);
      assignments.push(`pain_score = $${params.length}`);
    }

    if (Object.hasOwn(input, 'notes')) {
      params.push(input.notes ?? null);
      assignments.push(`notes = $${params.length}`);
    }

    const result = await db.query<{
      id: string;
      measured_at: string;
      updated_at: string;
    }>(
      `
        UPDATE vital_signs
        SET ${assignments.join(',\n            ')}
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
      params
    );

    return result.rows[0] ?? null;
  };
}

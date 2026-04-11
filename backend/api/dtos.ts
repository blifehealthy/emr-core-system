type Row = Record<string, unknown>;

function pickKeys(row: unknown, keys: string[]): Record<string, unknown> {
  if (!row || typeof row !== 'object') {
    return {};
  }

  const source = row as Row;
  const picked: Record<string, unknown> = {};

  for (const key of keys) {
    if (key in source) {
      picked[key] = source[key];
    }
  }

  return picked;
}

const DIAGNOSIS_KEYS = [
  'id',
  'encounter_id',
  'clinical_note_id',
  'diagnosis_code',
  'coding_system',
  'diagnosis_name',
  'diagnosis_type',
  'status',
  'sequence_number',
  'diagnosed_at',
  'resolution_note',
  'notes',
  'created_at',
  'updated_at',
  'deleted_at',
] as const;

const VITAL_SIGN_KEYS = [
  'id',
  'encounter_id',
  'clinical_note_id',
  'measured_at',
  'measured_by_practitioner_id',
  'body_temperature_c',
  'heart_rate_bpm',
  'respiratory_rate_bpm',
  'systolic_bp_mmhg',
  'diastolic_bp_mmhg',
  'oxygen_saturation_pct',
  'weight_kg',
  'height_cm',
  'bmi',
  'pain_score',
  'notes',
  'created_at',
  'updated_at',
  'deleted_at',
] as const;

const PRESCRIPTION_KEYS = [
  'id',
  'encounter_id',
  'clinical_note_id',
  'prescribed_by_practitioner_id',
  'medication_name',
  'rxnorm_code',
  'dosage',
  'route',
  'frequency',
  'duration_text',
  'instructions',
  'status',
  'start_date',
  'end_date',
  'created_at',
  'updated_at',
  'deleted_at',
] as const;

export function toDiagnosisDto(row: unknown): Record<string, unknown> {
  return pickKeys(row, [...DIAGNOSIS_KEYS]);
}

export function toDiagnosisDtos(rows: unknown[]): Record<string, unknown>[] {
  return rows.map((row) => toDiagnosisDto(row));
}

export function toVitalSignDto(row: unknown): Record<string, unknown> {
  return pickKeys(row, [...VITAL_SIGN_KEYS]);
}

export function toVitalSignDtos(rows: unknown[]): Record<string, unknown>[] {
  return rows.map((row) => toVitalSignDto(row));
}

export function toPrescriptionDto(row: unknown): Record<string, unknown> {
  return pickKeys(row, [...PRESCRIPTION_KEYS]);
}

export function toPrescriptionDtos(rows: unknown[]): Record<string, unknown>[] {
  return rows.map((row) => toPrescriptionDto(row));
}

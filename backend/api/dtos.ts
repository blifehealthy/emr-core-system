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

const PATIENT_KEYS = [
  'id',
  'clinic_id',
  'medical_record_number',
  'national_id',
  'first_name',
  'middle_name',
  'last_name',
  'preferred_name',
  'date_of_birth',
  'sex_at_birth',
  'phone_number',
  'email',
  'blood_type',
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
  'drug_catalog_id',
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
  'safety_warnings',
  'safety_override_reason',
  'safety_overridden_at',
  'safety_overridden_by_user_id',
  'safety_overridden_by_practitioner_id',
  'created_at',
  'updated_at',
  'deleted_at',
] as const;

const DRUG_CATALOG_KEYS = [
  'id',
  'clinic_id',
  'medication_name',
  'rxnorm_code',
  'generic_name',
  'strength',
  'dosage_form',
  'route',
  'allergen_tags',
  'is_active',
  'created_at',
  'updated_at',
  'deleted_at',
] as const;

const DRUG_INTERACTION_RULE_KEYS = [
  'id',
  'clinic_id',
  'primary_drug_catalog_id',
  'interacting_drug_catalog_id',
  'primary_rxnorm_code',
  'interacting_rxnorm_code',
  'primary_medication_name',
  'interacting_medication_name',
  'severity',
  'description',
  'recommendation',
  'is_active',
  'created_at',
  'updated_at',
  'deleted_at',
] as const;

const USER_KEYS = [
  'id',
  'clinic_id',
  'username',
  'display_name',
  'role',
  'oidc_subject',
  'last_login_at',
  'failed_login_count',
  'locked_until',
  'is_active',
  'created_at',
  'updated_at',
  'deleted_at',
] as const;

const PRACTITIONER_KEYS = [
  'id',
  'clinic_id',
  'user_id',
  'practitioner_code',
  'first_name',
  'last_name',
  'license_number',
  'specialty',
  'is_active',
  'created_at',
  'updated_at',
  'deleted_at',
] as const;

const APPOINTMENT_KEYS = [
  'id',
  'clinic_id',
  'patient_id',
  'practitioner_id',
  'appointment_number',
  'status',
  'scheduled_start_at',
  'scheduled_end_at',
  'reason',
  'notes',
  'created_at',
  'updated_at',
  'deleted_at',
] as const;

const CLINIC_VISIT_KEYS = [
  'id',
  'clinic_id',
  'patient_id',
  'appointment_id',
  'encounter_id',
  'practitioner_id',
  'visit_number',
  'status',
  'queue_label',
  'room_name',
  'checked_in_at',
  'called_at',
  'started_at',
  'completed_at',
  'discharged_at',
  'notes',
  'created_at',
  'updated_at',
  'deleted_at',
  'medical_record_number',
  'patient_first_name',
  'patient_last_name',
  'practitioner_first_name',
  'practitioner_last_name',
] as const;

const CLINICAL_NOTE_TEMPLATE_KEYS = [
  'id',
  'clinic_id',
  'template_key',
  'title',
  'category',
  'subjective',
  'objective',
  'assessment',
  'plan',
  'is_active',
  'created_at',
  'updated_at',
  'deleted_at',
] as const;

const CLINIC_SETTINGS_KEYS = [
  'clinic_id',
  'display_name',
  'address',
  'phone_number',
  'email',
  'website',
  'logo_url',
  'logo_file_asset_id',
  'prescription_footer',
  'created_at',
  'updated_at',
  'deleted_at',
] as const;

const ENCOUNTER_KEYS = [
  'id',
  'patient_id',
  'encounter_number',
  'status',
  'encounter_class',
  'appointment_id',
  'attending_practitioner_id',
  'chief_complaint',
  'triage_summary',
  'started_at',
  'ended_at',
  'created_at',
  'updated_at',
  'deleted_at',
] as const;

const CONSENT_RECORD_KEYS = [
  'id',
  'clinic_id',
  'patient_id',
  'consent_type',
  'status',
  'granted_at',
  'revoked_at',
  'expires_at',
  'captured_by_user_id',
  'document_reference',
  'notes',
  'created_at',
  'updated_at',
  'deleted_at',
] as const;

const FILE_ASSET_KEYS = [
  'id',
  'clinic_id',
  'storage_key',
  'original_filename',
  'mime_type',
  'byte_size',
  'checksum_sha256',
  'uploaded_by_user_id',
  'created_at',
  'updated_at',
  'deleted_at',
] as const;

const ATTACHMENT_LINK_KEYS = [
  'id',
  'file_asset_id',
  'target_type',
  'target_id',
  'label',
  'created_at',
  'updated_at',
  'deleted_at',
  'clinic_id',
  'storage_key',
  'original_filename',
  'mime_type',
  'byte_size',
  'checksum_sha256',
  'uploaded_by_user_id',
] as const;

const PATIENT_ALLERGY_KEYS = [
  'id',
  'patient_id',
  'allergen_name',
  'allergen_category',
  'reaction',
  'severity',
  'status',
  'criticality',
  'recorded_at',
  'last_occurrence_at',
  'notes',
  'created_at',
  'updated_at',
  'deleted_at',
] as const;

const PATIENT_CONDITION_KEYS = [
  'id',
  'patient_id',
  'condition_code',
  'coding_system',
  'condition_name',
  'clinical_status',
  'onset_date',
  'abatement_date',
  'notes',
  'created_at',
  'updated_at',
  'deleted_at',
] as const;

const PATIENT_MEDICATION_KEYS = [
  'id',
  'patient_id',
  'prescribed_by_practitioner_id',
  'medication_name',
  'rxnorm_code',
  'dosage',
  'route',
  'frequency',
  'instructions',
  'status',
  'start_date',
  'end_date',
  'notes',
  'created_at',
  'updated_at',
  'deleted_at',
] as const;

const PATIENT_FLAG_KEYS = [
  'id',
  'patient_id',
  'flag_type',
  'label',
  'description',
  'severity',
  'status',
  'source',
  'starts_at',
  'ends_at',
  'created_by_user_id',
  'notes',
  'created_at',
  'updated_at',
  'deleted_at',
] as const;

const SOAP_NOTE_KEYS = [
  'clinical_note_id',
  'subjective',
  'objective',
  'assessment',
  'plan',
  'created_at',
  'updated_at',
  'deleted_at',
] as const;

export function toDiagnosisDto(row: unknown): Record<string, unknown> {
  return pickKeys(row, [...DIAGNOSIS_KEYS]);
}

export function toPatientDto(row: unknown): Record<string, unknown> {
  return pickKeys(row, [...PATIENT_KEYS]);
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

export function toDrugCatalogItemDto(row: unknown): Record<string, unknown> {
  return pickKeys(row, [...DRUG_CATALOG_KEYS]);
}

export function toDrugCatalogItemDtos(rows: unknown[]): Record<string, unknown>[] {
  return rows.map((row) => toDrugCatalogItemDto(row));
}

export function toDrugInteractionRuleDto(row: unknown): Record<string, unknown> {
  return pickKeys(row, [...DRUG_INTERACTION_RULE_KEYS]);
}

export function toDrugInteractionRuleDtos(rows: unknown[]): Record<string, unknown>[] {
  return rows.map((row) => toDrugInteractionRuleDto(row));
}

export function toUserDto(row: unknown): Record<string, unknown> {
  return pickKeys(row, [...USER_KEYS]);
}

export function toUserDtos(rows: unknown[]): Record<string, unknown>[] {
  return rows.map((row) => toUserDto(row));
}

export function toPractitionerDto(row: unknown): Record<string, unknown> {
  return pickKeys(row, [...PRACTITIONER_KEYS]);
}

export function toPractitionerDtos(rows: unknown[]): Record<string, unknown>[] {
  return rows.map((row) => toPractitionerDto(row));
}

export function toAppointmentDto(row: unknown): Record<string, unknown> {
  return pickKeys(row, [...APPOINTMENT_KEYS]);
}

export function toAppointmentDtos(rows: unknown[]): Record<string, unknown>[] {
  return rows.map((row) => toAppointmentDto(row));
}

export function toClinicVisitDto(row: unknown): Record<string, unknown> {
  return pickKeys(row, [...CLINIC_VISIT_KEYS]);
}

export function toClinicVisitDtos(rows: unknown[]): Record<string, unknown>[] {
  return rows.map((row) => toClinicVisitDto(row));
}

export function toClinicalNoteTemplateDto(row: unknown): Record<string, unknown> {
  return pickKeys(row, [...CLINICAL_NOTE_TEMPLATE_KEYS]);
}

export function toClinicalNoteTemplateDtos(rows: unknown[]): Record<string, unknown>[] {
  return rows.map((row) => toClinicalNoteTemplateDto(row));
}

export function toClinicSettingsDto(row: unknown): Record<string, unknown> {
  return pickKeys(row, [...CLINIC_SETTINGS_KEYS]);
}

export function toEncounterDto(row: unknown): Record<string, unknown> {
  return pickKeys(row, [...ENCOUNTER_KEYS]);
}

export function toConsentRecordDto(row: unknown): Record<string, unknown> {
  return pickKeys(row, [...CONSENT_RECORD_KEYS]);
}

export function toConsentRecordDtos(rows: unknown[]): Record<string, unknown>[] {
  return rows.map((row) => toConsentRecordDto(row));
}

export function toFileAssetDto(row: unknown): Record<string, unknown> {
  return pickKeys(row, [...FILE_ASSET_KEYS]);
}

export function toFileAssetDtos(rows: unknown[]): Record<string, unknown>[] {
  return rows.map((row) => toFileAssetDto(row));
}

export function toAttachmentLinkDto(row: unknown): Record<string, unknown> {
  return pickKeys(row, [...ATTACHMENT_LINK_KEYS]);
}

export function toAttachmentLinkDtos(rows: unknown[]): Record<string, unknown>[] {
  return rows.map((row) => toAttachmentLinkDto(row));
}

export function toPatientAllergyDto(row: unknown): Record<string, unknown> {
  return pickKeys(row, [...PATIENT_ALLERGY_KEYS]);
}

export function toPatientAllergyDtos(rows: unknown[]): Record<string, unknown>[] {
  return rows.map((row) => toPatientAllergyDto(row));
}

export function toPatientConditionDto(row: unknown): Record<string, unknown> {
  return pickKeys(row, [...PATIENT_CONDITION_KEYS]);
}

export function toPatientConditionDtos(rows: unknown[]): Record<string, unknown>[] {
  return rows.map((row) => toPatientConditionDto(row));
}

export function toPatientMedicationDto(row: unknown): Record<string, unknown> {
  return pickKeys(row, [...PATIENT_MEDICATION_KEYS]);
}

export function toPatientMedicationDtos(rows: unknown[]): Record<string, unknown>[] {
  return rows.map((row) => toPatientMedicationDto(row));
}

export function toPatientFlagDto(row: unknown): Record<string, unknown> {
  return pickKeys(row, [...PATIENT_FLAG_KEYS]);
}

export function toPatientFlagDtos(rows: unknown[]): Record<string, unknown>[] {
  return rows.map((row) => toPatientFlagDto(row));
}

export function toSoapNoteDto(row: unknown): Record<string, unknown> {
  return pickKeys(row, [...SOAP_NOTE_KEYS]);
}

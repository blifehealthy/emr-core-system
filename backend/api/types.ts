import type { PatientWithEncountersAndSOAP } from '../repositories/getPatientWithEncountersAndSOAP.ts';

export type PatientSexAtBirth = 'female' | 'male' | 'intersex' | 'unknown';
export type EncounterStatus = 'draft' | 'in_progress' | 'completed' | 'signed' | 'cancelled';
export type EncounterClass = 'outpatient' | 'inpatient' | 'emergency' | 'other';
export type AppointmentStatus =
  | 'pending'
  | 'confirmed'
  | 'checked_in'
  | 'completed'
  | 'cancelled'
  | 'no_show';
export type ClinicVisitStatus =
  | 'waiting'
  | 'in_room'
  | 'with_doctor'
  | 'completed'
  | 'discharged'
  | 'cancelled';
export type ConsentStatus = 'granted' | 'revoked' | 'expired' | 'declined';
export type AttachmentTargetType =
  | 'patient'
  | 'encounter'
  | 'clinical_note'
  | 'consent_record';
export type AllergySeverity = 'mild' | 'moderate' | 'severe' | 'unknown';
export type AllergyStatus = 'active' | 'inactive' | 'entered_in_error';
export type PatientConditionStatus = 'active' | 'resolved' | 'inactive' | 'entered_in_error';
export type PatientMedicationStatus =
  | 'active'
  | 'completed'
  | 'stopped'
  | 'on_hold'
  | 'entered_in_error';
export type PatientFlagStatus = 'active' | 'inactive' | 'resolved' | 'entered_in_error';
export type PatientFlagSeverity = 'info' | 'caution' | 'critical';
export type DiagnosisType = 'working' | 'final' | 'differential' | 'ruled_out';
export type DiagnosisStatus = 'active' | 'resolved' | 'entered_in_error';
export type UserRole = 'doctor' | 'nurse' | 'admin';
export type AuthActor = {
  userId?: string | null;
  practitionerId?: string | null;
  role?: UserRole;
};

export type HttpRequest = {
  method: string;
  path: string;
  query?: Record<string, string | undefined>;
  headers?: Record<string, string | undefined>;
  body?: unknown;
};

export type HttpResponse = {
  status: number;
  headers?: Record<string, string>;
  body: unknown;
};

export type PaginatedListResult<T = unknown> = {
  rows: T[];
  meta: {
    limit: number;
    offset: number;
    hasMore: boolean;
    nextOffset: number | null;
  };
};

export type AdminActiveFilter = 'active' | 'inactive' | 'all';

export type CreateEncounterInput = {
  patientId: string;
  encounterNumber: string;
  status?: EncounterStatus;
  encounterClass?: EncounterClass;
  appointmentId?: string | null;
  attendingPractitionerId?: string | null;
  chiefComplaint?: string | null;
  triageSummary?: string | null;
  startedAt?: string | null;
  endedAt?: string | null;
  title?: string | null;
  noteText?: string | null;
  authoredByPractitionerId?: string | null;
  authoredAt?: string | null;
  subjective?: string | null;
  objective?: string | null;
  assessment?: string | null;
  plan?: string | null;
  diagnoses?: Array<{
    clinicalNoteId?: string | null;
    diagnosisCode?: string | null;
    codingSystem?: string | null;
    diagnosisName: string;
    diagnosisType?: DiagnosisType;
    status?: DiagnosisStatus;
    sequenceNumber?: number | null;
    diagnosedAt?: string | null;
    resolutionNote?: string | null;
    notes?: string | null;
  }>;
  vitalSigns?: Array<{
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
  }>;
};

export type CreateEncounterResult = {
  encounter: unknown;
  clinical_note: unknown;
  soap_note: unknown;
  diagnoses: unknown[];
  vital_signs: unknown[];
};

export type CreateAppointmentInput = {
  clinicId: string;
  patientId: string;
  practitionerId?: string | null;
  appointmentNumber: string;
  status?: AppointmentStatus;
  scheduledStartAt: string;
  scheduledEndAt?: string | null;
  reason?: string | null;
  notes?: string | null;
};

export type CreatePatientInput = {
  clinicId: string;
  medicalRecordNumber: string;
  nationalId?: string | null;
  firstName: string;
  middleName?: string | null;
  lastName: string;
  preferredName?: string | null;
  dateOfBirth?: string | null;
  sexAtBirth?: PatientSexAtBirth;
  phoneNumber?: string | null;
  email?: string | null;
  bloodType?: string | null;
  notes?: string | null;
};

export type UpdateAppointmentInput = {
  appointmentId: string;
  practitionerId?: string | null;
  status?: AppointmentStatus;
  scheduledStartAt?: string;
  scheduledEndAt?: string | null;
  reason?: string | null;
  notes?: string | null;
};

export type CreateClinicVisitInput = {
  clinicId: string;
  patientId: string;
  appointmentId?: string | null;
  practitionerId?: string | null;
  visitNumber: string;
  status?: ClinicVisitStatus;
  queueLabel?: string | null;
  roomName?: string | null;
  notes?: string | null;
};

export type UpdateClinicVisitInput = {
  visitId: string;
  encounterId?: string | null;
  practitionerId?: string | null;
  status?: ClinicVisitStatus;
  queueLabel?: string | null;
  roomName?: string | null;
  notes?: string | null;
};

export type CreateClinicalNoteTemplateInput = {
  clinicId: string;
  templateKey: string;
  title: string;
  category?: string | null;
  subjective?: string | null;
  objective?: string | null;
  assessment?: string | null;
  plan?: string | null;
  isActive?: boolean;
};

export type UpdateClinicalNoteTemplateInput = {
  templateId: string;
  templateKey?: string;
  title?: string;
  category?: string | null;
  subjective?: string | null;
  objective?: string | null;
  assessment?: string | null;
  plan?: string | null;
  isActive?: boolean;
};

export type UpsertClinicSettingsInput = {
  clinicId: string;
  displayName: string;
  address?: string | null;
  phoneNumber?: string | null;
  email?: string | null;
  website?: string | null;
  logoUrl?: string | null;
  logoFileAssetId?: string | null;
  prescriptionFooter?: string | null;
};

export type UpdateEncounterInput = {
  encounterId: string;
  status?: EncounterStatus;
  encounterClass?: EncounterClass;
  attendingPractitionerId?: string | null;
  chiefComplaint?: string | null;
  triageSummary?: string | null;
  startedAt?: string | null;
  endedAt?: string | null;
};

export type CreateConsentRecordInput = {
  clinicId: string;
  patientId: string;
  consentType: string;
  status?: ConsentStatus;
  grantedAt?: string | null;
  revokedAt?: string | null;
  expiresAt?: string | null;
  capturedByUserId?: string | null;
  documentReference?: string | null;
  notes?: string | null;
};

export type CreateFileAssetInput = {
  clinicId: string;
  storageKey: string;
  originalFilename: string;
  mimeType?: string | null;
  byteSize: number;
  checksumSha256?: string | null;
  uploadedByUserId?: string | null;
};

export type UploadFileAssetInput = CreateFileAssetInput & {
  contentBase64: string;
};

export type FileAssetStoragePolicyDto = {
  driver: 'local';
  maxUploadBytes: number;
  allowedMimeTypes: string[];
};

export type CreateAttachmentLinkInput = {
  fileAssetId: string;
  targetType: AttachmentTargetType;
  targetId: string;
  label?: string | null;
};

export type CreatePatientAllergyInput = {
  patientId: string;
  allergenName: string;
  allergenCategory?: string | null;
  reaction?: string | null;
  severity?: AllergySeverity;
  status?: AllergyStatus;
  criticality?: string | null;
  recordedAt?: string | null;
  lastOccurrenceAt?: string | null;
  notes?: string | null;
};

export type UpdatePatientAllergyInput = {
  allergyId: string;
  allergenName?: string;
  allergenCategory?: string | null;
  reaction?: string | null;
  severity?: AllergySeverity;
  status?: AllergyStatus;
  criticality?: string | null;
  recordedAt?: string | null;
  lastOccurrenceAt?: string | null;
  notes?: string | null;
};

export type CreatePatientConditionInput = {
  patientId: string;
  conditionCode?: string | null;
  codingSystem?: string | null;
  conditionName: string;
  clinicalStatus?: PatientConditionStatus;
  onsetDate?: string | null;
  abatementDate?: string | null;
  notes?: string | null;
};

export type UpdatePatientConditionInput = {
  conditionId: string;
  conditionCode?: string | null;
  codingSystem?: string | null;
  conditionName?: string;
  clinicalStatus?: PatientConditionStatus;
  onsetDate?: string | null;
  abatementDate?: string | null;
  notes?: string | null;
};

export type CreatePatientMedicationInput = {
  patientId: string;
  prescribedByPractitionerId?: string | null;
  medicationName: string;
  rxnormCode?: string | null;
  dosage?: string | null;
  route?: string | null;
  frequency?: string | null;
  instructions?: string | null;
  status?: PatientMedicationStatus;
  startDate?: string | null;
  endDate?: string | null;
  notes?: string | null;
};

export type UpdatePatientMedicationInput = {
  medicationId: string;
  prescribedByPractitionerId?: string | null;
  medicationName?: string;
  rxnormCode?: string | null;
  dosage?: string | null;
  route?: string | null;
  frequency?: string | null;
  instructions?: string | null;
  status?: PatientMedicationStatus;
  startDate?: string | null;
  endDate?: string | null;
  notes?: string | null;
};

export type CreatePatientFlagInput = {
  patientId: string;
  flagType: string;
  label: string;
  description?: string | null;
  severity?: PatientFlagSeverity;
  status?: PatientFlagStatus;
  source?: string | null;
  startsAt?: string | null;
  endsAt?: string | null;
  createdByUserId?: string | null;
  notes?: string | null;
};

export type UpdatePatientFlagInput = {
  flagId: string;
  flagType?: string;
  label?: string;
  description?: string | null;
  severity?: PatientFlagSeverity;
  status?: PatientFlagStatus;
  source?: string | null;
  startsAt?: string | null;
  endsAt?: string | null;
  notes?: string | null;
};

export type UpdateConsentRecordInput = {
  consentId: string;
  consentType?: string;
  status?: ConsentStatus;
  grantedAt?: string | null;
  revokedAt?: string | null;
  expiresAt?: string | null;
  capturedByUserId?: string | null;
  documentReference?: string | null;
  notes?: string | null;
};

export type UpdateSoapNoteInput = {
  clinicalNoteId: string;
  subjective?: string | null;
  objective?: string | null;
  assessment?: string | null;
  plan?: string | null;
};

export type UpdateDiagnosisInput = {
  diagnosisId: string;
  diagnosisCode?: string | null;
  codingSystem?: string | null;
  diagnosisName?: string;
  diagnosisType?: DiagnosisType;
  status?: DiagnosisStatus;
  sequenceNumber?: number | null;
  diagnosedAt?: string | null;
  resolutionNote?: string | null;
  notes?: string | null;
};

export type CreateDiagnosisInput = {
  encounterId: string;
  clinicalNoteId?: string | null;
  diagnosisCode?: string | null;
  codingSystem?: string | null;
  diagnosisName: string;
  diagnosisType?: DiagnosisType;
  status?: DiagnosisStatus;
  sequenceNumber?: number | null;
  diagnosedAt?: string | null;
  resolutionNote?: string | null;
  notes?: string | null;
};

export type UpdateVitalSignInput = {
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
};

export type CreateVitalSignInput = {
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
};

export type CreateUserValidatedInput = CreateUserInput;

export type UpdateUserValidatedInput = UpdateUserInput;

export type CreatePractitionerValidatedInput = CreatePractitionerInput;

export type UpdatePractitionerValidatedInput = UpdatePractitionerInput;

export type PrescriptionStatus = 'active' | 'completed' | 'cancelled';

export type FinalizeClinicalNoteInput = {
  clinicalNoteId: string;
  finalizedAt?: string | null;
};

export type SignClinicalNoteInput = {
  clinicalNoteId: string;
  signedAt?: string | null;
  authoredByPractitionerId?: string | null;
};

export type CreateUserInput = {
  clinicId: string;
  username: string;
  displayName: string;
  role: UserRole;
};

export type UpdateUserInput = {
  userId: string;
  displayName?: string;
  role?: UserRole;
  isActive?: boolean;
};

export type CreatePractitionerInput = {
  clinicId: string;
  userId?: string | null;
  practitionerCode: string;
  firstName: string;
  lastName: string;
  licenseNumber?: string | null;
  specialty?: string | null;
};

export type UpdatePractitionerInput = {
  practitionerId: string;
  userId?: string | null;
  firstName?: string;
  lastName?: string;
  licenseNumber?: string | null;
  specialty?: string | null;
  isActive?: boolean;
};

export type CreatePrescriptionInput = {
  encounterId: string;
  clinicalNoteId?: string | null;
  prescribedByPractitionerId?: string | null;
  medicationName: string;
  rxnormCode?: string | null;
  dosage?: string | null;
  route?: string | null;
  frequency?: string | null;
  durationText?: string | null;
  instructions?: string | null;
  status?: PrescriptionStatus;
  startDate?: string | null;
  endDate?: string | null;
};

export type UpdatePrescriptionInput = {
  prescriptionId: string;
  prescribedByPractitionerId?: string | null;
  medicationName?: string;
  rxnormCode?: string | null;
  dosage?: string | null;
  route?: string | null;
  frequency?: string | null;
  durationText?: string | null;
  instructions?: string | null;
  status?: PrescriptionStatus;
  startDate?: string | null;
  endDate?: string | null;
};

export type Dependencies = {
  getPatientWithEncountersAndSOAP: (input: {
    clinicId: string;
    medicalRecordNumber: string;
  }) => Promise<PatientWithEncountersAndSOAP | null>;
  createPatient: (input: CreatePatientInput) => Promise<unknown>;
  getConsentRecordById?: (input: { consentId: string }) => Promise<unknown | null>;
  getFileAssetById?: (input: { fileAssetId: string }) => Promise<unknown | null>;
  listFileAssets?: (input: {
    clinicId: string;
    search?: string;
    limit?: number;
    offset?: number;
  }) => Promise<{
    rows: unknown[];
    meta: { limit: number; offset: number; hasMore: boolean; nextOffset: number | null };
  }>;
  getPatientAllergyById?: (input: { allergyId: string }) => Promise<unknown | null>;
  getPatientConditionById?: (input: { conditionId: string }) => Promise<unknown | null>;
  getPatientMedicationById?: (input: { medicationId: string }) => Promise<unknown | null>;
  getPatientFlagById?: (input: { flagId: string }) => Promise<unknown | null>;
  getSoapNoteByClinicalNoteId?: (input: { clinicalNoteId: string }) => Promise<unknown | null>;
  getAppointmentById?: (input: { appointmentId: string }) => Promise<unknown | null>;
  getEncounterById?: (input: { encounterId: string }) => Promise<unknown | null>;
  getDiagnosisById?: (input: { diagnosisId: string }) => Promise<unknown | null>;
  getVitalSignById?: (input: { vitalSignId: string }) => Promise<unknown | null>;
  getPrescriptionById?: (input: { prescriptionId: string }) => Promise<unknown | null>;
  listAppointments: (input: {
    clinicId: string;
    patientId?: string;
    practitionerId?: string;
    status?: AppointmentStatus;
  }) => Promise<unknown[]>;
  createAppointment: (input: CreateAppointmentInput) => Promise<unknown>;
  updateAppointment: (input: UpdateAppointmentInput) => Promise<unknown | null>;
  listClinicQueue?: (input: {
    clinicId: string;
    status?: ClinicVisitStatus;
    practitionerId?: string;
    roomName?: string;
    limit?: number;
  }) => Promise<unknown[]>;
  createClinicVisit?: (input: CreateClinicVisitInput) => Promise<unknown>;
  updateClinicVisit?: (input: UpdateClinicVisitInput) => Promise<unknown | null>;
  listClinicalNoteTemplates?: (input: {
    clinicId: string;
    active?: boolean;
  }) => Promise<unknown[]>;
  createClinicalNoteTemplate?: (input: CreateClinicalNoteTemplateInput) => Promise<unknown>;
  updateClinicalNoteTemplate?: (input: UpdateClinicalNoteTemplateInput) => Promise<unknown | null>;
  getClinicSettings?: (input: { clinicId: string }) => Promise<unknown | null>;
  upsertClinicSettings?: (input: UpsertClinicSettingsInput) => Promise<unknown>;
  getDailyOperationsReport?: (input: {
    clinicId: string;
    startDate: string;
    endDate: string;
  }) => Promise<unknown | null>;
  listConsentRecordsByPatient: (input: {
    patientId: string;
    status?: ConsentStatus;
  }) => Promise<unknown[]>;
  createConsentRecord: (input: CreateConsentRecordInput) => Promise<unknown>;
  updateConsentRecord: (input: UpdateConsentRecordInput) => Promise<unknown | null>;
  listAttachmentsByTarget: (input: {
    targetType: AttachmentTargetType;
    targetId: string;
  }) => Promise<unknown[]>;
  createFileAsset: (input: CreateFileAssetInput) => Promise<unknown>;
  uploadFileAsset?: (input: UploadFileAssetInput) => Promise<unknown>;
  downloadFileAssetContent?: (input: {
    fileAssetId?: string;
    storageKey?: string;
  }) => Promise<{ content: Buffer; mimeType?: string | null } | null>;
  getFileAssetStoragePolicy?: () => FileAssetStoragePolicyDto;
  createAttachmentLink: (input: CreateAttachmentLinkInput) => Promise<unknown>;
  listPatientAllergies: (input: {
    patientId: string;
    status?: AllergyStatus;
  }) => Promise<unknown[]>;
  createPatientAllergy: (input: CreatePatientAllergyInput) => Promise<unknown>;
  updatePatientAllergy: (input: UpdatePatientAllergyInput) => Promise<unknown | null>;
  softDeletePatientAllergy?: (input: { allergyId: string }) => Promise<unknown | null>;
  listPatientConditions: (input: {
    patientId: string;
    clinicalStatus?: PatientConditionStatus;
  }) => Promise<unknown[]>;
  createPatientCondition: (input: CreatePatientConditionInput) => Promise<unknown>;
  updatePatientCondition: (input: UpdatePatientConditionInput) => Promise<unknown | null>;
  softDeletePatientCondition?: (input: { conditionId: string }) => Promise<unknown | null>;
  listPatientMedications: (input: {
    patientId: string;
    status?: PatientMedicationStatus;
  }) => Promise<unknown[]>;
  createPatientMedication: (input: CreatePatientMedicationInput) => Promise<unknown>;
  updatePatientMedication: (input: UpdatePatientMedicationInput) => Promise<unknown | null>;
  softDeletePatientMedication?: (input: { medicationId: string }) => Promise<unknown | null>;
  listPatientFlags: (input: {
    patientId: string;
    status?: PatientFlagStatus;
    severity?: PatientFlagSeverity;
  }) => Promise<unknown[]>;
  createPatientFlag: (input: CreatePatientFlagInput) => Promise<unknown>;
  updatePatientFlag: (input: UpdatePatientFlagInput) => Promise<unknown | null>;
  softDeletePatientFlag?: (input: { flagId: string }) => Promise<unknown | null>;
  listDiagnosesByEncounter?: (input: {
    encounterId: string;
    clinicalNoteId?: string;
    status?: DiagnosisStatus;
    limit?: number;
    offset?: number;
  }) => Promise<PaginatedListResult>;
  listVitalSignsByEncounter?: (input: {
    encounterId: string;
    clinicalNoteId?: string;
    limit?: number;
    offset?: number;
  }) => Promise<PaginatedListResult>;
  listUsers: (input: {
    clinicId: string;
    search?: string;
    active?: AdminActiveFilter;
    limit?: number;
    offset?: number;
  }) => Promise<PaginatedListResult>;
  createUser: (input: CreateUserInput) => Promise<unknown>;
  updateUser: (input: UpdateUserInput) => Promise<unknown | null>;
  listPractitioners: (input: {
    clinicId: string;
    search?: string;
    active?: AdminActiveFilter;
    limit?: number;
    offset?: number;
  }) => Promise<PaginatedListResult>;
  createPractitioner: (input: CreatePractitionerInput) => Promise<unknown>;
  updatePractitioner: (input: UpdatePractitionerInput) => Promise<unknown | null>;
  listPrescriptionsByEncounter: (input: {
    encounterId: string;
    clinicalNoteId?: string;
    status?: PrescriptionStatus;
    limit?: number;
    offset?: number;
  }) => Promise<PaginatedListResult>;
  createDiagnosis?: (input: CreateDiagnosisInput) => Promise<unknown>;
  createVitalSign?: (input: CreateVitalSignInput) => Promise<unknown>;
  createPrescription: (input: CreatePrescriptionInput) => Promise<unknown>;
  updatePrescription: (input: UpdatePrescriptionInput) => Promise<unknown | null>;
  createEncounterWithSOAP: (input: CreateEncounterInput) => Promise<CreateEncounterResult>;
  updateEncounter: (input: UpdateEncounterInput) => Promise<unknown | null>;
  updateSoapNote: (input: UpdateSoapNoteInput) => Promise<unknown | null>;
  updateDiagnosis: (input: UpdateDiagnosisInput) => Promise<unknown | null>;
  updateVitalSign: (input: UpdateVitalSignInput) => Promise<unknown | null>;
  softDeleteSoapNote?: (input: { clinicalNoteId: string }) => Promise<unknown | null>;
  softDeleteDiagnosis?: (input: { diagnosisId: string }) => Promise<unknown | null>;
  softDeleteVitalSign?: (input: { vitalSignId: string }) => Promise<unknown | null>;
  softDeletePrescription?: (input: { prescriptionId: string }) => Promise<unknown | null>;
  finalizeClinicalNote: (input: FinalizeClinicalNoteInput) => Promise<unknown | null>;
  signClinicalNote: (input: SignClinicalNoteInput) => Promise<unknown | null>;
  createAuditLog: (input: {
    entityType: string;
    entityId: string;
    action: string;
    actorUserId?: string | null;
    actorPractitionerId?: string | null;
    metadata?: Record<string, unknown>;
  }) => Promise<unknown>;
  getAuditLogsByEntity: (input: {
    entityType: string;
    entityId: string;
    limit?: number;
  }) => Promise<unknown[]>;
  getPatientTimeline: (input: {
    patientId: string;
    limit?: number;
  }) => Promise<unknown[]>;
  resolveActor?: (input: { userId: string }) => Promise<{
    user_id: string;
    role: UserRole;
    practitioner_id: string | null;
    clinic_id: string;
    display_name: string;
  } | null>;
  healthCheck: () => Promise<void>;
  apiToken?: string;
};

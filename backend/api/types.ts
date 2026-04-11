import type { PatientWithEncountersAndSOAP } from '../repositories/getPatientWithEncountersAndSOAP.ts';

export type EncounterStatus = 'draft' | 'in_progress' | 'completed' | 'signed' | 'cancelled';
export type EncounterClass = 'outpatient' | 'inpatient' | 'emergency' | 'other';
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
  getSoapNoteByClinicalNoteId?: (input: { clinicalNoteId: string }) => Promise<unknown | null>;
  getDiagnosisById?: (input: { diagnosisId: string }) => Promise<unknown | null>;
  getVitalSignById?: (input: { vitalSignId: string }) => Promise<unknown | null>;
  getPrescriptionById?: (input: { prescriptionId: string }) => Promise<unknown | null>;
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
  listUsers: (input: { clinicId: string }) => Promise<unknown[]>;
  createUser: (input: CreateUserInput) => Promise<unknown>;
  updateUser: (input: UpdateUserInput) => Promise<unknown | null>;
  listPractitioners: (input: { clinicId: string }) => Promise<unknown[]>;
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

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
  oidcSubject?: string | null;
  permissionOverrides?: Record<string, boolean>;
};

export type CreateAuthSessionInput = {
  clinicId: string;
  username: string;
  loginCode: string;
};

export type AuthSession = {
  accessToken: string;
  tokenType: 'Bearer';
  expiresAt: string;
  user: {
    id: string;
    clinic_id: string;
    username: string;
    display_name: string;
    role: UserRole;
    practitioner_id: string | null;
  };
};

export type AuthSessionFailure = {
  failed: true;
  reason: 'invalid_login_code' | 'locked';
  lockedUntil: string | null;
  user: {
    id: string;
    clinic_id: string;
    username: string;
    display_name: string;
    role: UserRole;
    practitioner_id: string | null;
  };
};

export type RolePermissionOverrideInput = {
  clinicId: string;
  role: UserRole;
  permissionKey: string;
  isAllowed: boolean;
  updatedByUserId?: string | null;
  notes?: string | null;
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
  driver: 'local' | 's3';
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
export type InvoiceStatus = 'draft' | 'issued' | 'partially_paid' | 'paid' | 'voided';
export type InvoiceLineItemType =
  | 'visit'
  | 'procedure'
  | 'medication'
  | 'lab'
  | 'discount'
  | 'other';
export type PaymentMethod = 'cash' | 'card' | 'bank_transfer' | 'qr' | 'insurance' | 'other';
export type InsuranceClaimStatus = 'draft' | 'submitted' | 'accepted' | 'rejected' | 'paid' | 'cancelled';
export type BillingDocumentType = 'invoice' | 'receipt' | 'tax_invoice' | 'claim';
export type CashierReconciliationStatus = 'open' | 'closed' | 'cancelled';
export type DrugCatalogActiveFilter = 'active' | 'inactive' | 'all';
export type StockMovementType = 'adjustment_in' | 'adjustment_out' | 'dispense' | 'return';
export type InventoryBarcodeScanContext = 'lookup' | 'receiving' | 'dispensing';
export type InventoryBarcodePrintLanguage = 'html' | 'zpl' | 'escpos';
export type InventoryPrinterConnectionType = 'browser' | 'network' | 'utility_bridge';
export type SupplierStatus = 'active' | 'inactive';
export type PurchaseOrderStatus =
  | 'draft'
  | 'ordered'
  | 'partially_received'
  | 'received'
  | 'cancelled';
export type PurchaseOrderApprovalStatus =
  | 'draft'
  | 'pending_approval'
  | 'approved'
  | 'rejected';
export type PurchaseOrderApprovalStepStatus = 'pending' | 'approved' | 'rejected' | 'skipped';
export type PrescriptionSafetyWarning = {
  type: 'allergy' | 'interaction';
  severity: 'critical' | 'warning';
  message: string;
  allergyId?: string;
  allergenName?: string;
  medicationName: string;
  matchedOn: string;
  reaction?: string | null;
  interactionRuleId?: string;
  interactingMedicationName?: string;
  recommendation?: string | null;
};
export type DrugInteractionSeverity = 'info' | 'warning' | 'critical';

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
  oidcSubject?: string | null;
};

export type UpdateUserInput = {
  userId: string;
  displayName?: string;
  role?: UserRole;
  isActive?: boolean;
  oidcSubject?: string | null;
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

export type CreateDrugCatalogItemInput = {
  clinicId: string;
  medicationName: string;
  rxnormCode?: string | null;
  genericName?: string | null;
  strength?: string | null;
  dosageForm?: string | null;
  route?: string | null;
  allergenTags?: string[];
  isActive?: boolean;
};

export type UpdateDrugCatalogItemInput = {
  drugCatalogId: string;
  medicationName?: string;
  rxnormCode?: string | null;
  genericName?: string | null;
  strength?: string | null;
  dosageForm?: string | null;
  route?: string | null;
  allergenTags?: string[];
  isActive?: boolean;
};

export type CreateInventoryItemInput = {
  clinicId: string;
  drugCatalogId?: string | null;
  itemCode: string;
  displayName: string;
  barcode?: string | null;
  barcodeRequired?: boolean;
  isControlledSubstance?: boolean;
  controlledSubstanceSchedule?: string | null;
  unit?: string;
  quantityOnHand?: number | string;
  reorderLevel?: number | string;
  isActive?: boolean;
  notes?: string | null;
};

export type UpdateInventoryItemInput = {
  inventoryItemId: string;
  drugCatalogId?: string | null;
  itemCode?: string;
  displayName?: string;
  barcode?: string | null;
  barcodeRequired?: boolean;
  isControlledSubstance?: boolean;
  controlledSubstanceSchedule?: string | null;
  unit?: string;
  reorderLevel?: number | string;
  isActive?: boolean;
  notes?: string | null;
};

export type AdjustInventoryStockInput = {
  inventoryItemId: string;
  inventoryLocationId?: string | null;
  binLabel?: string | null;
  movementType: Exclude<StockMovementType, 'dispense'>;
  quantity: number | string;
  reason?: string | null;
  performedByUserId?: string | null;
};

export type ReceiveInventoryLotInput = {
  inventoryItemId: string;
  inventoryLocationId?: string | null;
  binLabel?: string | null;
  lotNumber: string;
  lotBarcode?: string | null;
  scannedBarcode?: string | null;
  requireBarcodeVerification?: boolean;
  expiresOn?: string | null;
  quantity: number | string;
  supplierId?: string | null;
  supplierName?: string | null;
  referenceNumber?: string | null;
  receivedByUserId?: string | null;
  notes?: string | null;
};

export type CreateInventoryLocationInput = {
  clinicId: string;
  locationCode: string;
  displayName: string;
  locationType?: string;
  isDefault?: boolean;
  isActive?: boolean;
  notes?: string | null;
};

export type UpdateInventoryLocationInput = {
  locationId: string;
  locationCode?: string;
  displayName?: string;
  locationType?: string;
  isDefault?: boolean;
  isActive?: boolean;
  notes?: string | null;
};

export type CreateInventoryTransferInput = {
  clinicId: string;
  inventoryItemId: string;
  inventoryLotId?: string | null;
  fromInventoryLocationId: string;
  toInventoryLocationId: string;
  fromBinLabel?: string | null;
  toBinLabel?: string | null;
  quantity: number | string;
  approvalRequired?: boolean;
  expiryOverrideReason?: string | null;
  fefoOverrideReason?: string | null;
  requestedByUserId?: string | null;
  transferredByUserId?: string | null;
  notes?: string | null;
};

export type ApproveInventoryTransferInput = {
  transferId: string;
  approvedByUserId?: string | null;
};

export type ReceiveInventoryTransferInput = {
  transferId: string;
  receivedByUserId?: string | null;
};

export type CancelInventoryTransferInput = {
  transferId: string;
  cancelledByUserId?: string | null;
  cancellationReason?: string | null;
};

export type CreateSupplierInput = {
  clinicId: string;
  supplierCode: string;
  displayName: string;
  contactName?: string | null;
  phoneNumber?: string | null;
  email?: string | null;
  address?: string | null;
  status?: SupplierStatus;
  notes?: string | null;
};

export type UpdateSupplierInput = {
  supplierId: string;
  supplierCode?: string;
  displayName?: string;
  contactName?: string | null;
  phoneNumber?: string | null;
  email?: string | null;
  address?: string | null;
  status?: SupplierStatus;
  notes?: string | null;
};

export type CreatePurchaseOrderInput = {
  clinicId: string;
  supplierId?: string | null;
  purchaseOrderNumber: string;
  status?: PurchaseOrderStatus;
  orderedAt?: string | null;
  expectedAt?: string | null;
  createdByUserId?: string | null;
  notes?: string | null;
  lines: Array<{
    inventoryItemId: string;
    description: string;
    orderedQuantity: number | string;
    unitPriceAmount?: number | string;
    notes?: string | null;
  }>;
};

export type UpdatePurchaseOrderInput = {
  purchaseOrderId: string;
  supplierId?: string | null;
  status?: PurchaseOrderStatus;
  orderedAt?: string | null;
  expectedAt?: string | null;
  notes?: string | null;
};

export type ReceivePurchaseOrderInput = {
  purchaseOrderId: string;
  purchaseOrderLineId: string;
  inventoryLocationId?: string | null;
  binLabel?: string | null;
  lotNumber: string;
  lotBarcode?: string | null;
  scannedBarcode?: string | null;
  requireBarcodeVerification?: boolean;
  expiresOn?: string | null;
  quantity: number | string;
  receivedByUserId?: string | null;
  notes?: string | null;
};

export type SubmitPurchaseOrderInput = {
  purchaseOrderId: string;
  submittedByUserId?: string | null;
};

export type ApprovePurchaseOrderInput = {
  purchaseOrderId: string;
  approvalStepId?: string | null;
  approvedByUserId?: string | null;
  approverRole?: UserRole | null;
};

export type RejectPurchaseOrderInput = {
  purchaseOrderId: string;
  approvalStepId?: string | null;
  rejectedByUserId?: string | null;
  approverRole?: UserRole | null;
  rejectionReason: string;
};

export type CreatePurchaseOrderApprovalPolicyInput = {
  clinicId: string;
  policyName: string;
  minTotalAmount?: number | string;
  maxTotalAmount?: number | string | null;
  approvalSequence: number;
  requiredRole?: UserRole;
  isActive?: boolean;
  notes?: string | null;
};

export type UpdatePurchaseOrderApprovalPolicyInput = {
  policyId: string;
  policyName?: string;
  minTotalAmount?: number | string;
  maxTotalAmount?: number | string | null;
  approvalSequence?: number;
  requiredRole?: UserRole;
  isActive?: boolean;
  notes?: string | null;
};

export type CreateInventoryPrinterProfileInput = {
  clinicId: string;
  profileName: string;
  printerLanguage?: InventoryBarcodePrintLanguage;
  connectionType?: InventoryPrinterConnectionType;
  endpointUrl?: string | null;
  locationName?: string | null;
  isDefault?: boolean;
  isActive?: boolean;
  notes?: string | null;
};

export type UpdateInventoryPrinterProfileInput = {
  profileId: string;
  profileName?: string;
  printerLanguage?: InventoryBarcodePrintLanguage;
  connectionType?: InventoryPrinterConnectionType;
  endpointUrl?: string | null;
  locationName?: string | null;
  isDefault?: boolean;
  isActive?: boolean;
  notes?: string | null;
};

export type CreateDrugInteractionRuleInput = {
  clinicId: string;
  primaryDrugCatalogId?: string | null;
  interactingDrugCatalogId?: string | null;
  primaryRxnormCode?: string | null;
  interactingRxnormCode?: string | null;
  primaryMedicationName?: string | null;
  interactingMedicationName?: string | null;
  severity?: DrugInteractionSeverity;
  description: string;
  recommendation?: string | null;
  isActive?: boolean;
};

export type UpdateDrugInteractionRuleInput = {
  interactionRuleId: string;
  primaryDrugCatalogId?: string | null;
  interactingDrugCatalogId?: string | null;
  primaryRxnormCode?: string | null;
  interactingRxnormCode?: string | null;
  primaryMedicationName?: string | null;
  interactingMedicationName?: string | null;
  severity?: DrugInteractionSeverity;
  description?: string;
  recommendation?: string | null;
  isActive?: boolean;
};

export type AssessPrescriptionSafetyInput = {
  patientId: string;
  medicationName: string;
  rxnormCode?: string | null;
  drugCatalogId?: string | null;
};

export type AssessPrescriptionSafetyResult = {
  warnings: PrescriptionSafetyWarning[];
  checkedAt: string;
  drugCatalogId?: string | null;
};

export type CreatePrescriptionInput = {
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
  status?: PrescriptionStatus;
  startDate?: string | null;
  endDate?: string | null;
  safetyWarnings?: unknown[];
  safetyOverrideReason?: string | null;
  safetyOverriddenAt?: string | null;
  safetyOverriddenByUserId?: string | null;
  safetyOverriddenByPractitionerId?: string | null;
};

export type UpdatePrescriptionInput = {
  prescriptionId: string;
  prescribedByPractitionerId?: string | null;
  drugCatalogId?: string | null;
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
  safetyWarnings?: unknown[];
  safetyOverrideReason?: string | null;
  safetyOverriddenAt?: string | null;
  safetyOverriddenByUserId?: string | null;
  safetyOverriddenByPractitionerId?: string | null;
};

export type DispensePrescriptionInput = {
  prescriptionId: string;
  inventoryItemId: string;
  inventoryLotId?: string | null;
  inventoryLocationId?: string | null;
  scannedBarcode?: string | null;
  requireBarcodeVerification?: boolean;
  quantity: number | string;
  expiryOverrideReason?: string | null;
  fefoOverrideReason?: string | null;
  dispensedByUserId?: string | null;
  witnessUserId?: string | null;
  witnessLoginCode?: string | null;
  witnessNote?: string | null;
  notes?: string | null;
};

export type ScanInventoryBarcodeInput = {
  clinicId: string;
  barcode: string;
  scanContext?: InventoryBarcodeScanContext;
  scannedByUserId?: string | null;
  notes?: string | null;
};

export type CreateInventoryBarcodePrintJobInput = {
  clinicId: string;
  printerLanguage?: InventoryBarcodePrintLanguage;
  printerProfileId?: string | null;
  requestedByUserId?: string | null;
  notes?: string | null;
  labels: Array<{
    type?: string | null;
    title: string;
    subtitle?: string | null;
    barcode: string;
    detail?: string | null;
  }>;
};

export type CreateInvoiceInput = {
  clinicId: string;
  patientId: string;
  appointmentId?: string | null;
  visitId?: string | null;
  encounterId?: string | null;
  invoiceNumber: string;
  status?: InvoiceStatus;
  currency?: string;
  issuedAt?: string | null;
  dueAt?: string | null;
  receiptNumber?: string | null;
  taxInvoiceNumber?: string | null;
  receiptIssuedAt?: string | null;
  notes?: string | null;
  lineItems: Array<{
    itemType?: InvoiceLineItemType;
    description: string;
    referenceType?: string | null;
    referenceId?: string | null;
    quantity: number | string;
    unitPriceAmount: number | string;
    discountAmount?: number | string | null;
    taxAmount?: number | string | null;
  }>;
};

export type UpdateInvoiceInput = {
  invoiceId: string;
  status?: InvoiceStatus;
  receiptNumber?: string | null;
  taxInvoiceNumber?: string | null;
  receiptIssuedAt?: string | null;
  notes?: string | null;
  lineItems?: CreateInvoiceInput['lineItems'];
};

export type CreateInvoiceFromEncounterInput = {
  clinicId: string;
  patientId: string;
  encounterId: string;
  invoiceNumber: string;
  includeVisitCharge?: boolean;
  includePrescriptions?: boolean;
  receiptNumber?: string | null;
  taxInvoiceNumber?: string | null;
  notes?: string | null;
};

export type RecordInvoicePaymentInput = {
  invoiceId: string;
  paymentNumber: string;
  method: PaymentMethod;
  amount: number | string;
  paidAt?: string | null;
  receivedByUserId?: string | null;
  referenceNumber?: string | null;
  notes?: string | null;
};

export type RecordInvoiceRefundInput = {
  invoiceId: string;
  refundNumber: string;
  method: PaymentMethod;
  amount: number | string;
  refundedAt?: string | null;
  refundedByUserId?: string | null;
  referenceNumber?: string | null;
  notes?: string | null;
};

export type VoidInvoiceInput = {
  invoiceId: string;
  voidReason: string;
};

export type CreateChargeTemplateInput = {
  clinicId: string;
  code: string;
  description: string;
  itemType?: InvoiceLineItemType;
  unitPriceAmount: number | string;
  taxAmount?: number | string | null;
  isActive?: boolean;
  notes?: string | null;
};

export type UpdateChargeTemplateInput = {
  chargeTemplateId: string;
  code?: string;
  description?: string;
  itemType?: InvoiceLineItemType;
  unitPriceAmount?: number | string;
  taxAmount?: number | string | null;
  isActive?: boolean;
  notes?: string | null;
};

export type CreateInsuranceClaimInput = {
  clinicId: string;
  patientId: string;
  invoiceId: string;
  claimNumber: string;
  insurerName: string;
  policyNumber?: string | null;
  status?: InsuranceClaimStatus;
  approvedAmount?: number | string;
  paidAmount?: number | string;
  submittedAt?: string | null;
  adjudicatedAt?: string | null;
  rejectionReason?: string | null;
  notes?: string | null;
};

export type UpdateInsuranceClaimInput = {
  insuranceClaimId: string;
  status?: InsuranceClaimStatus;
  insurerName?: string;
  policyNumber?: string | null;
  approvedAmount?: number | string;
  paidAmount?: number | string;
  submittedAt?: string | null;
  adjudicatedAt?: string | null;
  rejectionReason?: string | null;
  notes?: string | null;
};

export type CreateBillingNumberSequenceInput = {
  clinicId: string;
  documentType: BillingDocumentType;
  prefix: string;
  nextNumber?: number;
  padding?: number;
  isActive?: boolean;
};

export type IssueBillingNumberInput = {
  clinicId: string;
  documentType: BillingDocumentType;
};

export type CreateCashierReconciliationInput = {
  clinicId: string;
  reconciliationDate: string;
  openingCashAmount?: number | string;
  openedByUserId?: string | null;
  notes?: string | null;
};

export type CloseCashierReconciliationInput = {
  reconciliationId: string;
  countedCashAmount: number | string;
  closedByUserId?: string | null;
  notes?: string | null;
};

export type Dependencies = {
  createAuthSession?: (input: CreateAuthSessionInput) => Promise<AuthSession | AuthSessionFailure | null>;
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
  getBillingSummaryReport?: (input: {
    clinicId: string;
    startDate: string;
    endDate: string;
  }) => Promise<unknown | null>;
  getPharmacyOverrideReport?: (input: {
    clinicId: string;
    startDate: string;
    endDate: string;
  }) => Promise<unknown | null>;
  getControlledSubstanceRegister?: (input: {
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
  listRolePermissions?: (input: { clinicId: string }) => Promise<unknown[]>;
  upsertRolePermission?: (input: RolePermissionOverrideInput) => Promise<unknown>;
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
  listDrugCatalog?: (input: {
    clinicId: string;
    search?: string;
    active?: DrugCatalogActiveFilter;
    limit?: number;
    offset?: number;
  }) => Promise<PaginatedListResult>;
  createDrugCatalogItem?: (input: CreateDrugCatalogItemInput) => Promise<unknown>;
  updateDrugCatalogItem?: (input: UpdateDrugCatalogItemInput) => Promise<unknown | null>;
  listInventoryItems?: (input: {
    clinicId: string;
    search?: string;
    active?: DrugCatalogActiveFilter;
    lowStock?: boolean;
    limit?: number;
    offset?: number;
  }) => Promise<PaginatedListResult>;
  createInventoryItem?: (input: CreateInventoryItemInput) => Promise<unknown>;
  updateInventoryItem?: (input: UpdateInventoryItemInput) => Promise<unknown | null>;
  adjustInventoryStock?: (input: AdjustInventoryStockInput) => Promise<unknown | null>;
  listInventoryLocations?: (input: {
    clinicId: string;
    active?: DrugCatalogActiveFilter;
    limit?: number;
    offset?: number;
  }) => Promise<PaginatedListResult>;
  createInventoryLocation?: (input: CreateInventoryLocationInput) => Promise<unknown>;
  updateInventoryLocation?: (input: UpdateInventoryLocationInput) => Promise<unknown | null>;
  listInventoryLocationStocks?: (input: {
    clinicId: string;
    inventoryItemId?: string;
    inventoryLocationId?: string;
    includeEmpty?: boolean;
    limit?: number;
    offset?: number;
  }) => Promise<PaginatedListResult>;
  listInventoryTransfers?: (input: {
    clinicId: string;
    inventoryItemId?: string;
    status?: 'pending' | 'in_transit' | 'completed' | 'cancelled' | 'all';
    limit?: number;
    offset?: number;
  }) => Promise<PaginatedListResult>;
  createInventoryTransfer?: (input: CreateInventoryTransferInput) => Promise<unknown | null>;
  approveInventoryTransfer?: (input: ApproveInventoryTransferInput) => Promise<unknown | null>;
  receiveInventoryTransfer?: (input: ReceiveInventoryTransferInput) => Promise<unknown | null>;
  cancelInventoryTransfer?: (input: CancelInventoryTransferInput) => Promise<unknown | null>;
  listInventoryLots?: (input: {
    clinicId: string;
    inventoryItemId?: string;
    inventoryLocationId?: string;
    expiringBefore?: string;
    includeEmpty?: boolean;
    limit?: number;
    offset?: number;
  }) => Promise<PaginatedListResult>;
  receiveInventoryLot?: (input: ReceiveInventoryLotInput) => Promise<unknown | null>;
  scanInventoryBarcode?: (input: ScanInventoryBarcodeInput) => Promise<unknown | null>;
  createInventoryBarcodePrintJob?: (
    input: CreateInventoryBarcodePrintJobInput
  ) => Promise<unknown | null>;
  listInventoryPrinterProfiles?: (input: {
    clinicId: string;
    active?: DrugCatalogActiveFilter;
    limit?: number;
    offset?: number;
  }) => Promise<PaginatedListResult>;
  createInventoryPrinterProfile?: (
    input: CreateInventoryPrinterProfileInput
  ) => Promise<unknown>;
  updateInventoryPrinterProfile?: (
    input: UpdateInventoryPrinterProfileInput
  ) => Promise<unknown | null>;
  listSuppliers?: (input: {
    clinicId: string;
    search?: string;
    status?: SupplierStatus | 'all';
    limit?: number;
    offset?: number;
  }) => Promise<PaginatedListResult>;
  createSupplier?: (input: CreateSupplierInput) => Promise<unknown>;
  updateSupplier?: (input: UpdateSupplierInput) => Promise<unknown | null>;
  listPurchaseOrders?: (input: {
    clinicId: string;
    supplierId?: string;
    status?: PurchaseOrderStatus | 'all';
    approvalStatus?: PurchaseOrderApprovalStatus | 'all';
    limit?: number;
    offset?: number;
  }) => Promise<PaginatedListResult>;
  createPurchaseOrder?: (input: CreatePurchaseOrderInput) => Promise<unknown | null>;
  updatePurchaseOrder?: (input: UpdatePurchaseOrderInput) => Promise<unknown | null>;
  submitPurchaseOrder?: (input: SubmitPurchaseOrderInput) => Promise<unknown | null>;
  approvePurchaseOrder?: (input: ApprovePurchaseOrderInput) => Promise<unknown | null>;
  rejectPurchaseOrder?: (input: RejectPurchaseOrderInput) => Promise<unknown | null>;
  receivePurchaseOrder?: (input: ReceivePurchaseOrderInput) => Promise<unknown | null>;
  listPurchaseOrderApprovalPolicies?: (input: {
    clinicId: string;
    active?: AdminActiveFilter;
    limit?: number;
    offset?: number;
  }) => Promise<PaginatedListResult>;
  createPurchaseOrderApprovalPolicy?: (
    input: CreatePurchaseOrderApprovalPolicyInput
  ) => Promise<unknown>;
  updatePurchaseOrderApprovalPolicy?: (
    input: UpdatePurchaseOrderApprovalPolicyInput
  ) => Promise<unknown | null>;
  listStockMovements?: (input: {
    clinicId: string;
    inventoryItemId?: string;
    inventoryLocationId?: string;
    limit?: number;
    offset?: number;
  }) => Promise<PaginatedListResult>;
  listDrugInteractionRules?: (input: {
    clinicId: string;
    active?: DrugCatalogActiveFilter;
    limit?: number;
    offset?: number;
  }) => Promise<PaginatedListResult>;
  createDrugInteractionRule?: (input: CreateDrugInteractionRuleInput) => Promise<unknown>;
  updateDrugInteractionRule?: (
    input: UpdateDrugInteractionRuleInput
  ) => Promise<unknown | null>;
  assessPrescriptionSafety?: (
    input: AssessPrescriptionSafetyInput
  ) => Promise<AssessPrescriptionSafetyResult>;
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
  listMedicationDispenses?: (input: {
    clinicId?: string;
    prescriptionId?: string;
    limit?: number;
    offset?: number;
  }) => Promise<PaginatedListResult>;
  dispensePrescription?: (input: DispensePrescriptionInput) => Promise<unknown | null>;
  listInvoices?: (input: {
    clinicId: string;
    patientId?: string;
    status?: InvoiceStatus;
    limit?: number;
    offset?: number;
  }) => Promise<PaginatedListResult>;
  getInvoiceById?: (input: { invoiceId: string }) => Promise<unknown | null>;
  createInvoice?: (input: CreateInvoiceInput) => Promise<unknown>;
  updateInvoice?: (input: UpdateInvoiceInput) => Promise<unknown | null>;
  createInvoiceFromEncounter?: (input: CreateInvoiceFromEncounterInput) => Promise<unknown | null>;
  recordInvoicePayment?: (input: RecordInvoicePaymentInput) => Promise<unknown | null>;
  recordInvoiceRefund?: (input: RecordInvoiceRefundInput) => Promise<unknown | null>;
  voidInvoice?: (input: VoidInvoiceInput) => Promise<unknown | null>;
  listChargeTemplates?: (input: {
    clinicId: string;
    active?: AdminActiveFilter;
    limit?: number;
    offset?: number;
  }) => Promise<PaginatedListResult>;
  createChargeTemplate?: (input: CreateChargeTemplateInput) => Promise<unknown>;
  updateChargeTemplate?: (input: UpdateChargeTemplateInput) => Promise<unknown | null>;
  listInsuranceClaims?: (input: {
    clinicId: string;
    invoiceId?: string;
    status?: InsuranceClaimStatus;
    limit?: number;
    offset?: number;
  }) => Promise<PaginatedListResult>;
  createInsuranceClaim?: (input: CreateInsuranceClaimInput) => Promise<unknown>;
  updateInsuranceClaim?: (input: UpdateInsuranceClaimInput) => Promise<unknown | null>;
  listBillingNumberSequences?: (input: { clinicId: string }) => Promise<unknown[]>;
  createBillingNumberSequence?: (input: CreateBillingNumberSequenceInput) => Promise<unknown>;
  issueBillingNumber?: (input: IssueBillingNumberInput) => Promise<{ documentNumber: string } | null>;
  listCashierReconciliations?: (input: {
    clinicId: string;
    status?: CashierReconciliationStatus;
    limit?: number;
    offset?: number;
  }) => Promise<PaginatedListResult>;
  createCashierReconciliation?: (input: CreateCashierReconciliationInput) => Promise<unknown>;
  closeCashierReconciliation?: (input: CloseCashierReconciliationInput) => Promise<unknown | null>;
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
    permission_overrides?: Record<string, boolean>;
  } | null>;
  resolveOidcActor?: (input: { oidcSubject: string }) => Promise<{
    user_id: string;
    role: UserRole;
    practitioner_id: string | null;
    clinic_id: string;
    display_name: string;
    permission_overrides?: Record<string, boolean>;
  } | null>;
  healthCheck: () => Promise<void>;
  apiToken?: string;
  sessionAuthSecret?: string;
  oidcAuth?: {
    issuer: string;
    audience: string;
    hs256Secret?: string;
    rs256PublicKeyPem?: string;
    rs256PublicKeysByKid?: Record<string, string>;
    subjectClaim?: string;
    requiredMfaClaim?: string;
    requiredMfaValues?: string[];
  };
};

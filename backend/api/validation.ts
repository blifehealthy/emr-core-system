import type {
  AttachmentTargetType,
  AllergySeverity,
  AllergyStatus,
  AppointmentStatus,
  ClinicVisitStatus,
  ConsentStatus,
  PatientConditionStatus,
  PatientFlagSeverity,
  PatientFlagStatus,
  PatientMedicationStatus,
  PatientSexAtBirth,
  CreateAttachmentLinkInput,
  CreateAppointmentInput,
  CreateClinicVisitInput,
  CreateClinicalNoteTemplateInput,
  CreateConsentRecordInput,
  CreateFileAssetInput,
  CreateDrugCatalogItemInput,
  CreateDrugInteractionRuleInput,
  CreateInventoryItemInput,
  ReceiveInventoryLotInput,
  CreateSupplierInput,
  UpdateSupplierInput,
  CreatePurchaseOrderInput,
  UpdatePurchaseOrderInput,
  ReceivePurchaseOrderInput,
  SubmitPurchaseOrderInput,
  ApprovePurchaseOrderInput,
  RejectPurchaseOrderInput,
  CreatePurchaseOrderApprovalPolicyInput,
  UpdatePurchaseOrderApprovalPolicyInput,
  InventoryBarcodeScanContext,
  InventoryBarcodePrintLanguage,
  InventoryPrinterConnectionType,
  CreateInventoryBarcodePrintJobInput,
  CreateInventoryPrinterProfileInput,
  UpdateInventoryPrinterProfileInput,
  ScanInventoryBarcodeInput,
  UpdateInventoryItemInput,
  AdjustInventoryStockInput,
  DispensePrescriptionInput,
  UploadFileAssetInput,
  CreatePatientInput,
  CreatePatientAllergyInput,
  CreatePatientConditionInput,
  CreatePatientFlagInput,
  CreatePatientMedicationInput,
  CreateDiagnosisInput,
  CreateEncounterInput,
  CreatePractitionerValidatedInput,
  CreatePrescriptionInput,
  CreateInvoiceInput,
  UpdateInvoiceInput,
  CreateInvoiceFromEncounterInput,
  CreateUserValidatedInput,
  CreateVitalSignInput,
  DiagnosisStatus,
  DiagnosisType,
  EncounterClass,
  EncounterStatus,
  UpdateEncounterInput,
  UpdateDrugCatalogItemInput,
  UpdateDrugInteractionRuleInput,
  UpdateDiagnosisInput,
  FinalizeClinicalNoteInput,
  SignClinicalNoteInput,
  UpdateAppointmentInput,
  UpdateClinicVisitInput,
  UpdateClinicalNoteTemplateInput,
  UpsertClinicSettingsInput,
  UpdateConsentRecordInput,
  UpdatePatientAllergyInput,
  UpdatePatientConditionInput,
  UpdatePatientFlagInput,
  UpdatePatientMedicationInput,
  UpdateSoapNoteInput,
  UpdatePractitionerValidatedInput,
  UpdatePrescriptionInput,
  RecordInvoicePaymentInput,
  RecordInvoiceRefundInput,
  VoidInvoiceInput,
  CreateChargeTemplateInput,
  UpdateChargeTemplateInput,
  CreateInsuranceClaimInput,
  CreateBillingNumberSequenceInput,
  CreateCashierReconciliationInput,
  CloseCashierReconciliationInput,
  IssueBillingNumberInput,
  UpdateInsuranceClaimInput,
  UpdateUserValidatedInput,
  UpdateVitalSignInput,
  UserRole,
  PrescriptionStatus,
  AssessPrescriptionSafetyInput,
  DrugInteractionSeverity,
  InvoiceLineItemType,
  InvoiceStatus,
  InsuranceClaimStatus,
  BillingDocumentType,
  CashierReconciliationStatus,
  PaymentMethod,
  StockMovementType,
  SupplierStatus,
  PurchaseOrderStatus,
} from './types.ts';

const clinicVisitStatuses: ClinicVisitStatus[] = [
  'waiting',
  'in_room',
  'with_doctor',
  'completed',
  'discharged',
  'cancelled',
];
const invoiceStatuses: InvoiceStatus[] = ['draft', 'issued', 'partially_paid', 'paid', 'voided'];
const insuranceClaimStatuses: InsuranceClaimStatus[] = [
  'draft',
  'submitted',
  'accepted',
  'rejected',
  'paid',
  'cancelled',
];
const invoiceLineItemTypes: InvoiceLineItemType[] = [
  'visit',
  'procedure',
  'medication',
  'lab',
  'discount',
  'other',
];
const paymentMethods: PaymentMethod[] = [
  'cash',
  'card',
  'bank_transfer',
  'qr',
  'insurance',
  'other',
];
const billingDocumentTypes: BillingDocumentType[] = ['invoice', 'receipt', 'tax_invoice', 'claim'];
const cashierReconciliationStatuses: CashierReconciliationStatus[] = ['open', 'closed', 'cancelled'];
const manualStockMovementTypes: Array<Exclude<StockMovementType, 'dispense'>> = [
  'adjustment_in',
  'adjustment_out',
  'return',
];
const inventoryBarcodeScanContexts: InventoryBarcodeScanContext[] = ['lookup', 'receiving', 'dispensing'];
const inventoryBarcodePrintLanguages: InventoryBarcodePrintLanguage[] = ['html', 'zpl', 'escpos'];
const inventoryPrinterConnectionTypes: InventoryPrinterConnectionType[] = [
  'browser',
  'network',
  'utility_bridge',
];
const userRoles: UserRole[] = ['doctor', 'nurse', 'admin'];
const supplierStatuses: SupplierStatus[] = ['active', 'inactive'];
const purchaseOrderStatuses: PurchaseOrderStatus[] = [
  'draft',
  'ordered',
  'partially_received',
  'received',
  'cancelled',
];

export function validateCreateAuthSessionBody(body: unknown):
  | { ok: true; value: { clinicId: string; username: string; loginCode: string } }
  | { ok: false; error: string } {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { ok: false, error: 'Request body must be a JSON object' };
  }

  const candidate = body as Record<string, unknown>;
  const clinicId = readRequiredString(candidate.clinicId, 'clinicId');
  if (!clinicId.ok) return clinicId;

  const username = readRequiredString(candidate.username, 'username');
  if (!username.ok) return username;

  const loginCode = readRequiredString(candidate.loginCode, 'loginCode');
  if (!loginCode.ok) return loginCode;

  return {
    ok: true,
    value: {
      clinicId: clinicId.value,
      username: username.value,
      loginCode: loginCode.value,
    },
  };
}

export function validateCreateInvoiceBody(body: unknown):
  | { ok: true; value: CreateInvoiceInput }
  | { ok: false; error: string } {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { ok: false, error: 'Request body must be a JSON object' };
  }

  const candidate = body as Record<string, unknown>;
  const clinicId = readRequiredString(candidate.clinicId, 'clinicId');
  if (!clinicId.ok) return clinicId;
  const patientId = readRequiredString(candidate.patientId, 'patientId');
  if (!patientId.ok) return patientId;
  const invoiceNumber = readRequiredString(candidate.invoiceNumber, 'invoiceNumber');
  if (!invoiceNumber.ok) return invoiceNumber;

  const status = readEnumValue<InvoiceStatus>(candidate.status, 'status', invoiceStatuses);
  if (!status.ok) return status;

  if (!Array.isArray(candidate.lineItems) || candidate.lineItems.length === 0) {
    return { ok: false, error: 'lineItems must be a non-empty array' };
  }

  const lineItems: CreateInvoiceInput['lineItems'] = [];
  for (const [index, item] of candidate.lineItems.entries()) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      return { ok: false, error: `lineItems[${index}] must be an object` };
    }

    const entry = item as Record<string, unknown>;
    const description = readRequiredString(entry.description, `lineItems[${index}].description`);
    if (!description.ok) return description;
    const itemType = readEnumValue<InvoiceLineItemType>(
      entry.itemType,
      `lineItems[${index}].itemType`,
      invoiceLineItemTypes
    );
    if (!itemType.ok) return itemType;
    const quantity = readPositiveNumberLikeValue(entry.quantity, `lineItems[${index}].quantity`);
    if (!quantity.ok) return quantity;
    const unitPriceAmount = readNonNegativeNumberLikeValue(
      entry.unitPriceAmount,
      `lineItems[${index}].unitPriceAmount`
    );
    if (!unitPriceAmount.ok) return unitPriceAmount;
    const discountAmount = readOptionalNonNegativeNumberLikeValue(
      entry.discountAmount,
      `lineItems[${index}].discountAmount`
    );
    if (!discountAmount.ok) return discountAmount;
    const taxAmount = readOptionalNonNegativeNumberLikeValue(
      entry.taxAmount,
      `lineItems[${index}].taxAmount`
    );
    if (!taxAmount.ok) return taxAmount;

    const referenceType = readOptionalNullableStringField(entry, 'referenceType');
    if (!referenceType.ok) return referenceType;
    const referenceId = readOptionalNullableStringField(entry, 'referenceId');
    if (!referenceId.ok) return referenceId;

    lineItems.push({
      itemType: itemType.value,
      description: description.value,
      referenceType: referenceType.value,
      referenceId: referenceId.value,
      quantity: quantity.value,
      unitPriceAmount: unitPriceAmount.value,
      discountAmount: discountAmount.value,
      taxAmount: taxAmount.value,
    });
  }

  const appointmentId = readOptionalNullableStringField(candidate, 'appointmentId');
  if (!appointmentId.ok) return appointmentId;
  const visitId = readOptionalNullableStringField(candidate, 'visitId');
  if (!visitId.ok) return visitId;
  const encounterId = readOptionalNullableStringField(candidate, 'encounterId');
  if (!encounterId.ok) return encounterId;
  const issuedAt = readOptionalNullableStringField(candidate, 'issuedAt');
  if (!issuedAt.ok) return issuedAt;
  const dueAt = readOptionalNullableStringField(candidate, 'dueAt');
  if (!dueAt.ok) return dueAt;
  const receiptNumber = readOptionalNullableStringField(candidate, 'receiptNumber');
  if (!receiptNumber.ok) return receiptNumber;
  const taxInvoiceNumber = readOptionalNullableStringField(candidate, 'taxInvoiceNumber');
  if (!taxInvoiceNumber.ok) return taxInvoiceNumber;
  const receiptIssuedAt = readOptionalNullableStringField(candidate, 'receiptIssuedAt');
  if (!receiptIssuedAt.ok) return receiptIssuedAt;
  const notes = readOptionalNullableStringField(candidate, 'notes');
  if (!notes.ok) return notes;

  return {
    ok: true,
    value: {
      clinicId: clinicId.value,
      patientId: patientId.value,
      appointmentId: appointmentId.value,
      visitId: visitId.value,
      encounterId: encounterId.value,
      invoiceNumber: invoiceNumber.value,
      status: status.value,
      currency:
        typeof candidate.currency === 'string' && candidate.currency.trim().length > 0
          ? candidate.currency.trim().toUpperCase()
          : undefined,
      issuedAt: issuedAt.value,
      dueAt: dueAt.value,
      ...(receiptNumber.value !== undefined ? { receiptNumber: receiptNumber.value } : {}),
      ...(taxInvoiceNumber.value !== undefined ? { taxInvoiceNumber: taxInvoiceNumber.value } : {}),
      ...(receiptIssuedAt.value !== undefined ? { receiptIssuedAt: receiptIssuedAt.value } : {}),
      notes: notes.value,
      lineItems,
    },
  };
}

export function validateUpdateInvoiceBody(
  body: unknown,
  invoiceId: string
): { ok: true; value: UpdateInvoiceInput } | { ok: false; error: string } {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { ok: false, error: 'Request body must be a JSON object' };
  }

  const candidate = body as Record<string, unknown>;
  const status = readEnumValue<InvoiceStatus>(candidate.status, 'status', invoiceStatuses);
  if (!status.ok) return status;
  const receiptNumber = readOptionalNullableStringField(candidate, 'receiptNumber');
  if (!receiptNumber.ok) return receiptNumber;
  const taxInvoiceNumber = readOptionalNullableStringField(candidate, 'taxInvoiceNumber');
  if (!taxInvoiceNumber.ok) return taxInvoiceNumber;
  const receiptIssuedAt = readOptionalNullableStringField(candidate, 'receiptIssuedAt');
  if (!receiptIssuedAt.ok) return receiptIssuedAt;
  const notes = readOptionalNullableStringField(candidate, 'notes');
  if (!notes.ok) return notes;

  let lineItems: UpdateInvoiceInput['lineItems'];
  if (candidate.lineItems !== undefined) {
    if (!Array.isArray(candidate.lineItems) || candidate.lineItems.length === 0) {
      return { ok: false, error: 'lineItems must be a non-empty array' };
    }
    lineItems = [];
    for (const [index, item] of candidate.lineItems.entries()) {
      if (!item || typeof item !== 'object' || Array.isArray(item)) {
        return { ok: false, error: `lineItems[${index}] must be an object` };
      }
      const entry = item as Record<string, unknown>;
      const description = readRequiredString(entry.description, `lineItems[${index}].description`);
      if (!description.ok) return description;
      const itemType = readEnumValue<InvoiceLineItemType>(
        entry.itemType,
        `lineItems[${index}].itemType`,
        invoiceLineItemTypes
      );
      if (!itemType.ok) return itemType;
      const quantity = readPositiveNumberLikeValue(entry.quantity, `lineItems[${index}].quantity`);
      if (!quantity.ok) return quantity;
      const unitPriceAmount = readNonNegativeNumberLikeValue(
        entry.unitPriceAmount,
        `lineItems[${index}].unitPriceAmount`
      );
      if (!unitPriceAmount.ok) return unitPriceAmount;
      const discountAmount = readOptionalNonNegativeNumberLikeValue(
        entry.discountAmount,
        `lineItems[${index}].discountAmount`
      );
      if (!discountAmount.ok) return discountAmount;
      const taxAmount = readOptionalNonNegativeNumberLikeValue(entry.taxAmount, `lineItems[${index}].taxAmount`);
      if (!taxAmount.ok) return taxAmount;
      const referenceType = readOptionalNullableStringField(entry, 'referenceType');
      if (!referenceType.ok) return referenceType;
      const referenceId = readOptionalNullableStringField(entry, 'referenceId');
      if (!referenceId.ok) return referenceId;

      lineItems.push({
        itemType: itemType.value,
        description: description.value,
        referenceType: referenceType.value,
        referenceId: referenceId.value,
        quantity: quantity.value,
        unitPriceAmount: unitPriceAmount.value,
        discountAmount: discountAmount.value,
        taxAmount: taxAmount.value,
      });
    }
  }

  return {
    ok: true,
    value: {
      invoiceId,
      status: status.value,
      receiptNumber: receiptNumber.value,
      taxInvoiceNumber: taxInvoiceNumber.value,
      receiptIssuedAt: receiptIssuedAt.value,
      notes: notes.value,
      lineItems,
    },
  };
}

export function validateCreateInvoiceFromEncounterBody(body: unknown):
  | { ok: true; value: CreateInvoiceFromEncounterInput }
  | { ok: false; error: string } {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { ok: false, error: 'Request body must be a JSON object' };
  }
  const candidate = body as Record<string, unknown>;
  const clinicId = readRequiredString(candidate.clinicId, 'clinicId');
  if (!clinicId.ok) return clinicId;
  const patientId = readRequiredString(candidate.patientId, 'patientId');
  if (!patientId.ok) return patientId;
  const encounterId = readRequiredString(candidate.encounterId, 'encounterId');
  if (!encounterId.ok) return encounterId;
  const invoiceNumber = readRequiredString(candidate.invoiceNumber, 'invoiceNumber');
  if (!invoiceNumber.ok) return invoiceNumber;
  const includeVisitCharge = readOptionalBooleanField(candidate, 'includeVisitCharge');
  if (!includeVisitCharge.ok) return includeVisitCharge;
  const includePrescriptions = readOptionalBooleanField(candidate, 'includePrescriptions');
  if (!includePrescriptions.ok) return includePrescriptions;
  const receiptNumber = readOptionalNullableStringField(candidate, 'receiptNumber');
  if (!receiptNumber.ok) return receiptNumber;
  const taxInvoiceNumber = readOptionalNullableStringField(candidate, 'taxInvoiceNumber');
  if (!taxInvoiceNumber.ok) return taxInvoiceNumber;
  const notes = readOptionalNullableStringField(candidate, 'notes');
  if (!notes.ok) return notes;
  return {
    ok: true,
    value: {
      clinicId: clinicId.value,
      patientId: patientId.value,
      encounterId: encounterId.value,
      invoiceNumber: invoiceNumber.value,
      includeVisitCharge: includeVisitCharge.value,
      includePrescriptions: includePrescriptions.value,
      receiptNumber: receiptNumber.value,
      taxInvoiceNumber: taxInvoiceNumber.value,
      notes: notes.value,
    },
  };
}

export function validateRecordInvoicePaymentBody(
  body: unknown,
  invoiceId: string
): { ok: true; value: RecordInvoicePaymentInput } | { ok: false; error: string } {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { ok: false, error: 'Request body must be a JSON object' };
  }

  const candidate = body as Record<string, unknown>;
  const paymentNumber = readRequiredString(candidate.paymentNumber, 'paymentNumber');
  if (!paymentNumber.ok) return paymentNumber;
  const method = readRequiredEnumValue<PaymentMethod>(candidate.method, 'method', paymentMethods);
  if (!method.ok) return method;
  const amount = readPositiveNumberLikeValue(candidate.amount, 'amount');
  if (!amount.ok) return amount;

  const paidAt = readOptionalNullableStringField(candidate, 'paidAt');
  if (!paidAt.ok) return paidAt;
  const receivedByUserId = readOptionalNullableStringField(candidate, 'receivedByUserId');
  if (!receivedByUserId.ok) return receivedByUserId;
  const referenceNumber = readOptionalNullableStringField(candidate, 'referenceNumber');
  if (!referenceNumber.ok) return referenceNumber;
  const notes = readOptionalNullableStringField(candidate, 'notes');
  if (!notes.ok) return notes;

  return {
    ok: true,
    value: {
      invoiceId,
      paymentNumber: paymentNumber.value,
      method: method.value,
      amount: amount.value,
      paidAt: paidAt.value,
      receivedByUserId: receivedByUserId.value,
      referenceNumber: referenceNumber.value,
      notes: notes.value,
    },
  };
}

export function validateRecordInvoiceRefundBody(
  body: unknown,
  invoiceId: string
): { ok: true; value: RecordInvoiceRefundInput } | { ok: false; error: string } {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { ok: false, error: 'Request body must be a JSON object' };
  }

  const candidate = body as Record<string, unknown>;
  const refundNumber = readRequiredString(candidate.refundNumber, 'refundNumber');
  if (!refundNumber.ok) return refundNumber;
  const method = readRequiredEnumValue<PaymentMethod>(candidate.method, 'method', paymentMethods);
  if (!method.ok) return method;
  const amount = readPositiveNumberLikeValue(candidate.amount, 'amount');
  if (!amount.ok) return amount;

  const refundedAt = readOptionalNullableStringField(candidate, 'refundedAt');
  if (!refundedAt.ok) return refundedAt;
  const refundedByUserId = readOptionalNullableStringField(candidate, 'refundedByUserId');
  if (!refundedByUserId.ok) return refundedByUserId;
  const referenceNumber = readOptionalNullableStringField(candidate, 'referenceNumber');
  if (!referenceNumber.ok) return referenceNumber;
  const notes = readOptionalNullableStringField(candidate, 'notes');
  if (!notes.ok) return notes;

  return {
    ok: true,
    value: {
      invoiceId,
      refundNumber: refundNumber.value,
      method: method.value,
      amount: amount.value,
      refundedAt: refundedAt.value,
      refundedByUserId: refundedByUserId.value,
      referenceNumber: referenceNumber.value,
      notes: notes.value,
    },
  };
}

export function validateVoidInvoiceBody(
  body: unknown,
  invoiceId: string
): { ok: true; value: VoidInvoiceInput } | { ok: false; error: string } {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { ok: false, error: 'Request body must be a JSON object' };
  }

  const candidate = body as Record<string, unknown>;
  const voidReason = readRequiredString(candidate.voidReason, 'voidReason');
  if (!voidReason.ok) return voidReason;

  return { ok: true, value: { invoiceId, voidReason: voidReason.value } };
}

export function validateCreateChargeTemplateBody(body: unknown):
  | { ok: true; value: CreateChargeTemplateInput }
  | { ok: false; error: string } {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { ok: false, error: 'Request body must be a JSON object' };
  }

  const candidate = body as Record<string, unknown>;
  const clinicId = readRequiredString(candidate.clinicId, 'clinicId');
  if (!clinicId.ok) return clinicId;
  const code = readRequiredString(candidate.code, 'code');
  if (!code.ok) return code;
  const description = readRequiredString(candidate.description, 'description');
  if (!description.ok) return description;
  const itemType = readEnumValue<InvoiceLineItemType>(candidate.itemType, 'itemType', invoiceLineItemTypes);
  if (!itemType.ok) return itemType;
  const unitPriceAmount = readNonNegativeNumberLikeValue(candidate.unitPriceAmount, 'unitPriceAmount');
  if (!unitPriceAmount.ok) return unitPriceAmount;
  const taxAmount = readOptionalNonNegativeNumberLikeValue(candidate.taxAmount, 'taxAmount');
  if (!taxAmount.ok) return taxAmount;
  const isActive = readOptionalBooleanField(candidate, 'isActive');
  if (!isActive.ok) return isActive;
  const notes = readOptionalNullableStringField(candidate, 'notes');
  if (!notes.ok) return notes;

  return {
    ok: true,
    value: {
      clinicId: clinicId.value,
      code: code.value,
      description: description.value,
      itemType: itemType.value,
      unitPriceAmount: unitPriceAmount.value,
      taxAmount: taxAmount.value,
      isActive: isActive.value,
      notes: notes.value,
    },
  };
}

export function validateUpdateChargeTemplateBody(
  body: unknown,
  chargeTemplateId: string
): { ok: true; value: UpdateChargeTemplateInput } | { ok: false; error: string } {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { ok: false, error: 'Request body must be a JSON object' };
  }

  const candidate = body as Record<string, unknown>;
  const code = readOptionalTrimmedStringField(candidate, 'code');
  if (!code.ok) return code;
  const description = readOptionalTrimmedStringField(candidate, 'description');
  if (!description.ok) return description;
  const itemType = readEnumValue<InvoiceLineItemType>(candidate.itemType, 'itemType', invoiceLineItemTypes);
  if (!itemType.ok) return itemType;
  const unitPriceAmount = readOptionalNonNegativeNumberLikeField(candidate, 'unitPriceAmount');
  if (!unitPriceAmount.ok) return unitPriceAmount;
  const taxAmount = readOptionalNonNegativeNumberLikeField(candidate, 'taxAmount');
  if (!taxAmount.ok) return taxAmount;
  const isActive = readOptionalBooleanField(candidate, 'isActive');
  if (!isActive.ok) return isActive;
  const notes = readOptionalNullableStringField(candidate, 'notes');
  if (!notes.ok) return notes;

  return {
    ok: true,
    value: {
      chargeTemplateId,
      code: code.value,
      description: description.value,
      itemType: itemType.value,
      unitPriceAmount: unitPriceAmount.value ?? undefined,
      taxAmount: taxAmount.value,
      isActive: isActive.value,
      notes: notes.value,
    },
  };
}

export function validateCreateInsuranceClaimBody(body: unknown):
  | { ok: true; value: CreateInsuranceClaimInput }
  | { ok: false; error: string } {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { ok: false, error: 'Request body must be a JSON object' };
  }
  const candidate = body as Record<string, unknown>;
  const clinicId = readRequiredString(candidate.clinicId, 'clinicId');
  if (!clinicId.ok) return clinicId;
  const patientId = readRequiredString(candidate.patientId, 'patientId');
  if (!patientId.ok) return patientId;
  const invoiceId = readRequiredString(candidate.invoiceId, 'invoiceId');
  if (!invoiceId.ok) return invoiceId;
  const claimNumber = readRequiredString(candidate.claimNumber, 'claimNumber');
  if (!claimNumber.ok) return claimNumber;
  const insurerName = readRequiredString(candidate.insurerName, 'insurerName');
  if (!insurerName.ok) return insurerName;
  const status = readEnumValue<InsuranceClaimStatus>(candidate.status, 'status', insuranceClaimStatuses);
  if (!status.ok) return status;
  const policyNumber = readOptionalNullableStringField(candidate, 'policyNumber');
  if (!policyNumber.ok) return policyNumber;
  const approvedAmount = readOptionalNonNegativeNumberLikeField(candidate, 'approvedAmount');
  if (!approvedAmount.ok) return approvedAmount;
  const paidAmount = readOptionalNonNegativeNumberLikeField(candidate, 'paidAmount');
  if (!paidAmount.ok) return paidAmount;
  const submittedAt = readOptionalNullableStringField(candidate, 'submittedAt');
  if (!submittedAt.ok) return submittedAt;
  const adjudicatedAt = readOptionalNullableStringField(candidate, 'adjudicatedAt');
  if (!adjudicatedAt.ok) return adjudicatedAt;
  const rejectionReason = readOptionalNullableStringField(candidate, 'rejectionReason');
  if (!rejectionReason.ok) return rejectionReason;
  const notes = readOptionalNullableStringField(candidate, 'notes');
  if (!notes.ok) return notes;
  return {
    ok: true,
    value: {
      clinicId: clinicId.value,
      patientId: patientId.value,
      invoiceId: invoiceId.value,
      claimNumber: claimNumber.value,
      insurerName: insurerName.value,
      status: status.value,
      policyNumber: policyNumber.value,
      approvedAmount: approvedAmount.value ?? undefined,
      paidAmount: paidAmount.value ?? undefined,
      submittedAt: submittedAt.value,
      adjudicatedAt: adjudicatedAt.value,
      rejectionReason: rejectionReason.value,
      notes: notes.value,
    },
  };
}

export function validateUpdateInsuranceClaimBody(
  body: unknown,
  insuranceClaimId: string
): { ok: true; value: UpdateInsuranceClaimInput } | { ok: false; error: string } {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { ok: false, error: 'Request body must be a JSON object' };
  }
  const candidate = body as Record<string, unknown>;
  const status = readEnumValue<InsuranceClaimStatus>(candidate.status, 'status', insuranceClaimStatuses);
  if (!status.ok) return status;
  const insurerName = readOptionalTrimmedStringField(candidate, 'insurerName');
  if (!insurerName.ok) return insurerName;
  const policyNumber = readOptionalNullableStringField(candidate, 'policyNumber');
  if (!policyNumber.ok) return policyNumber;
  const approvedAmount = readOptionalNonNegativeNumberLikeField(candidate, 'approvedAmount');
  if (!approvedAmount.ok) return approvedAmount;
  const paidAmount = readOptionalNonNegativeNumberLikeField(candidate, 'paidAmount');
  if (!paidAmount.ok) return paidAmount;
  const submittedAt = readOptionalNullableStringField(candidate, 'submittedAt');
  if (!submittedAt.ok) return submittedAt;
  const adjudicatedAt = readOptionalNullableStringField(candidate, 'adjudicatedAt');
  if (!adjudicatedAt.ok) return adjudicatedAt;
  const rejectionReason = readOptionalNullableStringField(candidate, 'rejectionReason');
  if (!rejectionReason.ok) return rejectionReason;
  const notes = readOptionalNullableStringField(candidate, 'notes');
  if (!notes.ok) return notes;
  return {
    ok: true,
    value: {
      insuranceClaimId,
      status: status.value,
      insurerName: insurerName.value,
      policyNumber: policyNumber.value,
      approvedAmount: approvedAmount.value ?? undefined,
      paidAmount: paidAmount.value ?? undefined,
      submittedAt: submittedAt.value,
      adjudicatedAt: adjudicatedAt.value,
      rejectionReason: rejectionReason.value,
      notes: notes.value,
    },
  };
}

export function validateCreateBillingNumberSequenceBody(body: unknown):
  | { ok: true; value: CreateBillingNumberSequenceInput }
  | { ok: false; error: string } {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { ok: false, error: 'Request body must be a JSON object' };
  }

  const candidate = body as Record<string, unknown>;
  const clinicId = readRequiredString(candidate.clinicId, 'clinicId');
  if (!clinicId.ok) return clinicId;
  const documentType = readRequiredEnumValue<BillingDocumentType>(
    candidate.documentType,
    'documentType',
    billingDocumentTypes
  );
  if (!documentType.ok) return documentType;
  const prefix = readRequiredString(candidate.prefix, 'prefix');
  if (!prefix.ok) return prefix;
  const nextNumber = readOptionalIntegerField(candidate, 'nextNumber');
  if (!nextNumber.ok) return nextNumber;
  if (nextNumber.value != null && nextNumber.value < 1) {
    return { ok: false, error: 'nextNumber must be at least 1' };
  }
  const padding = readOptionalIntegerField(candidate, 'padding');
  if (!padding.ok) return padding;
  if (padding.value != null && (padding.value < 1 || padding.value > 12)) {
    return { ok: false, error: 'padding must be between 1 and 12' };
  }
  const isActive = readOptionalBooleanField(candidate, 'isActive');
  if (!isActive.ok) return isActive;

  return {
    ok: true,
    value: {
      clinicId: clinicId.value,
      documentType: documentType.value,
      prefix: prefix.value,
      nextNumber: nextNumber.value ?? undefined,
      padding: padding.value ?? undefined,
      isActive: isActive.value,
    },
  };
}

export function validateIssueBillingNumberBody(body: unknown):
  | { ok: true; value: IssueBillingNumberInput }
  | { ok: false; error: string } {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { ok: false, error: 'Request body must be a JSON object' };
  }

  const candidate = body as Record<string, unknown>;
  const clinicId = readRequiredString(candidate.clinicId, 'clinicId');
  if (!clinicId.ok) return clinicId;
  const documentType = readRequiredEnumValue<BillingDocumentType>(
    candidate.documentType,
    'documentType',
    billingDocumentTypes
  );
  if (!documentType.ok) return documentType;

  return { ok: true, value: { clinicId: clinicId.value, documentType: documentType.value } };
}

export function validateCreateCashierReconciliationBody(body: unknown):
  | { ok: true; value: CreateCashierReconciliationInput }
  | { ok: false; error: string } {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { ok: false, error: 'Request body must be a JSON object' };
  }

  const candidate = body as Record<string, unknown>;
  const clinicId = readRequiredString(candidate.clinicId, 'clinicId');
  if (!clinicId.ok) return clinicId;
  const reconciliationDate = readRequiredString(candidate.reconciliationDate, 'reconciliationDate');
  if (!reconciliationDate.ok) return reconciliationDate;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(reconciliationDate.value)) {
    return { ok: false, error: 'reconciliationDate must be YYYY-MM-DD' };
  }
  const openingCashAmount = readOptionalNonNegativeNumberLikeField(candidate, 'openingCashAmount');
  if (!openingCashAmount.ok) return openingCashAmount;
  const openedByUserId = readOptionalNullableStringField(candidate, 'openedByUserId');
  if (!openedByUserId.ok) return openedByUserId;
  const notes = readOptionalNullableStringField(candidate, 'notes');
  if (!notes.ok) return notes;

  return {
    ok: true,
    value: {
      clinicId: clinicId.value,
      reconciliationDate: reconciliationDate.value,
      openingCashAmount: openingCashAmount.value ?? undefined,
      openedByUserId: openedByUserId.value,
      notes: notes.value,
    },
  };
}

export function validateCloseCashierReconciliationBody(
  body: unknown,
  reconciliationId: string
): { ok: true; value: CloseCashierReconciliationInput } | { ok: false; error: string } {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { ok: false, error: 'Request body must be a JSON object' };
  }

  const candidate = body as Record<string, unknown>;
  const countedCashAmount = readNonNegativeNumberLikeValue(candidate.countedCashAmount, 'countedCashAmount');
  if (!countedCashAmount.ok) return countedCashAmount;
  const closedByUserId = readOptionalNullableStringField(candidate, 'closedByUserId');
  if (!closedByUserId.ok) return closedByUserId;
  const notes = readOptionalNullableStringField(candidate, 'notes');
  if (!notes.ok) return notes;

  return {
    ok: true,
    value: {
      reconciliationId,
      countedCashAmount: countedCashAmount.value,
      closedByUserId: closedByUserId.value,
      notes: notes.value,
    },
  };
}

export function validateCreateEncounterBody(body: unknown):
  | { ok: true; value: CreateEncounterInput }
  | { ok: false; error: string } {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { ok: false, error: 'Request body must be a JSON object' };
  }

  const candidate = body as Record<string, unknown>;
  const patientId = readRequiredString(candidate.patientId, 'patientId');

  if (!patientId.ok) {
    return patientId;
  }

  const encounterNumber = readRequiredString(candidate.encounterNumber, 'encounterNumber');

  if (!encounterNumber.ok) {
    return encounterNumber;
  }

  const encounterStatus = readEnumValue<EncounterStatus>(
    candidate.status,
    'status',
    ['draft', 'in_progress', 'completed', 'signed', 'cancelled']
  );

  if (!encounterStatus.ok) {
    return encounterStatus;
  }

  const encounterClass = readEnumValue<EncounterClass>(
    candidate.encounterClass,
    'encounterClass',
    ['outpatient', 'inpatient', 'emergency', 'other']
  );

  if (!encounterClass.ok) {
    return encounterClass;
  }

  const noteContent = [
    candidate.subjective,
    candidate.objective,
    candidate.assessment,
    candidate.plan,
  ].some(hasTextContent);

  if (!noteContent) {
    return {
      ok: false,
      error: 'At least one SOAP field is required: subjective, objective, assessment, or plan',
    };
  }

  const diagnoses = candidate.diagnoses;

  if (diagnoses !== undefined) {
    if (!Array.isArray(diagnoses)) {
      return { ok: false, error: 'diagnoses must be an array when provided' };
    }

    for (const [index, diagnosis] of diagnoses.entries()) {
      if (!diagnosis || typeof diagnosis !== 'object' || Array.isArray(diagnosis)) {
        return { ok: false, error: `diagnoses[${index}] must be an object` };
      }

      const entry = diagnosis as Record<string, unknown>;

      if (!hasTextContent(entry.diagnosisName)) {
        return { ok: false, error: `diagnoses[${index}].diagnosisName is required` };
      }

      const diagnosisType = readEnumValue<DiagnosisType>(
        entry.diagnosisType,
        `diagnoses[${index}].diagnosisType`,
        ['working', 'final', 'differential', 'ruled_out']
      );

      if (!diagnosisType.ok) {
        return diagnosisType;
      }

      const diagnosisStatus = readEnumValue<DiagnosisStatus>(
        entry.status,
        `diagnoses[${index}].status`,
        ['active', 'resolved', 'entered_in_error']
      );

      if (!diagnosisStatus.ok) {
        return diagnosisStatus;
      }
    }
  }

  const vitalSigns = candidate.vitalSigns;

  if (vitalSigns !== undefined) {
    if (!Array.isArray(vitalSigns)) {
      return { ok: false, error: 'vitalSigns must be an array when provided' };
    }

    for (const [index, vitalSign] of vitalSigns.entries()) {
      if (!vitalSign || typeof vitalSign !== 'object' || Array.isArray(vitalSign)) {
        return { ok: false, error: `vitalSigns[${index}] must be an object` };
      }

      const entry = vitalSign as Record<string, unknown>;
      const hasMeasurement = [
        entry.bodyTemperatureC,
        entry.heartRateBpm,
        entry.respiratoryRateBpm,
        entry.systolicBpMmhg,
        entry.diastolicBpMmhg,
        entry.oxygenSaturationPct,
        entry.weightKg,
        entry.heightCm,
        entry.bmi,
        entry.painScore,
      ].some((value) => value !== null && value !== undefined && value !== '');

      if (!hasMeasurement) {
        return {
          ok: false,
          error: `vitalSigns[${index}] must include at least one measurement`,
        };
      }
    }
  }

  return {
    ok: true,
    value: {
      patientId: patientId.value,
      encounterNumber: encounterNumber.value,
      status: encounterStatus.value,
      encounterClass: encounterClass.value,
      appointmentId: readOptionalNullableString(candidate.appointmentId),
      attendingPractitionerId: readOptionalNullableString(candidate.attendingPractitionerId),
      chiefComplaint: readOptionalNullableString(candidate.chiefComplaint),
      triageSummary: readOptionalNullableString(candidate.triageSummary),
      startedAt: readOptionalNullableString(candidate.startedAt),
      endedAt: readOptionalNullableString(candidate.endedAt),
      title: readOptionalNullableString(candidate.title),
      noteText: readOptionalNullableString(candidate.noteText),
      authoredByPractitionerId: readOptionalNullableString(candidate.authoredByPractitionerId),
      authoredAt: readOptionalNullableString(candidate.authoredAt),
      subjective: readOptionalNullableString(candidate.subjective),
      objective: readOptionalNullableString(candidate.objective),
      assessment: readOptionalNullableString(candidate.assessment),
      plan: readOptionalNullableString(candidate.plan),
      diagnoses: diagnoses as CreateEncounterInput['diagnoses'],
      vitalSigns: vitalSigns as CreateEncounterInput['vitalSigns'],
    },
  };
}

export function validateCreatePatientBody(body: unknown):
  | { ok: true; value: CreatePatientInput }
  | { ok: false; error: string } {
  const candidate = asObject(body);
  if (!candidate) {
    return { ok: false, error: 'Request body must be a JSON object' };
  }

  const clinicId = readRequiredString(candidate.clinicId, 'clinicId');
  if (!clinicId.ok) return clinicId;

  const medicalRecordNumber = readRequiredString(
    candidate.medicalRecordNumber,
    'medicalRecordNumber'
  );
  if (!medicalRecordNumber.ok) return medicalRecordNumber;

  const firstName = readRequiredString(candidate.firstName, 'firstName');
  if (!firstName.ok) return firstName;

  const lastName = readRequiredString(candidate.lastName, 'lastName');
  if (!lastName.ok) return lastName;

  const nationalId = readOptionalNullableStringField(candidate, 'nationalId');
  if (!nationalId.ok) return nationalId;

  const middleName = readOptionalNullableStringField(candidate, 'middleName');
  if (!middleName.ok) return middleName;

  const preferredName = readOptionalNullableStringField(candidate, 'preferredName');
  if (!preferredName.ok) return preferredName;

  const dateOfBirth = readOptionalNullableStringField(candidate, 'dateOfBirth');
  if (!dateOfBirth.ok) return dateOfBirth;

  const sexAtBirth = readEnumValue<PatientSexAtBirth>(candidate.sexAtBirth, 'sexAtBirth', [
    'female',
    'male',
    'intersex',
    'unknown',
  ]);
  if (!sexAtBirth.ok) return sexAtBirth;

  const phoneNumber = readOptionalNullableStringField(candidate, 'phoneNumber');
  if (!phoneNumber.ok) return phoneNumber;

  const email = readOptionalNullableStringField(candidate, 'email');
  if (!email.ok) return email;

  const bloodType = readOptionalNullableStringField(candidate, 'bloodType');
  if (!bloodType.ok) return bloodType;

  const notes = readOptionalNullableStringField(candidate, 'notes');
  if (!notes.ok) return notes;

  return {
    ok: true,
    value: {
      clinicId: clinicId.value,
      medicalRecordNumber: medicalRecordNumber.value,
      nationalId: nationalId.value,
      firstName: firstName.value,
      middleName: middleName.value,
      lastName: lastName.value,
      preferredName: preferredName.value,
      dateOfBirth: dateOfBirth.value,
      sexAtBirth: sexAtBirth.value,
      phoneNumber: phoneNumber.value,
      email: email.value,
      bloodType: bloodType.value,
      notes: notes.value,
    },
  };
}

export function validateCreateDiagnosisBody(body: unknown):
  | { ok: true; value: CreateDiagnosisInput }
  | { ok: false; error: string } {
  const candidate = asObject(body);
  if (!candidate) {
    return { ok: false, error: 'Request body must be a JSON object' };
  }

  const encounterId = readRequiredString(candidate.encounterId, 'encounterId');
  if (!encounterId.ok) return encounterId;

  const diagnosisName = readRequiredString(candidate.diagnosisName, 'diagnosisName');
  if (!diagnosisName.ok) return diagnosisName;

  const clinicalNoteId = readOptionalNullableStringField(candidate, 'clinicalNoteId');
  if (!clinicalNoteId.ok) return clinicalNoteId;

  const diagnosisCode = readOptionalNullableStringField(candidate, 'diagnosisCode');
  if (!diagnosisCode.ok) return diagnosisCode;

  const codingSystem = readOptionalNullableStringField(candidate, 'codingSystem');
  if (!codingSystem.ok) return codingSystem;

  if (
    (diagnosisCode.value !== undefined || codingSystem.value !== undefined) &&
    !(
      (diagnosisCode.value === null && codingSystem.value === null) ||
      (typeof diagnosisCode.value === 'string' && typeof codingSystem.value === 'string')
    )
  ) {
    return {
      ok: false,
      error: 'diagnosisCode and codingSystem must be provided together',
    };
  }

  const diagnosisType = readEnumValue<DiagnosisType>(
    candidate.diagnosisType,
    'diagnosisType',
    ['working', 'final', 'differential', 'ruled_out']
  );
  if (!diagnosisType.ok) return diagnosisType;

  const diagnosisStatus = readEnumValue<DiagnosisStatus>(
    candidate.status,
    'status',
    ['active', 'resolved', 'entered_in_error']
  );
  if (!diagnosisStatus.ok) return diagnosisStatus;

  const sequenceNumber = readOptionalIntegerField(candidate, 'sequenceNumber');
  if (!sequenceNumber.ok) return sequenceNumber;
  if (sequenceNumber.value !== undefined && sequenceNumber.value !== null && sequenceNumber.value <= 0) {
    return { ok: false, error: 'sequenceNumber must be greater than 0' };
  }

  const diagnosedAt = readOptionalNullableStringField(candidate, 'diagnosedAt');
  if (!diagnosedAt.ok) return diagnosedAt;

  const resolutionNote = readOptionalNullableStringField(candidate, 'resolutionNote');
  if (!resolutionNote.ok) return resolutionNote;

  const notes = readOptionalNullableStringField(candidate, 'notes');
  if (!notes.ok) return notes;

  return {
    ok: true,
    value: {
      encounterId: encounterId.value,
      clinicalNoteId: clinicalNoteId.value,
      diagnosisCode: diagnosisCode.value,
      codingSystem: codingSystem.value,
      diagnosisName: diagnosisName.value,
      diagnosisType: diagnosisType.value,
      status: diagnosisStatus.value,
      sequenceNumber: sequenceNumber.value,
      diagnosedAt: diagnosedAt.value,
      resolutionNote: resolutionNote.value,
      notes: notes.value,
    },
  };
}

export function validateCreateVitalSignBody(body: unknown):
  | { ok: true; value: CreateVitalSignInput }
  | { ok: false; error: string } {
  const candidate = asObject(body);
  if (!candidate) {
    return { ok: false, error: 'Request body must be a JSON object' };
  }

  const encounterId = readRequiredString(candidate.encounterId, 'encounterId');
  if (!encounterId.ok) return encounterId;

  const clinicalNoteId = readOptionalNullableStringField(candidate, 'clinicalNoteId');
  if (!clinicalNoteId.ok) return clinicalNoteId;

  const measuredAt = readOptionalNullableStringField(candidate, 'measuredAt');
  if (!measuredAt.ok) return measuredAt;

  const measuredByPractitionerId = readOptionalNullableStringField(candidate, 'measuredByPractitionerId');
  if (!measuredByPractitionerId.ok) return measuredByPractitionerId;

  const bodyTemperatureC = readOptionalNumberLikeField(candidate, 'bodyTemperatureC');
  if (!bodyTemperatureC.ok) return bodyTemperatureC;

  const heartRateBpm = readOptionalIntegerField(candidate, 'heartRateBpm');
  if (!heartRateBpm.ok) return heartRateBpm;

  const respiratoryRateBpm = readOptionalIntegerField(candidate, 'respiratoryRateBpm');
  if (!respiratoryRateBpm.ok) return respiratoryRateBpm;

  const systolicBpMmhg = readOptionalIntegerField(candidate, 'systolicBpMmhg');
  if (!systolicBpMmhg.ok) return systolicBpMmhg;

  const diastolicBpMmhg = readOptionalIntegerField(candidate, 'diastolicBpMmhg');
  if (!diastolicBpMmhg.ok) return diastolicBpMmhg;

  const oxygenSaturationPct = readOptionalNumberLikeField(candidate, 'oxygenSaturationPct');
  if (!oxygenSaturationPct.ok) return oxygenSaturationPct;

  const weightKg = readOptionalNumberLikeField(candidate, 'weightKg');
  if (!weightKg.ok) return weightKg;

  const heightCm = readOptionalNumberLikeField(candidate, 'heightCm');
  if (!heightCm.ok) return heightCm;

  const bmi = readOptionalNumberLikeField(candidate, 'bmi');
  if (!bmi.ok) return bmi;

  const painScore = readOptionalIntegerField(candidate, 'painScore');
  if (!painScore.ok) return painScore;

  const notes = readOptionalNullableStringField(candidate, 'notes');
  if (!notes.ok) return notes;

  const hasMeasurement = [
    bodyTemperatureC.value,
    heartRateBpm.value,
    respiratoryRateBpm.value,
    systolicBpMmhg.value,
    diastolicBpMmhg.value,
    oxygenSaturationPct.value,
    weightKg.value,
    heightCm.value,
    bmi.value,
    painScore.value,
  ].some((value) => value !== null && value !== undefined);

  if (!hasMeasurement) {
    return { ok: false, error: 'At least one vital sign measurement is required' };
  }

  return {
    ok: true,
    value: {
      encounterId: encounterId.value,
      clinicalNoteId: clinicalNoteId.value,
      measuredAt: measuredAt.value,
      measuredByPractitionerId: measuredByPractitionerId.value,
      bodyTemperatureC: bodyTemperatureC.value,
      heartRateBpm: heartRateBpm.value,
      respiratoryRateBpm: respiratoryRateBpm.value,
      systolicBpMmhg: systolicBpMmhg.value,
      diastolicBpMmhg: diastolicBpMmhg.value,
      oxygenSaturationPct: oxygenSaturationPct.value,
      weightKg: weightKg.value,
      heightCm: heightCm.value,
      bmi: bmi.value,
      painScore: painScore.value,
      notes: notes.value,
    },
  };
}

export function validateCreateAppointmentBody(body: unknown):
  | { ok: true; value: CreateAppointmentInput }
  | { ok: false; error: string } {
  const candidate = asObject(body);
  if (!candidate) {
    return { ok: false, error: 'Request body must be a JSON object' };
  }

  const clinicId = readRequiredString(candidate.clinicId, 'clinicId');
  if (!clinicId.ok) return clinicId;

  const patientId = readRequiredString(candidate.patientId, 'patientId');
  if (!patientId.ok) return patientId;

  const appointmentNumber = readRequiredString(candidate.appointmentNumber, 'appointmentNumber');
  if (!appointmentNumber.ok) return appointmentNumber;

  const practitionerId = readOptionalNullableStringField(candidate, 'practitionerId');
  if (!practitionerId.ok) return practitionerId;

  const status = readEnumValue<AppointmentStatus>(candidate.status, 'status', [
    'pending',
    'confirmed',
    'checked_in',
    'completed',
    'cancelled',
    'no_show',
  ]);
  if (!status.ok) return status;

  const scheduledStartAt = readRequiredString(candidate.scheduledStartAt, 'scheduledStartAt');
  if (!scheduledStartAt.ok) return scheduledStartAt;

  const scheduledEndAt = readOptionalNullableStringField(candidate, 'scheduledEndAt');
  if (!scheduledEndAt.ok) return scheduledEndAt;

  const reason = readOptionalNullableStringField(candidate, 'reason');
  if (!reason.ok) return reason;

  const notes = readOptionalNullableStringField(candidate, 'notes');
  if (!notes.ok) return notes;

  return {
    ok: true,
    value: {
      clinicId: clinicId.value,
      patientId: patientId.value,
      practitionerId: practitionerId.value,
      appointmentNumber: appointmentNumber.value,
      status: status.value,
      scheduledStartAt: scheduledStartAt.value,
      scheduledEndAt: scheduledEndAt.value,
      reason: reason.value,
      notes: notes.value,
    },
  };
}

export function validateUpdateAppointmentBody(body: unknown, appointmentId: string):
  | { ok: true; value: UpdateAppointmentInput }
  | { ok: false; error: string } {
  const candidate = asObject(body);
  if (!candidate) {
    return { ok: false, error: 'Request body must be a JSON object' };
  }

  const hasChanges = [
    'practitionerId',
    'status',
    'scheduledStartAt',
    'scheduledEndAt',
    'reason',
    'notes',
  ].some((field) => Object.hasOwn(candidate, field));
  if (!hasChanges) {
    return { ok: false, error: 'At least one appointment field must be provided for update' };
  }

  const practitionerId = readOptionalNullableStringField(candidate, 'practitionerId');
  if (!practitionerId.ok) return practitionerId;

  const status = readEnumValue<AppointmentStatus>(candidate.status, 'status', [
    'pending',
    'confirmed',
    'checked_in',
    'completed',
    'cancelled',
    'no_show',
  ]);
  if (!status.ok) return status;

  const scheduledStartAt = readOptionalTrimmedStringField(candidate, 'scheduledStartAt');
  if (!scheduledStartAt.ok) return scheduledStartAt;

  const scheduledEndAt = readOptionalNullableStringField(candidate, 'scheduledEndAt');
  if (!scheduledEndAt.ok) return scheduledEndAt;

  const reason = readOptionalNullableStringField(candidate, 'reason');
  if (!reason.ok) return reason;

  const notes = readOptionalNullableStringField(candidate, 'notes');
  if (!notes.ok) return notes;

  return {
    ok: true,
    value: {
      appointmentId,
      ...(Object.hasOwn(candidate, 'practitionerId')
        ? { practitionerId: practitionerId.value }
        : {}),
      ...(Object.hasOwn(candidate, 'status') ? { status: status.value } : {}),
      ...(Object.hasOwn(candidate, 'scheduledStartAt')
        ? { scheduledStartAt: scheduledStartAt.value }
        : {}),
      ...(Object.hasOwn(candidate, 'scheduledEndAt')
        ? { scheduledEndAt: scheduledEndAt.value }
        : {}),
      ...(Object.hasOwn(candidate, 'reason') ? { reason: reason.value } : {}),
      ...(Object.hasOwn(candidate, 'notes') ? { notes: notes.value } : {}),
    },
  };
}

export function validateCreateClinicVisitBody(body: unknown):
  | { ok: true; value: CreateClinicVisitInput }
  | { ok: false; error: string } {
  const candidate = asObject(body);
  if (!candidate) return { ok: false, error: 'Request body must be a JSON object' };

  const clinicId = readRequiredString(candidate.clinicId, 'clinicId');
  if (!clinicId.ok) return clinicId;
  const patientId = readRequiredString(candidate.patientId, 'patientId');
  if (!patientId.ok) return patientId;
  const visitNumber = readRequiredString(candidate.visitNumber, 'visitNumber');
  if (!visitNumber.ok) return visitNumber;

  const appointmentId = readOptionalNullableStringField(candidate, 'appointmentId');
  if (!appointmentId.ok) return appointmentId;
  const practitionerId = readOptionalNullableStringField(candidate, 'practitionerId');
  if (!practitionerId.ok) return practitionerId;
  const status = readEnumValue<ClinicVisitStatus>(candidate.status, 'status', clinicVisitStatuses);
  if (!status.ok) return status;
  const queueLabel = readOptionalNullableStringField(candidate, 'queueLabel');
  if (!queueLabel.ok) return queueLabel;
  const roomName = readOptionalNullableStringField(candidate, 'roomName');
  if (!roomName.ok) return roomName;
  const notes = readOptionalNullableStringField(candidate, 'notes');
  if (!notes.ok) return notes;

  return {
    ok: true,
    value: {
      clinicId: clinicId.value,
      patientId: patientId.value,
      appointmentId: appointmentId.value,
      practitionerId: practitionerId.value,
      visitNumber: visitNumber.value,
      status: status.value,
      queueLabel: queueLabel.value,
      roomName: roomName.value,
      notes: notes.value,
    },
  };
}

export function validateUpdateClinicVisitBody(body: unknown, visitId: string):
  | { ok: true; value: UpdateClinicVisitInput }
  | { ok: false; error: string } {
  const candidate = asObject(body);
  if (!candidate) return { ok: false, error: 'Request body must be a JSON object' };

  const hasChanges = [
    'encounterId',
    'practitionerId',
    'status',
    'queueLabel',
    'roomName',
    'notes',
  ].some((field) => Object.hasOwn(candidate, field));
  if (!hasChanges) {
    return { ok: false, error: 'At least one visit field must be provided for update' };
  }

  const encounterId = readOptionalNullableStringField(candidate, 'encounterId');
  if (!encounterId.ok) return encounterId;
  const practitionerId = readOptionalNullableStringField(candidate, 'practitionerId');
  if (!practitionerId.ok) return practitionerId;
  const status = readEnumValue<ClinicVisitStatus>(candidate.status, 'status', clinicVisitStatuses);
  if (!status.ok) return status;
  const queueLabel = readOptionalNullableStringField(candidate, 'queueLabel');
  if (!queueLabel.ok) return queueLabel;
  const roomName = readOptionalNullableStringField(candidate, 'roomName');
  if (!roomName.ok) return roomName;
  const notes = readOptionalNullableStringField(candidate, 'notes');
  if (!notes.ok) return notes;

  return {
    ok: true,
    value: {
      visitId,
      ...(Object.hasOwn(candidate, 'encounterId') ? { encounterId: encounterId.value } : {}),
      ...(Object.hasOwn(candidate, 'practitionerId') ? { practitionerId: practitionerId.value } : {}),
      ...(Object.hasOwn(candidate, 'status') ? { status: status.value } : {}),
      ...(Object.hasOwn(candidate, 'queueLabel') ? { queueLabel: queueLabel.value } : {}),
      ...(Object.hasOwn(candidate, 'roomName') ? { roomName: roomName.value } : {}),
      ...(Object.hasOwn(candidate, 'notes') ? { notes: notes.value } : {}),
    },
  };
}

export function validateCreateClinicalNoteTemplateBody(body: unknown):
  | { ok: true; value: CreateClinicalNoteTemplateInput }
  | { ok: false; error: string } {
  const candidate = asObject(body);
  if (!candidate) return { ok: false, error: 'Request body must be a JSON object' };

  const clinicId = readRequiredString(candidate.clinicId, 'clinicId');
  if (!clinicId.ok) return clinicId;
  const templateKey = readRequiredString(candidate.templateKey, 'templateKey');
  if (!templateKey.ok) return templateKey;
  const title = readRequiredString(candidate.title, 'title');
  if (!title.ok) return title;
  const category = readOptionalNullableStringField(candidate, 'category');
  if (!category.ok) return category;
  const subjective = readOptionalNullableStringField(candidate, 'subjective');
  if (!subjective.ok) return subjective;
  const objective = readOptionalNullableStringField(candidate, 'objective');
  if (!objective.ok) return objective;
  const assessment = readOptionalNullableStringField(candidate, 'assessment');
  if (!assessment.ok) return assessment;
  const plan = readOptionalNullableStringField(candidate, 'plan');
  if (!plan.ok) return plan;
  const isActive = readOptionalBooleanField(candidate, 'isActive');
  if (!isActive.ok) return isActive;

  return {
    ok: true,
    value: {
      clinicId: clinicId.value,
      templateKey: templateKey.value,
      title: title.value,
      category: category.value,
      subjective: subjective.value,
      objective: objective.value,
      assessment: assessment.value,
      plan: plan.value,
      isActive: isActive.value,
    },
  };
}

export function validateUpdateClinicalNoteTemplateBody(body: unknown, templateId: string):
  | { ok: true; value: UpdateClinicalNoteTemplateInput }
  | { ok: false; error: string } {
  const candidate = asObject(body);
  if (!candidate) return { ok: false, error: 'Request body must be a JSON object' };

  const hasChanges = [
    'templateKey',
    'title',
    'category',
    'subjective',
    'objective',
    'assessment',
    'plan',
    'isActive',
  ].some((field) => Object.hasOwn(candidate, field));
  if (!hasChanges) {
    return { ok: false, error: 'At least one template field must be provided for update' };
  }

  const templateKey = Object.hasOwn(candidate, 'templateKey')
    ? readRequiredString(candidate.templateKey, 'templateKey')
    : { ok: true as const, value: undefined };
  if (!templateKey.ok) return templateKey;
  const title = Object.hasOwn(candidate, 'title')
    ? readRequiredString(candidate.title, 'title')
    : { ok: true as const, value: undefined };
  if (!title.ok) return title;
  const category = readOptionalNullableStringField(candidate, 'category');
  if (!category.ok) return category;
  const subjective = readOptionalNullableStringField(candidate, 'subjective');
  if (!subjective.ok) return subjective;
  const objective = readOptionalNullableStringField(candidate, 'objective');
  if (!objective.ok) return objective;
  const assessment = readOptionalNullableStringField(candidate, 'assessment');
  if (!assessment.ok) return assessment;
  const plan = readOptionalNullableStringField(candidate, 'plan');
  if (!plan.ok) return plan;
  const isActive = readOptionalBooleanField(candidate, 'isActive');
  if (!isActive.ok) return isActive;

  return {
    ok: true,
    value: {
      templateId,
      ...(Object.hasOwn(candidate, 'templateKey') ? { templateKey: templateKey.value } : {}),
      ...(Object.hasOwn(candidate, 'title') ? { title: title.value } : {}),
      ...(Object.hasOwn(candidate, 'category') ? { category: category.value } : {}),
      ...(Object.hasOwn(candidate, 'subjective') ? { subjective: subjective.value } : {}),
      ...(Object.hasOwn(candidate, 'objective') ? { objective: objective.value } : {}),
      ...(Object.hasOwn(candidate, 'assessment') ? { assessment: assessment.value } : {}),
      ...(Object.hasOwn(candidate, 'plan') ? { plan: plan.value } : {}),
      ...(Object.hasOwn(candidate, 'isActive') ? { isActive: isActive.value } : {}),
    },
  };
}

export function validateUpsertClinicSettingsBody(body: unknown, clinicId: string):
  | { ok: true; value: UpsertClinicSettingsInput }
  | { ok: false; error: string } {
  const candidate = asObject(body);
  if (!candidate) return { ok: false, error: 'Request body must be a JSON object' };

  const displayName = readRequiredString(candidate.displayName, 'displayName');
  if (!displayName.ok) return displayName;
  const address = readOptionalNullableStringField(candidate, 'address');
  if (!address.ok) return address;
  const phoneNumber = readOptionalNullableStringField(candidate, 'phoneNumber');
  if (!phoneNumber.ok) return phoneNumber;
  const email = readOptionalNullableStringField(candidate, 'email');
  if (!email.ok) return email;
  const website = readOptionalNullableStringField(candidate, 'website');
  if (!website.ok) return website;
  const logoUrl = readOptionalNullableStringField(candidate, 'logoUrl');
  if (!logoUrl.ok) return logoUrl;
  const logoFileAssetId = readOptionalNullableStringField(candidate, 'logoFileAssetId');
  if (!logoFileAssetId.ok) return logoFileAssetId;
  const prescriptionFooter = readOptionalNullableStringField(candidate, 'prescriptionFooter');
  if (!prescriptionFooter.ok) return prescriptionFooter;

  return {
    ok: true,
    value: {
      clinicId,
      displayName: displayName.value,
      address: address.value,
      phoneNumber: phoneNumber.value,
      email: email.value,
      website: website.value,
      logoUrl: logoUrl.value,
      logoFileAssetId: logoFileAssetId.value,
      prescriptionFooter: prescriptionFooter.value,
    },
  };
}

export function validateUpdateEncounterBody(body: unknown, encounterId: string):
  | { ok: true; value: UpdateEncounterInput }
  | { ok: false; error: string } {
  const candidate = asObject(body);
  if (!candidate) {
    return { ok: false, error: 'Request body must be a JSON object' };
  }

  const hasChanges = [
    'status',
    'encounterClass',
    'attendingPractitionerId',
    'chiefComplaint',
    'triageSummary',
    'startedAt',
    'endedAt',
  ].some((field) => Object.hasOwn(candidate, field));
  if (!hasChanges) {
    return { ok: false, error: 'At least one encounter field must be provided for update' };
  }

  const status = readEnumValue<EncounterStatus>(candidate.status, 'status', [
    'draft',
    'in_progress',
    'completed',
    'signed',
    'cancelled',
  ]);
  if (!status.ok) return status;

  const encounterClass = readEnumValue<EncounterClass>(
    candidate.encounterClass,
    'encounterClass',
    ['outpatient', 'inpatient', 'emergency', 'other']
  );
  if (!encounterClass.ok) return encounterClass;

  const attendingPractitionerId = readOptionalNullableStringField(candidate, 'attendingPractitionerId');
  if (!attendingPractitionerId.ok) return attendingPractitionerId;

  const chiefComplaint = readOptionalNullableStringField(candidate, 'chiefComplaint');
  if (!chiefComplaint.ok) return chiefComplaint;

  const triageSummary = readOptionalNullableStringField(candidate, 'triageSummary');
  if (!triageSummary.ok) return triageSummary;

  const startedAt = readOptionalNullableStringField(candidate, 'startedAt');
  if (!startedAt.ok) return startedAt;

  const endedAt = readOptionalNullableStringField(candidate, 'endedAt');
  if (!endedAt.ok) return endedAt;

  return {
    ok: true,
    value: {
      encounterId,
      ...(Object.hasOwn(candidate, 'status') ? { status: status.value } : {}),
      ...(Object.hasOwn(candidate, 'encounterClass') ? { encounterClass: encounterClass.value } : {}),
      ...(Object.hasOwn(candidate, 'attendingPractitionerId')
        ? { attendingPractitionerId: attendingPractitionerId.value }
        : {}),
      ...(Object.hasOwn(candidate, 'chiefComplaint') ? { chiefComplaint: chiefComplaint.value } : {}),
      ...(Object.hasOwn(candidate, 'triageSummary') ? { triageSummary: triageSummary.value } : {}),
      ...(Object.hasOwn(candidate, 'startedAt') ? { startedAt: startedAt.value } : {}),
      ...(Object.hasOwn(candidate, 'endedAt') ? { endedAt: endedAt.value } : {}),
    },
  };
}

export function validateCreateConsentRecordBody(body: unknown):
  | { ok: true; value: CreateConsentRecordInput }
  | { ok: false; error: string } {
  const candidate = asObject(body);
  if (!candidate) {
    return { ok: false, error: 'Request body must be a JSON object' };
  }

  const clinicId = readRequiredString(candidate.clinicId, 'clinicId');
  if (!clinicId.ok) return clinicId;

  const patientId = readRequiredString(candidate.patientId, 'patientId');
  if (!patientId.ok) return patientId;

  const consentType = readRequiredString(candidate.consentType, 'consentType');
  if (!consentType.ok) return consentType;

  const status = readEnumValue<ConsentStatus>(candidate.status, 'status', [
    'granted',
    'revoked',
    'expired',
    'declined',
  ]);
  if (!status.ok) return status;

  const grantedAt = readOptionalNullableStringField(candidate, 'grantedAt');
  if (!grantedAt.ok) return grantedAt;

  const revokedAt = readOptionalNullableStringField(candidate, 'revokedAt');
  if (!revokedAt.ok) return revokedAt;

  const expiresAt = readOptionalNullableStringField(candidate, 'expiresAt');
  if (!expiresAt.ok) return expiresAt;

  const capturedByUserId = readOptionalNullableStringField(candidate, 'capturedByUserId');
  if (!capturedByUserId.ok) return capturedByUserId;

  const documentReference = readOptionalNullableStringField(candidate, 'documentReference');
  if (!documentReference.ok) return documentReference;

  const notes = readOptionalNullableStringField(candidate, 'notes');
  if (!notes.ok) return notes;

  return {
    ok: true,
    value: {
      clinicId: clinicId.value,
      patientId: patientId.value,
      consentType: consentType.value,
      status: status.value,
      grantedAt: grantedAt.value,
      revokedAt: revokedAt.value,
      expiresAt: expiresAt.value,
      capturedByUserId: capturedByUserId.value,
      documentReference: documentReference.value,
      notes: notes.value,
    },
  };
}

export function validateUpdateConsentRecordBody(body: unknown, consentId: string):
  | { ok: true; value: UpdateConsentRecordInput }
  | { ok: false; error: string } {
  const candidate = asObject(body);
  if (!candidate) {
    return { ok: false, error: 'Request body must be a JSON object' };
  }

  const hasChanges = [
    'consentType',
    'status',
    'grantedAt',
    'revokedAt',
    'expiresAt',
    'capturedByUserId',
    'documentReference',
    'notes',
  ].some((field) => Object.hasOwn(candidate, field));
  if (!hasChanges) {
    return { ok: false, error: 'At least one consent field must be provided for update' };
  }

  const consentType = readOptionalTrimmedStringField(candidate, 'consentType');
  if (!consentType.ok) return consentType;

  const status = readEnumValue<ConsentStatus>(candidate.status, 'status', [
    'granted',
    'revoked',
    'expired',
    'declined',
  ]);
  if (!status.ok) return status;

  const grantedAt = readOptionalNullableStringField(candidate, 'grantedAt');
  if (!grantedAt.ok) return grantedAt;

  const revokedAt = readOptionalNullableStringField(candidate, 'revokedAt');
  if (!revokedAt.ok) return revokedAt;

  const expiresAt = readOptionalNullableStringField(candidate, 'expiresAt');
  if (!expiresAt.ok) return expiresAt;

  const capturedByUserId = readOptionalNullableStringField(candidate, 'capturedByUserId');
  if (!capturedByUserId.ok) return capturedByUserId;

  const documentReference = readOptionalNullableStringField(candidate, 'documentReference');
  if (!documentReference.ok) return documentReference;

  const notes = readOptionalNullableStringField(candidate, 'notes');
  if (!notes.ok) return notes;

  return {
    ok: true,
    value: {
      consentId,
      ...(Object.hasOwn(candidate, 'consentType') ? { consentType: consentType.value } : {}),
      ...(Object.hasOwn(candidate, 'status') ? { status: status.value } : {}),
      ...(Object.hasOwn(candidate, 'grantedAt') ? { grantedAt: grantedAt.value } : {}),
      ...(Object.hasOwn(candidate, 'revokedAt') ? { revokedAt: revokedAt.value } : {}),
      ...(Object.hasOwn(candidate, 'expiresAt') ? { expiresAt: expiresAt.value } : {}),
      ...(Object.hasOwn(candidate, 'capturedByUserId')
        ? { capturedByUserId: capturedByUserId.value }
        : {}),
      ...(Object.hasOwn(candidate, 'documentReference')
        ? { documentReference: documentReference.value }
        : {}),
      ...(Object.hasOwn(candidate, 'notes') ? { notes: notes.value } : {}),
    },
  };
}

export function validateUpdateSoapNoteBody(body: unknown, clinicalNoteId: string):
  | { ok: true; value: UpdateSoapNoteInput }
  | { ok: false; error: string } {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { ok: false, error: 'Request body must be a JSON object' };
  }

  const candidate = body as Record<string, unknown>;
  const hasContent = [
    candidate.subjective,
    candidate.objective,
    candidate.assessment,
    candidate.plan,
  ].some((value) => value !== undefined);

  if (!hasContent) {
    return { ok: false, error: 'At least one SOAP field must be provided for update' };
  }

  return {
    ok: true,
    value: {
      clinicalNoteId,
      ...(Object.hasOwn(candidate, 'subjective')
        ? { subjective: readOptionalNullableString(candidate.subjective) }
        : {}),
      ...(Object.hasOwn(candidate, 'objective')
        ? { objective: readOptionalNullableString(candidate.objective) }
        : {}),
      ...(Object.hasOwn(candidate, 'assessment')
        ? { assessment: readOptionalNullableString(candidate.assessment) }
        : {}),
      ...(Object.hasOwn(candidate, 'plan') ? { plan: readOptionalNullableString(candidate.plan) } : {}),
    },
  };
}

export function validateUpdateDiagnosisBody(body: unknown, diagnosisId: string):
  | { ok: true; value: UpdateDiagnosisInput }
  | { ok: false; error: string } {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { ok: false, error: 'Request body must be a JSON object' };
  }

  const candidate = body as Record<string, unknown>;
  const hasChanges = [
    'diagnosisCode',
    'codingSystem',
    'diagnosisName',
    'diagnosisType',
    'status',
    'sequenceNumber',
    'diagnosedAt',
    'resolutionNote',
    'notes',
  ].some((field) => Object.hasOwn(candidate, field));

  if (!hasChanges) {
    return { ok: false, error: 'At least one diagnosis field must be provided for update' };
  }

  const diagnosisCode = readOptionalNullableStringField(
    candidate,
    'diagnosisCode'
  );
  if (!diagnosisCode.ok) return diagnosisCode;

  const codingSystem = readOptionalNullableStringField(candidate, 'codingSystem');
  if (!codingSystem.ok) return codingSystem;

  if (
    (diagnosisCode.value !== undefined || codingSystem.value !== undefined) &&
    !(
      (diagnosisCode.value === null && codingSystem.value === null) ||
      (typeof diagnosisCode.value === 'string' && typeof codingSystem.value === 'string')
    )
  ) {
    return {
      ok: false,
      error: 'diagnosisCode and codingSystem must be provided together',
    };
  }

  const diagnosisType = readEnumValue<DiagnosisType>(
    candidate.diagnosisType,
    'diagnosisType',
    ['working', 'final', 'differential', 'ruled_out']
  );
  if (!diagnosisType.ok) return diagnosisType;

  const diagnosisStatus = readEnumValue<DiagnosisStatus>(
    candidate.status,
    'status',
    ['active', 'resolved', 'entered_in_error']
  );
  if (!diagnosisStatus.ok) return diagnosisStatus;

  const diagnosisName = readOptionalTrimmedStringField(candidate, 'diagnosisName');
  if (!diagnosisName.ok) return diagnosisName;

  const sequenceNumber = readOptionalIntegerField(candidate, 'sequenceNumber');
  if (!sequenceNumber.ok) return sequenceNumber;
  if (sequenceNumber.value !== undefined && sequenceNumber.value !== null && sequenceNumber.value <= 0) {
    return { ok: false, error: 'sequenceNumber must be greater than 0' };
  }

  const diagnosedAt = readOptionalNullableStringField(candidate, 'diagnosedAt');
  if (!diagnosedAt.ok) return diagnosedAt;

  const resolutionNote = readOptionalNullableStringField(candidate, 'resolutionNote');
  if (!resolutionNote.ok) return resolutionNote;

  const notes = readOptionalNullableStringField(candidate, 'notes');
  if (!notes.ok) return notes;

  return {
    ok: true,
    value: {
      diagnosisId,
      ...(Object.hasOwn(candidate, 'diagnosisCode') ? { diagnosisCode: diagnosisCode.value } : {}),
      ...(Object.hasOwn(candidate, 'codingSystem') ? { codingSystem: codingSystem.value } : {}),
      ...(Object.hasOwn(candidate, 'diagnosisName') ? { diagnosisName: diagnosisName.value } : {}),
      ...(Object.hasOwn(candidate, 'diagnosisType') ? { diagnosisType: diagnosisType.value } : {}),
      ...(Object.hasOwn(candidate, 'status') ? { status: diagnosisStatus.value } : {}),
      ...(Object.hasOwn(candidate, 'sequenceNumber')
        ? { sequenceNumber: sequenceNumber.value }
        : {}),
      ...(Object.hasOwn(candidate, 'diagnosedAt') ? { diagnosedAt: diagnosedAt.value } : {}),
      ...(Object.hasOwn(candidate, 'resolutionNote')
        ? { resolutionNote: resolutionNote.value }
        : {}),
      ...(Object.hasOwn(candidate, 'notes') ? { notes: notes.value } : {}),
    },
  };
}

export function validateUpdateVitalSignBody(body: unknown, vitalSignId: string):
  | { ok: true; value: UpdateVitalSignInput }
  | { ok: false; error: string } {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { ok: false, error: 'Request body must be a JSON object' };
  }

  const candidate = body as Record<string, unknown>;
  const hasChanges = [
    'measuredAt',
    'measuredByPractitionerId',
    'bodyTemperatureC',
    'heartRateBpm',
    'respiratoryRateBpm',
    'systolicBpMmhg',
    'diastolicBpMmhg',
    'oxygenSaturationPct',
    'weightKg',
    'heightCm',
    'bmi',
    'painScore',
    'notes',
  ].some((field) => Object.hasOwn(candidate, field));

  if (!hasChanges) {
    return { ok: false, error: 'At least one vital sign field must be provided for update' };
  }

  const measuredAt = readOptionalNullableStringField(candidate, 'measuredAt');
  if (!measuredAt.ok) return measuredAt;

  const measuredByPractitionerId = readOptionalNullableStringField(
    candidate,
    'measuredByPractitionerId'
  );
  if (!measuredByPractitionerId.ok) return measuredByPractitionerId;

  const bodyTemperatureC = readOptionalNumberLikeField(candidate, 'bodyTemperatureC');
  if (!bodyTemperatureC.ok) return bodyTemperatureC;

  const heartRateBpm = readOptionalIntegerField(candidate, 'heartRateBpm');
  if (!heartRateBpm.ok) return heartRateBpm;

  const respiratoryRateBpm = readOptionalIntegerField(candidate, 'respiratoryRateBpm');
  if (!respiratoryRateBpm.ok) return respiratoryRateBpm;

  const systolicBpMmhg = readOptionalIntegerField(candidate, 'systolicBpMmhg');
  if (!systolicBpMmhg.ok) return systolicBpMmhg;

  const diastolicBpMmhg = readOptionalIntegerField(candidate, 'diastolicBpMmhg');
  if (!diastolicBpMmhg.ok) return diastolicBpMmhg;

  const oxygenSaturationPct = readOptionalNumberLikeField(candidate, 'oxygenSaturationPct');
  if (!oxygenSaturationPct.ok) return oxygenSaturationPct;

  const weightKg = readOptionalNumberLikeField(candidate, 'weightKg');
  if (!weightKg.ok) return weightKg;

  const heightCm = readOptionalNumberLikeField(candidate, 'heightCm');
  if (!heightCm.ok) return heightCm;

  const bmi = readOptionalNumberLikeField(candidate, 'bmi');
  if (!bmi.ok) return bmi;

  const painScore = readOptionalIntegerField(candidate, 'painScore');
  if (!painScore.ok) return painScore;

  const notes = readOptionalNullableStringField(candidate, 'notes');
  if (!notes.ok) return notes;

  return {
    ok: true,
    value: {
      vitalSignId,
      ...(Object.hasOwn(candidate, 'measuredAt') ? { measuredAt: measuredAt.value } : {}),
      ...(Object.hasOwn(candidate, 'measuredByPractitionerId')
        ? { measuredByPractitionerId: measuredByPractitionerId.value }
        : {}),
      ...(Object.hasOwn(candidate, 'bodyTemperatureC')
        ? { bodyTemperatureC: bodyTemperatureC.value }
        : {}),
      ...(Object.hasOwn(candidate, 'heartRateBpm') ? { heartRateBpm: heartRateBpm.value } : {}),
      ...(Object.hasOwn(candidate, 'respiratoryRateBpm')
        ? { respiratoryRateBpm: respiratoryRateBpm.value }
        : {}),
      ...(Object.hasOwn(candidate, 'systolicBpMmhg')
        ? { systolicBpMmhg: systolicBpMmhg.value }
        : {}),
      ...(Object.hasOwn(candidate, 'diastolicBpMmhg')
        ? { diastolicBpMmhg: diastolicBpMmhg.value }
        : {}),
      ...(Object.hasOwn(candidate, 'oxygenSaturationPct')
        ? { oxygenSaturationPct: oxygenSaturationPct.value }
        : {}),
      ...(Object.hasOwn(candidate, 'weightKg') ? { weightKg: weightKg.value } : {}),
      ...(Object.hasOwn(candidate, 'heightCm') ? { heightCm: heightCm.value } : {}),
      ...(Object.hasOwn(candidate, 'bmi') ? { bmi: bmi.value } : {}),
      ...(Object.hasOwn(candidate, 'painScore') ? { painScore: painScore.value } : {}),
      ...(Object.hasOwn(candidate, 'notes') ? { notes: notes.value } : {}),
    },
  };
}

export function validateCreateUserBody(body: unknown):
  | { ok: true; value: CreateUserValidatedInput }
  | { ok: false; error: string } {
  const candidate = asObject(body);
  if (!candidate) {
    return { ok: false, error: 'Request body must be a JSON object' };
  }

  const clinicId = readRequiredString(candidate.clinicId, 'clinicId');
  if (!clinicId.ok) return clinicId;

  const username = readRequiredString(candidate.username, 'username');
  if (!username.ok) return username;

  const displayName = readRequiredString(candidate.displayName, 'displayName');
  if (!displayName.ok) return displayName;

  const role = readRequiredEnumValue<UserRole>(
    candidate.role,
    'role',
    ['doctor', 'nurse', 'admin']
  );
  if (!role.ok) return role;

  return {
    ok: true,
    value: {
      clinicId: clinicId.value,
      username: username.value,
      displayName: displayName.value,
      role: role.value,
      oidcSubject: readOptionalNullableString(candidate.oidcSubject),
    },
  };
}

export function validateUpdateUserBody(body: unknown, userId: string):
  | { ok: true; value: UpdateUserValidatedInput }
  | { ok: false; error: string } {
  const candidate = asObject(body);
  if (!candidate) {
    return { ok: false, error: 'Request body must be a JSON object' };
  }

  const hasChanges = ['displayName', 'role', 'isActive', 'oidcSubject'].some((field) =>
    Object.hasOwn(candidate, field)
  );
  if (!hasChanges) {
    return { ok: false, error: 'At least one user field must be provided for update' };
  }

  const displayName = readOptionalTrimmedStringField(candidate, 'displayName');
  if (!displayName.ok) return displayName;

  const role = readEnumValue<UserRole>(candidate.role, 'role', ['doctor', 'nurse', 'admin']);
  if (!role.ok) return role;

  const isActive = readOptionalBooleanField(candidate, 'isActive');
  if (!isActive.ok) return isActive;

  return {
    ok: true,
    value: {
      userId,
      ...(Object.hasOwn(candidate, 'displayName') ? { displayName: displayName.value } : {}),
      ...(Object.hasOwn(candidate, 'role') ? { role: role.value } : {}),
      ...(Object.hasOwn(candidate, 'isActive') ? { isActive: isActive.value } : {}),
      ...(Object.hasOwn(candidate, 'oidcSubject')
        ? { oidcSubject: readOptionalNullableString(candidate.oidcSubject) }
        : {}),
    },
  };
}

export function validateCreatePractitionerBody(body: unknown):
  | { ok: true; value: CreatePractitionerValidatedInput }
  | { ok: false; error: string } {
  const candidate = asObject(body);
  if (!candidate) {
    return { ok: false, error: 'Request body must be a JSON object' };
  }

  const clinicId = readRequiredString(candidate.clinicId, 'clinicId');
  if (!clinicId.ok) return clinicId;

  const practitionerCode = readRequiredString(candidate.practitionerCode, 'practitionerCode');
  if (!practitionerCode.ok) return practitionerCode;

  const firstName = readRequiredString(candidate.firstName, 'firstName');
  if (!firstName.ok) return firstName;

  const lastName = readRequiredString(candidate.lastName, 'lastName');
  if (!lastName.ok) return lastName;

  const userId = readOptionalNullableStringField(candidate, 'userId');
  if (!userId.ok) return userId;

  const licenseNumber = readOptionalNullableStringField(candidate, 'licenseNumber');
  if (!licenseNumber.ok) return licenseNumber;

  const specialty = readOptionalNullableStringField(candidate, 'specialty');
  if (!specialty.ok) return specialty;

  return {
    ok: true,
    value: {
      clinicId: clinicId.value,
      practitionerCode: practitionerCode.value,
      firstName: firstName.value,
      lastName: lastName.value,
      userId: userId.value,
      licenseNumber: licenseNumber.value,
      specialty: specialty.value,
    },
  };
}

export function validateUpdatePractitionerBody(body: unknown, practitionerId: string):
  | { ok: true; value: UpdatePractitionerValidatedInput }
  | { ok: false; error: string } {
  const candidate = asObject(body);
  if (!candidate) {
    return { ok: false, error: 'Request body must be a JSON object' };
  }

  const hasChanges = [
    'userId',
    'firstName',
    'lastName',
    'licenseNumber',
    'specialty',
    'isActive',
  ].some((field) => Object.hasOwn(candidate, field));
  if (!hasChanges) {
    return { ok: false, error: 'At least one practitioner field must be provided for update' };
  }

  const userId = readOptionalNullableStringField(candidate, 'userId');
  if (!userId.ok) return userId;

  const firstName = readOptionalTrimmedStringField(candidate, 'firstName');
  if (!firstName.ok) return firstName;

  const lastName = readOptionalTrimmedStringField(candidate, 'lastName');
  if (!lastName.ok) return lastName;

  const licenseNumber = readOptionalNullableStringField(candidate, 'licenseNumber');
  if (!licenseNumber.ok) return licenseNumber;

  const specialty = readOptionalNullableStringField(candidate, 'specialty');
  if (!specialty.ok) return specialty;

  const isActive = readOptionalBooleanField(candidate, 'isActive');
  if (!isActive.ok) return isActive;

  return {
    ok: true,
    value: {
      practitionerId,
      ...(Object.hasOwn(candidate, 'userId') ? { userId: userId.value } : {}),
      ...(Object.hasOwn(candidate, 'firstName') ? { firstName: firstName.value } : {}),
      ...(Object.hasOwn(candidate, 'lastName') ? { lastName: lastName.value } : {}),
      ...(Object.hasOwn(candidate, 'licenseNumber')
        ? { licenseNumber: licenseNumber.value }
        : {}),
      ...(Object.hasOwn(candidate, 'specialty') ? { specialty: specialty.value } : {}),
      ...(Object.hasOwn(candidate, 'isActive') ? { isActive: isActive.value } : {}),
    },
  };
}

export function validateCreatePrescriptionBody(body: unknown):
  | { ok: true; value: CreatePrescriptionInput }
  | { ok: false; error: string } {
  const candidate = asObject(body);
  if (!candidate) {
    return { ok: false, error: 'Request body must be a JSON object' };
  }

  const encounterId = readRequiredString(candidate.encounterId, 'encounterId');
  if (!encounterId.ok) return encounterId;

  const medicationName = readRequiredString(candidate.medicationName, 'medicationName');
  if (!medicationName.ok) return medicationName;

  const clinicalNoteId = readOptionalNullableStringField(candidate, 'clinicalNoteId');
  if (!clinicalNoteId.ok) return clinicalNoteId;

  const prescribedByPractitionerId = readOptionalNullableStringField(
    candidate,
    'prescribedByPractitionerId'
  );
  if (!prescribedByPractitionerId.ok) return prescribedByPractitionerId;

  const drugCatalogId = readOptionalNullableStringField(candidate, 'drugCatalogId');
  if (!drugCatalogId.ok) return drugCatalogId;

  const rxnormCode = readOptionalNullableStringField(candidate, 'rxnormCode');
  if (!rxnormCode.ok) return rxnormCode;

  const dosage = readOptionalNullableStringField(candidate, 'dosage');
  if (!dosage.ok) return dosage;

  const route = readOptionalNullableStringField(candidate, 'route');
  if (!route.ok) return route;

  const frequency = readOptionalNullableStringField(candidate, 'frequency');
  if (!frequency.ok) return frequency;

  const durationText = readOptionalNullableStringField(candidate, 'durationText');
  if (!durationText.ok) return durationText;

  const instructions = readOptionalNullableStringField(candidate, 'instructions');
  if (!instructions.ok) return instructions;

  const safetyOverrideReason = readOptionalNullableStringField(candidate, 'safetyOverrideReason');
  if (!safetyOverrideReason.ok) return safetyOverrideReason;

  const status = readEnumValue<PrescriptionStatus>(
    candidate.status,
    'status',
    ['active', 'completed', 'cancelled']
  );
  if (!status.ok) return status;

  const startDate = readOptionalNullableStringField(candidate, 'startDate');
  if (!startDate.ok) return startDate;

  const endDate = readOptionalNullableStringField(candidate, 'endDate');
  if (!endDate.ok) return endDate;

  return {
    ok: true,
    value: {
      encounterId: encounterId.value,
      clinicalNoteId: clinicalNoteId.value,
      prescribedByPractitionerId: prescribedByPractitionerId.value,
      drugCatalogId: drugCatalogId.value,
      medicationName: medicationName.value,
      rxnormCode: rxnormCode.value,
      dosage: dosage.value,
      route: route.value,
      frequency: frequency.value,
      durationText: durationText.value,
      instructions: instructions.value,
      safetyOverrideReason: safetyOverrideReason.value,
      status: status.value,
      startDate: startDate.value,
      endDate: endDate.value,
    },
  };
}

export function validateUpdatePrescriptionBody(body: unknown, prescriptionId: string):
  | { ok: true; value: UpdatePrescriptionInput }
  | { ok: false; error: string } {
  const candidate = asObject(body);
  if (!candidate) {
    return { ok: false, error: 'Request body must be a JSON object' };
  }

  const hasChanges = [
    'prescribedByPractitionerId',
    'drugCatalogId',
    'medicationName',
    'rxnormCode',
    'dosage',
    'route',
    'frequency',
    'durationText',
    'instructions',
    'safetyOverrideReason',
    'status',
    'startDate',
    'endDate',
  ].some((field) => Object.hasOwn(candidate, field));
  if (!hasChanges) {
    return { ok: false, error: 'At least one prescription field must be provided for update' };
  }

  const prescribedByPractitionerId = readOptionalNullableStringField(
    candidate,
    'prescribedByPractitionerId'
  );
  if (!prescribedByPractitionerId.ok) return prescribedByPractitionerId;

  const drugCatalogId = readOptionalNullableStringField(candidate, 'drugCatalogId');
  if (!drugCatalogId.ok) return drugCatalogId;

  const medicationName = readOptionalTrimmedStringField(candidate, 'medicationName');
  if (!medicationName.ok) return medicationName;

  const rxnormCode = readOptionalNullableStringField(candidate, 'rxnormCode');
  if (!rxnormCode.ok) return rxnormCode;

  const dosage = readOptionalNullableStringField(candidate, 'dosage');
  if (!dosage.ok) return dosage;

  const route = readOptionalNullableStringField(candidate, 'route');
  if (!route.ok) return route;

  const frequency = readOptionalNullableStringField(candidate, 'frequency');
  if (!frequency.ok) return frequency;

  const durationText = readOptionalNullableStringField(candidate, 'durationText');
  if (!durationText.ok) return durationText;

  const instructions = readOptionalNullableStringField(candidate, 'instructions');
  if (!instructions.ok) return instructions;

  const safetyOverrideReason = readOptionalNullableStringField(candidate, 'safetyOverrideReason');
  if (!safetyOverrideReason.ok) return safetyOverrideReason;

  const status = readEnumValue<PrescriptionStatus>(
    candidate.status,
    'status',
    ['active', 'completed', 'cancelled']
  );
  if (!status.ok) return status;

  const startDate = readOptionalNullableStringField(candidate, 'startDate');
  if (!startDate.ok) return startDate;

  const endDate = readOptionalNullableStringField(candidate, 'endDate');
  if (!endDate.ok) return endDate;

  return {
    ok: true,
    value: {
      prescriptionId,
      ...(Object.hasOwn(candidate, 'prescribedByPractitionerId')
        ? { prescribedByPractitionerId: prescribedByPractitionerId.value }
        : {}),
      ...(Object.hasOwn(candidate, 'drugCatalogId')
        ? { drugCatalogId: drugCatalogId.value }
        : {}),
      ...(Object.hasOwn(candidate, 'medicationName')
        ? { medicationName: medicationName.value }
        : {}),
      ...(Object.hasOwn(candidate, 'rxnormCode') ? { rxnormCode: rxnormCode.value } : {}),
      ...(Object.hasOwn(candidate, 'dosage') ? { dosage: dosage.value } : {}),
      ...(Object.hasOwn(candidate, 'route') ? { route: route.value } : {}),
      ...(Object.hasOwn(candidate, 'frequency') ? { frequency: frequency.value } : {}),
      ...(Object.hasOwn(candidate, 'durationText')
        ? { durationText: durationText.value }
        : {}),
      ...(Object.hasOwn(candidate, 'instructions') ? { instructions: instructions.value } : {}),
      ...(Object.hasOwn(candidate, 'safetyOverrideReason')
        ? { safetyOverrideReason: safetyOverrideReason.value }
        : {}),
      ...(Object.hasOwn(candidate, 'status') ? { status: status.value } : {}),
      ...(Object.hasOwn(candidate, 'startDate') ? { startDate: startDate.value } : {}),
      ...(Object.hasOwn(candidate, 'endDate') ? { endDate: endDate.value } : {}),
    },
  };
}

export function validateCreateDrugCatalogItemBody(body: unknown):
  | { ok: true; value: CreateDrugCatalogItemInput }
  | { ok: false; error: string } {
  const candidate = asObject(body);
  if (!candidate) {
    return { ok: false, error: 'Request body must be a JSON object' };
  }

  const clinicId = readRequiredString(candidate.clinicId, 'clinicId');
  if (!clinicId.ok) return clinicId;

  const medicationName = readRequiredString(candidate.medicationName, 'medicationName');
  if (!medicationName.ok) return medicationName;

  const rxnormCode = readOptionalNullableStringField(candidate, 'rxnormCode');
  if (!rxnormCode.ok) return rxnormCode;

  const genericName = readOptionalNullableStringField(candidate, 'genericName');
  if (!genericName.ok) return genericName;

  const strength = readOptionalNullableStringField(candidate, 'strength');
  if (!strength.ok) return strength;

  const dosageForm = readOptionalNullableStringField(candidate, 'dosageForm');
  if (!dosageForm.ok) return dosageForm;

  const route = readOptionalNullableStringField(candidate, 'route');
  if (!route.ok) return route;

  const allergenTags = readOptionalStringArrayField(candidate, 'allergenTags');
  if (!allergenTags.ok) return allergenTags;

  const isActive = readOptionalBooleanField(candidate, 'isActive');
  if (!isActive.ok) return isActive;

  return {
    ok: true,
    value: {
      clinicId: clinicId.value,
      medicationName: medicationName.value,
      rxnormCode: rxnormCode.value,
      genericName: genericName.value,
      strength: strength.value,
      dosageForm: dosageForm.value,
      route: route.value,
      allergenTags: allergenTags.value,
      isActive: isActive.value,
    },
  };
}

export function validateUpdateDrugCatalogItemBody(body: unknown, drugCatalogId: string):
  | { ok: true; value: UpdateDrugCatalogItemInput }
  | { ok: false; error: string } {
  const candidate = asObject(body);
  if (!candidate) {
    return { ok: false, error: 'Request body must be a JSON object' };
  }

  const hasChanges = [
    'medicationName',
    'rxnormCode',
    'genericName',
    'strength',
    'dosageForm',
    'route',
    'allergenTags',
    'isActive',
  ].some((field) => Object.hasOwn(candidate, field));
  if (!hasChanges) {
    return { ok: false, error: 'At least one drug catalog field must be provided for update' };
  }

  const medicationName = readOptionalTrimmedStringField(candidate, 'medicationName');
  if (!medicationName.ok) return medicationName;

  const rxnormCode = readOptionalNullableStringField(candidate, 'rxnormCode');
  if (!rxnormCode.ok) return rxnormCode;

  const genericName = readOptionalNullableStringField(candidate, 'genericName');
  if (!genericName.ok) return genericName;

  const strength = readOptionalNullableStringField(candidate, 'strength');
  if (!strength.ok) return strength;

  const dosageForm = readOptionalNullableStringField(candidate, 'dosageForm');
  if (!dosageForm.ok) return dosageForm;

  const route = readOptionalNullableStringField(candidate, 'route');
  if (!route.ok) return route;

  const allergenTags = readOptionalStringArrayField(candidate, 'allergenTags');
  if (!allergenTags.ok) return allergenTags;

  const isActive = readOptionalBooleanField(candidate, 'isActive');
  if (!isActive.ok) return isActive;

  return {
    ok: true,
    value: {
      drugCatalogId,
      ...(Object.hasOwn(candidate, 'medicationName')
        ? { medicationName: medicationName.value }
        : {}),
      ...(Object.hasOwn(candidate, 'rxnormCode') ? { rxnormCode: rxnormCode.value } : {}),
      ...(Object.hasOwn(candidate, 'genericName') ? { genericName: genericName.value } : {}),
      ...(Object.hasOwn(candidate, 'strength') ? { strength: strength.value } : {}),
      ...(Object.hasOwn(candidate, 'dosageForm') ? { dosageForm: dosageForm.value } : {}),
      ...(Object.hasOwn(candidate, 'route') ? { route: route.value } : {}),
      ...(Object.hasOwn(candidate, 'allergenTags')
        ? { allergenTags: allergenTags.value }
        : {}),
      ...(Object.hasOwn(candidate, 'isActive') ? { isActive: isActive.value } : {}),
    },
  };
}

export function validateCreateInventoryItemBody(body: unknown):
  | { ok: true; value: CreateInventoryItemInput }
  | { ok: false; error: string } {
  const candidate = asObject(body);
  if (!candidate) {
    return { ok: false, error: 'Request body must be a JSON object' };
  }

  const clinicId = readRequiredString(candidate.clinicId, 'clinicId');
  if (!clinicId.ok) return clinicId;
  const itemCode = readRequiredString(candidate.itemCode, 'itemCode');
  if (!itemCode.ok) return itemCode;
  const displayName = readRequiredString(candidate.displayName, 'displayName');
  if (!displayName.ok) return displayName;
  const barcode = readOptionalNullableStringField(candidate, 'barcode');
  if (!barcode.ok) return barcode;
  const barcodeRequired = readOptionalBooleanField(candidate, 'barcodeRequired');
  if (!barcodeRequired.ok) return barcodeRequired;
  const drugCatalogId = readOptionalNullableStringField(candidate, 'drugCatalogId');
  if (!drugCatalogId.ok) return drugCatalogId;
  const unit = readOptionalTrimmedStringField(candidate, 'unit');
  if (!unit.ok) return unit;
  const quantityOnHand = readOptionalNonNegativeNumberLikeField(candidate, 'quantityOnHand');
  if (!quantityOnHand.ok) return quantityOnHand;
  const reorderLevel = readOptionalNonNegativeNumberLikeField(candidate, 'reorderLevel');
  if (!reorderLevel.ok) return reorderLevel;
  const isActive = readOptionalBooleanField(candidate, 'isActive');
  if (!isActive.ok) return isActive;
  const notes = readOptionalNullableStringField(candidate, 'notes');
  if (!notes.ok) return notes;

  return {
    ok: true,
    value: {
      clinicId: clinicId.value,
      itemCode: itemCode.value,
      displayName: displayName.value,
      barcode: barcode.value,
      barcodeRequired: barcodeRequired.value,
      drugCatalogId: drugCatalogId.value,
      unit: unit.value,
      quantityOnHand: quantityOnHand.value ?? undefined,
      reorderLevel: reorderLevel.value ?? undefined,
      isActive: isActive.value,
      notes: notes.value,
    },
  };
}

export function validateUpdateInventoryItemBody(
  body: unknown,
  inventoryItemId: string
): { ok: true; value: UpdateInventoryItemInput } | { ok: false; error: string } {
  const candidate = asObject(body);
  if (!candidate) {
    return { ok: false, error: 'Request body must be a JSON object' };
  }

  const hasChanges = [
    'drugCatalogId',
    'itemCode',
    'displayName',
    'barcode',
    'barcodeRequired',
    'unit',
    'reorderLevel',
    'isActive',
    'notes',
  ].some((field) => Object.hasOwn(candidate, field));
  if (!hasChanges) return { ok: false, error: 'At least one inventory item field must be provided for update' };

  const drugCatalogId = readOptionalNullableStringField(candidate, 'drugCatalogId');
  if (!drugCatalogId.ok) return drugCatalogId;
  const itemCode = readOptionalTrimmedStringField(candidate, 'itemCode');
  if (!itemCode.ok) return itemCode;
  const displayName = readOptionalTrimmedStringField(candidate, 'displayName');
  if (!displayName.ok) return displayName;
  const barcode = readOptionalNullableStringField(candidate, 'barcode');
  if (!barcode.ok) return barcode;
  const barcodeRequired = readOptionalBooleanField(candidate, 'barcodeRequired');
  if (!barcodeRequired.ok) return barcodeRequired;
  const unit = readOptionalTrimmedStringField(candidate, 'unit');
  if (!unit.ok) return unit;
  const reorderLevel = readOptionalNonNegativeNumberLikeField(candidate, 'reorderLevel');
  if (!reorderLevel.ok) return reorderLevel;
  const isActive = readOptionalBooleanField(candidate, 'isActive');
  if (!isActive.ok) return isActive;
  const notes = readOptionalNullableStringField(candidate, 'notes');
  if (!notes.ok) return notes;

  return {
    ok: true,
    value: {
      inventoryItemId,
      ...(Object.hasOwn(candidate, 'drugCatalogId') ? { drugCatalogId: drugCatalogId.value } : {}),
      ...(Object.hasOwn(candidate, 'itemCode') ? { itemCode: itemCode.value } : {}),
      ...(Object.hasOwn(candidate, 'displayName') ? { displayName: displayName.value } : {}),
      ...(Object.hasOwn(candidate, 'barcode') ? { barcode: barcode.value } : {}),
      ...(Object.hasOwn(candidate, 'barcodeRequired') ? { barcodeRequired: barcodeRequired.value } : {}),
      ...(Object.hasOwn(candidate, 'unit') ? { unit: unit.value } : {}),
      ...(Object.hasOwn(candidate, 'reorderLevel') ? { reorderLevel: reorderLevel.value ?? undefined } : {}),
      ...(Object.hasOwn(candidate, 'isActive') ? { isActive: isActive.value } : {}),
      ...(Object.hasOwn(candidate, 'notes') ? { notes: notes.value } : {}),
    },
  };
}

export function validateAdjustInventoryStockBody(
  body: unknown,
  inventoryItemId: string
): { ok: true; value: AdjustInventoryStockInput } | { ok: false; error: string } {
  const candidate = asObject(body);
  if (!candidate) {
    return { ok: false, error: 'Request body must be a JSON object' };
  }

  const movementType = readRequiredEnumValue<Exclude<StockMovementType, 'dispense'>>(
    candidate.movementType,
    'movementType',
    manualStockMovementTypes
  );
  if (!movementType.ok) return movementType;
  const quantity = readPositiveNumberLikeValue(candidate.quantity, 'quantity');
  if (!quantity.ok) return quantity;
  const reason = readOptionalNullableStringField(candidate, 'reason');
  if (!reason.ok) return reason;
  const performedByUserId = readOptionalNullableStringField(candidate, 'performedByUserId');
  if (!performedByUserId.ok) return performedByUserId;

  return {
    ok: true,
    value: {
      inventoryItemId,
      movementType: movementType.value,
      quantity: quantity.value,
      reason: reason.value,
      performedByUserId: performedByUserId.value,
    },
  };
}

export function validateReceiveInventoryLotBody(body: unknown):
  | { ok: true; value: ReceiveInventoryLotInput }
  | { ok: false; error: string } {
  const candidate = asObject(body);
  if (!candidate) {
    return { ok: false, error: 'Request body must be a JSON object' };
  }

  const inventoryItemId = readRequiredString(candidate.inventoryItemId, 'inventoryItemId');
  if (!inventoryItemId.ok) return inventoryItemId;
  const lotNumber = readRequiredString(candidate.lotNumber, 'lotNumber');
  if (!lotNumber.ok) return lotNumber;
  const lotBarcode = readOptionalNullableStringField(candidate, 'lotBarcode');
  if (!lotBarcode.ok) return lotBarcode;
  const scannedBarcode = readOptionalNullableStringField(candidate, 'scannedBarcode');
  if (!scannedBarcode.ok) return scannedBarcode;
  const requireBarcodeVerification = readOptionalBooleanField(candidate, 'requireBarcodeVerification');
  if (!requireBarcodeVerification.ok) return requireBarcodeVerification;
  const expiresOn = readOptionalNullableDateField(candidate, 'expiresOn');
  if (!expiresOn.ok) return expiresOn;
  const quantity = readPositiveNumberLikeValue(candidate.quantity, 'quantity');
  if (!quantity.ok) return quantity;
  const supplierId = readOptionalNullableStringField(candidate, 'supplierId');
  if (!supplierId.ok) return supplierId;
  const supplierName = readOptionalNullableStringField(candidate, 'supplierName');
  if (!supplierName.ok) return supplierName;
  const referenceNumber = readOptionalNullableStringField(candidate, 'referenceNumber');
  if (!referenceNumber.ok) return referenceNumber;
  const receivedByUserId = readOptionalNullableStringField(candidate, 'receivedByUserId');
  if (!receivedByUserId.ok) return receivedByUserId;
  const notes = readOptionalNullableStringField(candidate, 'notes');
  if (!notes.ok) return notes;

  return {
    ok: true,
    value: {
      inventoryItemId: inventoryItemId.value,
      lotNumber: lotNumber.value,
      lotBarcode: lotBarcode.value,
      scannedBarcode: scannedBarcode.value,
      requireBarcodeVerification: requireBarcodeVerification.value,
      expiresOn: expiresOn.value,
      quantity: quantity.value,
      supplierId: supplierId.value,
      supplierName: supplierName.value,
      referenceNumber: referenceNumber.value,
      receivedByUserId: receivedByUserId.value,
      notes: notes.value,
    },
  };
}

export function validateCreateSupplierBody(body: unknown):
  | { ok: true; value: CreateSupplierInput }
  | { ok: false; error: string } {
  const candidate = asObject(body);
  if (!candidate) {
    return { ok: false, error: 'Request body must be a JSON object' };
  }

  const clinicId = readRequiredString(candidate.clinicId, 'clinicId');
  if (!clinicId.ok) return clinicId;
  const supplierCode = readRequiredString(candidate.supplierCode, 'supplierCode');
  if (!supplierCode.ok) return supplierCode;
  const displayName = readRequiredString(candidate.displayName, 'displayName');
  if (!displayName.ok) return displayName;
  const contactName = readOptionalNullableStringField(candidate, 'contactName');
  if (!contactName.ok) return contactName;
  const phoneNumber = readOptionalNullableStringField(candidate, 'phoneNumber');
  if (!phoneNumber.ok) return phoneNumber;
  const email = readOptionalNullableStringField(candidate, 'email');
  if (!email.ok) return email;
  const address = readOptionalNullableStringField(candidate, 'address');
  if (!address.ok) return address;
  const status = readEnumValue<SupplierStatus>(candidate.status, 'status', supplierStatuses);
  if (!status.ok) return status;
  const notes = readOptionalNullableStringField(candidate, 'notes');
  if (!notes.ok) return notes;

  return {
    ok: true,
    value: {
      clinicId: clinicId.value,
      supplierCode: supplierCode.value,
      displayName: displayName.value,
      contactName: contactName.value,
      phoneNumber: phoneNumber.value,
      email: email.value,
      address: address.value,
      status: status.value,
      notes: notes.value,
    },
  };
}

export function validateUpdateSupplierBody(
  body: unknown,
  supplierId: string
): { ok: true; value: UpdateSupplierInput } | { ok: false; error: string } {
  const candidate = asObject(body);
  if (!candidate) {
    return { ok: false, error: 'Request body must be a JSON object' };
  }

  const hasChanges = [
    'supplierCode',
    'displayName',
    'contactName',
    'phoneNumber',
    'email',
    'address',
    'status',
    'notes',
  ].some((field) => Object.hasOwn(candidate, field));
  if (!hasChanges) return { ok: false, error: 'At least one supplier field must be provided for update' };

  const supplierCode = readOptionalTrimmedStringField(candidate, 'supplierCode');
  if (!supplierCode.ok) return supplierCode;
  const displayName = readOptionalTrimmedStringField(candidate, 'displayName');
  if (!displayName.ok) return displayName;
  const contactName = readOptionalNullableStringField(candidate, 'contactName');
  if (!contactName.ok) return contactName;
  const phoneNumber = readOptionalNullableStringField(candidate, 'phoneNumber');
  if (!phoneNumber.ok) return phoneNumber;
  const email = readOptionalNullableStringField(candidate, 'email');
  if (!email.ok) return email;
  const address = readOptionalNullableStringField(candidate, 'address');
  if (!address.ok) return address;
  const status = readEnumValue<SupplierStatus>(candidate.status, 'status', supplierStatuses);
  if (!status.ok) return status;
  const notes = readOptionalNullableStringField(candidate, 'notes');
  if (!notes.ok) return notes;

  return {
    ok: true,
    value: {
      supplierId,
      ...(Object.hasOwn(candidate, 'supplierCode') ? { supplierCode: supplierCode.value } : {}),
      ...(Object.hasOwn(candidate, 'displayName') ? { displayName: displayName.value } : {}),
      ...(Object.hasOwn(candidate, 'contactName') ? { contactName: contactName.value } : {}),
      ...(Object.hasOwn(candidate, 'phoneNumber') ? { phoneNumber: phoneNumber.value } : {}),
      ...(Object.hasOwn(candidate, 'email') ? { email: email.value } : {}),
      ...(Object.hasOwn(candidate, 'address') ? { address: address.value } : {}),
      ...(Object.hasOwn(candidate, 'status') ? { status: status.value } : {}),
      ...(Object.hasOwn(candidate, 'notes') ? { notes: notes.value } : {}),
    },
  };
}

function validatePurchaseOrderLine(
  item: unknown,
  index: number
): { ok: true; value: CreatePurchaseOrderInput['lines'][number] } | { ok: false; error: string } {
  if (!item || typeof item !== 'object' || Array.isArray(item)) {
    return { ok: false, error: `lines[${index}] must be an object` };
  }

  const entry = item as Record<string, unknown>;
  const inventoryItemId = readRequiredString(entry.inventoryItemId, `lines[${index}].inventoryItemId`);
  if (!inventoryItemId.ok) return inventoryItemId;
  const description = readRequiredString(entry.description, `lines[${index}].description`);
  if (!description.ok) return description;
  const orderedQuantity = readPositiveNumberLikeValue(entry.orderedQuantity, `lines[${index}].orderedQuantity`);
  if (!orderedQuantity.ok) return orderedQuantity;
  const unitPriceAmount = readOptionalNonNegativeNumberLikeValue(
    entry.unitPriceAmount,
    `lines[${index}].unitPriceAmount`
  );
  if (!unitPriceAmount.ok) return unitPriceAmount;
  const notes = readOptionalNullableStringField(entry, 'notes');
  if (!notes.ok) return notes;

  return {
    ok: true,
    value: {
      inventoryItemId: inventoryItemId.value,
      description: description.value,
      orderedQuantity: orderedQuantity.value,
      unitPriceAmount: unitPriceAmount.value ?? undefined,
      notes: notes.value,
    },
  };
}

export function validateCreatePurchaseOrderBody(body: unknown):
  | { ok: true; value: CreatePurchaseOrderInput }
  | { ok: false; error: string } {
  const candidate = asObject(body);
  if (!candidate) {
    return { ok: false, error: 'Request body must be a JSON object' };
  }

  const clinicId = readRequiredString(candidate.clinicId, 'clinicId');
  if (!clinicId.ok) return clinicId;
  const purchaseOrderNumber = readRequiredString(candidate.purchaseOrderNumber, 'purchaseOrderNumber');
  if (!purchaseOrderNumber.ok) return purchaseOrderNumber;
  const supplierId = readOptionalNullableStringField(candidate, 'supplierId');
  if (!supplierId.ok) return supplierId;
  const status = readEnumValue<PurchaseOrderStatus>(candidate.status, 'status', purchaseOrderStatuses);
  if (!status.ok) return status;
  const orderedAt = readOptionalNullableStringField(candidate, 'orderedAt');
  if (!orderedAt.ok) return orderedAt;
  const expectedAt = readOptionalNullableDateField(candidate, 'expectedAt');
  if (!expectedAt.ok) return expectedAt;
  const createdByUserId = readOptionalNullableStringField(candidate, 'createdByUserId');
  if (!createdByUserId.ok) return createdByUserId;
  const notes = readOptionalNullableStringField(candidate, 'notes');
  if (!notes.ok) return notes;

  if (!Array.isArray(candidate.lines) || candidate.lines.length === 0) {
    return { ok: false, error: 'lines must be a non-empty array' };
  }
  const lines: CreatePurchaseOrderInput['lines'] = [];
  for (const [index, line] of candidate.lines.entries()) {
    const validated = validatePurchaseOrderLine(line, index);
    if (!validated.ok) return validated;
    lines.push(validated.value);
  }

  return {
    ok: true,
    value: {
      clinicId: clinicId.value,
      purchaseOrderNumber: purchaseOrderNumber.value,
      supplierId: supplierId.value,
      status: status.value,
      orderedAt: orderedAt.value,
      expectedAt: expectedAt.value,
      createdByUserId: createdByUserId.value,
      notes: notes.value,
      lines,
    },
  };
}

export function validateUpdatePurchaseOrderBody(
  body: unknown,
  purchaseOrderId: string
): { ok: true; value: UpdatePurchaseOrderInput } | { ok: false; error: string } {
  const candidate = asObject(body);
  if (!candidate) {
    return { ok: false, error: 'Request body must be a JSON object' };
  }

  const hasChanges = ['supplierId', 'status', 'orderedAt', 'expectedAt', 'notes'].some((field) =>
    Object.hasOwn(candidate, field)
  );
  if (!hasChanges) return { ok: false, error: 'At least one purchase order field must be provided for update' };

  const supplierId = readOptionalNullableStringField(candidate, 'supplierId');
  if (!supplierId.ok) return supplierId;
  const status = readEnumValue<PurchaseOrderStatus>(candidate.status, 'status', purchaseOrderStatuses);
  if (!status.ok) return status;
  const orderedAt = readOptionalNullableStringField(candidate, 'orderedAt');
  if (!orderedAt.ok) return orderedAt;
  const expectedAt = readOptionalNullableDateField(candidate, 'expectedAt');
  if (!expectedAt.ok) return expectedAt;
  const notes = readOptionalNullableStringField(candidate, 'notes');
  if (!notes.ok) return notes;

  return {
    ok: true,
    value: {
      purchaseOrderId,
      ...(Object.hasOwn(candidate, 'supplierId') ? { supplierId: supplierId.value } : {}),
      ...(Object.hasOwn(candidate, 'status') ? { status: status.value } : {}),
      ...(Object.hasOwn(candidate, 'orderedAt') ? { orderedAt: orderedAt.value } : {}),
      ...(Object.hasOwn(candidate, 'expectedAt') ? { expectedAt: expectedAt.value } : {}),
      ...(Object.hasOwn(candidate, 'notes') ? { notes: notes.value } : {}),
    },
  };
}

export function validateReceivePurchaseOrderBody(
  body: unknown,
  purchaseOrderId: string
): { ok: true; value: ReceivePurchaseOrderInput } | { ok: false; error: string } {
  const candidate = asObject(body);
  if (!candidate) {
    return { ok: false, error: 'Request body must be a JSON object' };
  }

  const purchaseOrderLineId = readRequiredString(candidate.purchaseOrderLineId, 'purchaseOrderLineId');
  if (!purchaseOrderLineId.ok) return purchaseOrderLineId;
  const lotNumber = readRequiredString(candidate.lotNumber, 'lotNumber');
  if (!lotNumber.ok) return lotNumber;
  const lotBarcode = readOptionalNullableStringField(candidate, 'lotBarcode');
  if (!lotBarcode.ok) return lotBarcode;
  const scannedBarcode = readOptionalNullableStringField(candidate, 'scannedBarcode');
  if (!scannedBarcode.ok) return scannedBarcode;
  const requireBarcodeVerification = readOptionalBooleanField(candidate, 'requireBarcodeVerification');
  if (!requireBarcodeVerification.ok) return requireBarcodeVerification;
  const expiresOn = readOptionalNullableDateField(candidate, 'expiresOn');
  if (!expiresOn.ok) return expiresOn;
  const quantity = readPositiveNumberLikeValue(candidate.quantity, 'quantity');
  if (!quantity.ok) return quantity;
  const receivedByUserId = readOptionalNullableStringField(candidate, 'receivedByUserId');
  if (!receivedByUserId.ok) return receivedByUserId;
  const notes = readOptionalNullableStringField(candidate, 'notes');
  if (!notes.ok) return notes;

  return {
    ok: true,
    value: {
      purchaseOrderId,
      purchaseOrderLineId: purchaseOrderLineId.value,
      lotNumber: lotNumber.value,
      lotBarcode: lotBarcode.value,
      scannedBarcode: scannedBarcode.value,
      requireBarcodeVerification: requireBarcodeVerification.value,
      expiresOn: expiresOn.value,
      quantity: quantity.value,
      receivedByUserId: receivedByUserId.value,
      notes: notes.value,
    },
  };
}

export function validateSubmitPurchaseOrderBody(
  body: unknown,
  purchaseOrderId: string
): { ok: true; value: SubmitPurchaseOrderInput } | { ok: false; error: string } {
  const candidate = asObject(body);
  if (!candidate) {
    return { ok: false, error: 'Request body must be a JSON object' };
  }

  const submittedByUserId = readOptionalNullableStringField(candidate, 'submittedByUserId');
  if (!submittedByUserId.ok) return submittedByUserId;

  return {
    ok: true,
    value: {
      purchaseOrderId,
      submittedByUserId: submittedByUserId.value,
    },
  };
}

export function validateApprovePurchaseOrderBody(
  body: unknown,
  purchaseOrderId: string
): { ok: true; value: ApprovePurchaseOrderInput } | { ok: false; error: string } {
  const candidate = asObject(body);
  if (!candidate) {
    return { ok: false, error: 'Request body must be a JSON object' };
  }

  const approvedByUserId = readOptionalNullableStringField(candidate, 'approvedByUserId');
  if (!approvedByUserId.ok) return approvedByUserId;
  const approvalStepId = readOptionalNullableStringField(candidate, 'approvalStepId');
  if (!approvalStepId.ok) return approvalStepId;
  const approverRole = readEnumValue<UserRole>(candidate.approverRole, 'approverRole', userRoles);
  if (!approverRole.ok) return approverRole;

  return {
    ok: true,
    value: {
      purchaseOrderId,
      approvalStepId: approvalStepId.value,
      approvedByUserId: approvedByUserId.value,
      approverRole: approverRole.value,
    },
  };
}

export function validateRejectPurchaseOrderBody(
  body: unknown,
  purchaseOrderId: string
): { ok: true; value: RejectPurchaseOrderInput } | { ok: false; error: string } {
  const candidate = asObject(body);
  if (!candidate) {
    return { ok: false, error: 'Request body must be a JSON object' };
  }

  const rejectedByUserId = readOptionalNullableStringField(candidate, 'rejectedByUserId');
  if (!rejectedByUserId.ok) return rejectedByUserId;
  const approvalStepId = readOptionalNullableStringField(candidate, 'approvalStepId');
  if (!approvalStepId.ok) return approvalStepId;
  const approverRole = readEnumValue<UserRole>(candidate.approverRole, 'approverRole', userRoles);
  if (!approverRole.ok) return approverRole;
  const rejectionReason = readRequiredString(candidate.rejectionReason, 'rejectionReason');
  if (!rejectionReason.ok) return rejectionReason;

  return {
    ok: true,
    value: {
      purchaseOrderId,
      approvalStepId: approvalStepId.value,
      rejectedByUserId: rejectedByUserId.value,
      approverRole: approverRole.value,
      rejectionReason: rejectionReason.value,
    },
  };
}

export function validateCreatePurchaseOrderApprovalPolicyBody(body: unknown):
  | { ok: true; value: CreatePurchaseOrderApprovalPolicyInput }
  | { ok: false; error: string } {
  const candidate = asObject(body);
  if (!candidate) {
    return { ok: false, error: 'Request body must be a JSON object' };
  }

  const clinicId = readRequiredString(candidate.clinicId, 'clinicId');
  if (!clinicId.ok) return clinicId;
  const policyName = readRequiredString(candidate.policyName, 'policyName');
  if (!policyName.ok) return policyName;
  const minTotalAmount = readOptionalNonNegativeNumberLikeField(candidate, 'minTotalAmount');
  if (!minTotalAmount.ok) return minTotalAmount;
  const maxTotalAmount = readOptionalNonNegativeNumberLikeField(candidate, 'maxTotalAmount');
  if (!maxTotalAmount.ok) return maxTotalAmount;
  const approvalSequence = readPositiveIntegerValue(candidate.approvalSequence, 'approvalSequence');
  if (!approvalSequence.ok) return approvalSequence;
  const requiredRole = readEnumValue<UserRole>(candidate.requiredRole, 'requiredRole', userRoles);
  if (!requiredRole.ok) return requiredRole;
  const isActive = readOptionalBooleanField(candidate, 'isActive');
  if (!isActive.ok) return isActive;
  const notes = readOptionalNullableStringField(candidate, 'notes');
  if (!notes.ok) return notes;

  return {
    ok: true,
    value: {
      clinicId: clinicId.value,
      policyName: policyName.value,
      minTotalAmount: minTotalAmount.value ?? undefined,
      maxTotalAmount: maxTotalAmount.value,
      approvalSequence: approvalSequence.value,
      requiredRole: requiredRole.value,
      isActive: isActive.value,
      notes: notes.value,
    },
  };
}

export function validateUpdatePurchaseOrderApprovalPolicyBody(
  body: unknown,
  policyId: string
): { ok: true; value: UpdatePurchaseOrderApprovalPolicyInput } | { ok: false; error: string } {
  const candidate = asObject(body);
  if (!candidate) {
    return { ok: false, error: 'Request body must be a JSON object' };
  }

  const hasChanges = [
    'policyName',
    'minTotalAmount',
    'maxTotalAmount',
    'approvalSequence',
    'requiredRole',
    'isActive',
    'notes',
  ].some((field) => Object.hasOwn(candidate, field));
  if (!hasChanges) {
    return { ok: false, error: 'At least one approval policy field must be provided for update' };
  }

  const policyName = readOptionalTrimmedStringField(candidate, 'policyName');
  if (!policyName.ok) return policyName;
  const minTotalAmount = readOptionalNonNegativeNumberLikeField(candidate, 'minTotalAmount');
  if (!minTotalAmount.ok) return minTotalAmount;
  const maxTotalAmount = readOptionalNonNegativeNumberLikeField(candidate, 'maxTotalAmount');
  if (!maxTotalAmount.ok) return maxTotalAmount;
  const approvalSequence = Object.hasOwn(candidate, 'approvalSequence')
    ? readPositiveIntegerValue(candidate.approvalSequence, 'approvalSequence')
    : { ok: true as const, value: undefined };
  if (!approvalSequence.ok) return approvalSequence;
  const requiredRole = readEnumValue<UserRole>(candidate.requiredRole, 'requiredRole', userRoles);
  if (!requiredRole.ok) return requiredRole;
  const isActive = readOptionalBooleanField(candidate, 'isActive');
  if (!isActive.ok) return isActive;
  const notes = readOptionalNullableStringField(candidate, 'notes');
  if (!notes.ok) return notes;

  return {
    ok: true,
    value: {
      policyId,
      ...(Object.hasOwn(candidate, 'policyName') ? { policyName: policyName.value } : {}),
      ...(Object.hasOwn(candidate, 'minTotalAmount')
        ? { minTotalAmount: minTotalAmount.value ?? undefined }
        : {}),
      ...(Object.hasOwn(candidate, 'maxTotalAmount') ? { maxTotalAmount: maxTotalAmount.value } : {}),
      ...(Object.hasOwn(candidate, 'approvalSequence')
        ? { approvalSequence: approvalSequence.value }
        : {}),
      ...(Object.hasOwn(candidate, 'requiredRole') ? { requiredRole: requiredRole.value } : {}),
      ...(Object.hasOwn(candidate, 'isActive') ? { isActive: isActive.value } : {}),
      ...(Object.hasOwn(candidate, 'notes') ? { notes: notes.value } : {}),
    },
  };
}

export function validateDispensePrescriptionBody(
  body: unknown,
  prescriptionId: string
): { ok: true; value: DispensePrescriptionInput } | { ok: false; error: string } {
  const candidate = asObject(body);
  if (!candidate) {
    return { ok: false, error: 'Request body must be a JSON object' };
  }

  const inventoryItemId = readRequiredString(candidate.inventoryItemId, 'inventoryItemId');
  if (!inventoryItemId.ok) return inventoryItemId;
  const inventoryLotId = readOptionalNullableStringField(candidate, 'inventoryLotId');
  if (!inventoryLotId.ok) return inventoryLotId;
  const scannedBarcode = readOptionalNullableStringField(candidate, 'scannedBarcode');
  if (!scannedBarcode.ok) return scannedBarcode;
  const requireBarcodeVerification = readOptionalBooleanField(candidate, 'requireBarcodeVerification');
  if (!requireBarcodeVerification.ok) return requireBarcodeVerification;
  const quantity = readPositiveNumberLikeValue(candidate.quantity, 'quantity');
  if (!quantity.ok) return quantity;
  const dispensedByUserId = readOptionalNullableStringField(candidate, 'dispensedByUserId');
  if (!dispensedByUserId.ok) return dispensedByUserId;
  const notes = readOptionalNullableStringField(candidate, 'notes');
  if (!notes.ok) return notes;

  return {
    ok: true,
    value: {
      prescriptionId,
      inventoryItemId: inventoryItemId.value,
      inventoryLotId: inventoryLotId.value,
      scannedBarcode: scannedBarcode.value,
      requireBarcodeVerification: requireBarcodeVerification.value,
      quantity: quantity.value,
      dispensedByUserId: dispensedByUserId.value,
      notes: notes.value,
    },
  };
}

export function validateCreateInventoryPrinterProfileBody(body: unknown):
  | { ok: true; value: CreateInventoryPrinterProfileInput }
  | { ok: false; error: string } {
  const candidate = asObject(body);
  if (!candidate) {
    return { ok: false, error: 'Request body must be a JSON object' };
  }

  const clinicId = readRequiredString(candidate.clinicId, 'clinicId');
  if (!clinicId.ok) return clinicId;
  const profileName = readRequiredString(candidate.profileName, 'profileName');
  if (!profileName.ok) return profileName;
  const printerLanguage = readEnumValue<InventoryBarcodePrintLanguage>(
    candidate.printerLanguage,
    'printerLanguage',
    inventoryBarcodePrintLanguages
  );
  if (!printerLanguage.ok) return printerLanguage;
  const connectionType = readEnumValue<InventoryPrinterConnectionType>(
    candidate.connectionType,
    'connectionType',
    inventoryPrinterConnectionTypes
  );
  if (!connectionType.ok) return connectionType;
  const endpointUrl = readOptionalNullableStringField(candidate, 'endpointUrl');
  if (!endpointUrl.ok) return endpointUrl;
  const locationName = readOptionalNullableStringField(candidate, 'locationName');
  if (!locationName.ok) return locationName;
  const isDefault = readOptionalBooleanField(candidate, 'isDefault');
  if (!isDefault.ok) return isDefault;
  const isActive = readOptionalBooleanField(candidate, 'isActive');
  if (!isActive.ok) return isActive;
  const notes = readOptionalNullableStringField(candidate, 'notes');
  if (!notes.ok) return notes;

  return {
    ok: true,
    value: {
      clinicId: clinicId.value,
      profileName: profileName.value,
      printerLanguage: printerLanguage.value,
      connectionType: connectionType.value,
      endpointUrl: endpointUrl.value,
      locationName: locationName.value,
      isDefault: isDefault.value,
      isActive: isActive.value,
      notes: notes.value,
    },
  };
}

export function validateUpdateInventoryPrinterProfileBody(
  body: unknown,
  profileId: string
): { ok: true; value: UpdateInventoryPrinterProfileInput } | { ok: false; error: string } {
  const candidate = asObject(body);
  if (!candidate) {
    return { ok: false, error: 'Request body must be a JSON object' };
  }

  const profileName = readOptionalTrimmedStringField(candidate, 'profileName');
  if (!profileName.ok) return profileName;
  const printerLanguage = readEnumValue<InventoryBarcodePrintLanguage>(
    candidate.printerLanguage,
    'printerLanguage',
    inventoryBarcodePrintLanguages
  );
  if (!printerLanguage.ok) return printerLanguage;
  const connectionType = readEnumValue<InventoryPrinterConnectionType>(
    candidate.connectionType,
    'connectionType',
    inventoryPrinterConnectionTypes
  );
  if (!connectionType.ok) return connectionType;
  const endpointUrl = readOptionalNullableStringField(candidate, 'endpointUrl');
  if (!endpointUrl.ok) return endpointUrl;
  const locationName = readOptionalNullableStringField(candidate, 'locationName');
  if (!locationName.ok) return locationName;
  const isDefault = readOptionalBooleanField(candidate, 'isDefault');
  if (!isDefault.ok) return isDefault;
  const isActive = readOptionalBooleanField(candidate, 'isActive');
  if (!isActive.ok) return isActive;
  const notes = readOptionalNullableStringField(candidate, 'notes');
  if (!notes.ok) return notes;

  return {
    ok: true,
    value: {
      profileId,
      profileName: profileName.value,
      printerLanguage: printerLanguage.value,
      connectionType: connectionType.value,
      endpointUrl: endpointUrl.value,
      locationName: locationName.value,
      isDefault: isDefault.value,
      isActive: isActive.value,
      notes: notes.value,
    },
  };
}

export function validateScanInventoryBarcodeBody(body: unknown):
  | { ok: true; value: ScanInventoryBarcodeInput }
  | { ok: false; error: string } {
  const candidate = asObject(body);
  if (!candidate) {
    return { ok: false, error: 'Request body must be a JSON object' };
  }

  const clinicId = readRequiredString(candidate.clinicId, 'clinicId');
  if (!clinicId.ok) return clinicId;
  const barcode = readRequiredString(candidate.barcode, 'barcode');
  if (!barcode.ok) return barcode;
  const scanContext = readEnumValue<InventoryBarcodeScanContext>(
    candidate.scanContext,
    'scanContext',
    inventoryBarcodeScanContexts
  );
  if (!scanContext.ok) return scanContext;
  const scannedByUserId = readOptionalNullableStringField(candidate, 'scannedByUserId');
  if (!scannedByUserId.ok) return scannedByUserId;
  const notes = readOptionalNullableStringField(candidate, 'notes');
  if (!notes.ok) return notes;

  return {
    ok: true,
    value: {
      clinicId: clinicId.value,
      barcode: barcode.value,
      scanContext: scanContext.value,
      scannedByUserId: scannedByUserId.value,
      notes: notes.value,
    },
  };
}

export function validateCreateInventoryBarcodePrintJobBody(body: unknown):
  | { ok: true; value: CreateInventoryBarcodePrintJobInput }
  | { ok: false; error: string } {
  const candidate = asObject(body);
  if (!candidate) {
    return { ok: false, error: 'Request body must be a JSON object' };
  }

  const clinicId = readRequiredString(candidate.clinicId, 'clinicId');
  if (!clinicId.ok) return clinicId;
  const printerLanguage = readEnumValue<InventoryBarcodePrintLanguage>(
    candidate.printerLanguage,
    'printerLanguage',
    inventoryBarcodePrintLanguages
  );
  if (!printerLanguage.ok) return printerLanguage;
  const printerProfileId = readOptionalNullableStringField(candidate, 'printerProfileId');
  if (!printerProfileId.ok) return printerProfileId;
  const requestedByUserId = readOptionalNullableStringField(candidate, 'requestedByUserId');
  if (!requestedByUserId.ok) return requestedByUserId;
  const notes = readOptionalNullableStringField(candidate, 'notes');
  if (!notes.ok) return notes;

  if (!Array.isArray(candidate.labels) || candidate.labels.length === 0) {
    return { ok: false, error: 'labels must be a non-empty array' };
  }
  const labels: CreateInventoryBarcodePrintJobInput['labels'] = [];
  for (const [index, item] of candidate.labels.entries()) {
    const entry = asObject(item);
    if (!entry) return { ok: false, error: `labels[${index}] must be an object` };
    const title = readRequiredString(entry.title, `labels[${index}].title`);
    if (!title.ok) return title;
    const barcode = readRequiredString(entry.barcode, `labels[${index}].barcode`);
    if (!barcode.ok) return barcode;
    const type = readOptionalNullableStringField(entry, 'type');
    if (!type.ok) return type;
    const subtitle = readOptionalNullableStringField(entry, 'subtitle');
    if (!subtitle.ok) return subtitle;
    const detail = readOptionalNullableStringField(entry, 'detail');
    if (!detail.ok) return detail;
    labels.push({
      type: type.value,
      title: title.value,
      subtitle: subtitle.value,
      barcode: barcode.value,
      detail: detail.value,
    });
  }

  return {
    ok: true,
    value: {
      clinicId: clinicId.value,
      printerLanguage: printerLanguage.value,
      printerProfileId: printerProfileId.value,
      requestedByUserId: requestedByUserId.value,
      notes: notes.value,
      labels,
    },
  };
}

export function validateAssessPrescriptionSafetyBody(body: unknown):
  | { ok: true; value: AssessPrescriptionSafetyInput }
  | { ok: false; error: string } {
  const candidate = asObject(body);
  if (!candidate) {
    return { ok: false, error: 'Request body must be a JSON object' };
  }

  const patientId = readRequiredString(candidate.patientId, 'patientId');
  if (!patientId.ok) return patientId;

  const medicationName = readRequiredString(candidate.medicationName, 'medicationName');
  if (!medicationName.ok) return medicationName;

  const rxnormCode = readOptionalNullableStringField(candidate, 'rxnormCode');
  if (!rxnormCode.ok) return rxnormCode;

  const drugCatalogId = readOptionalNullableStringField(candidate, 'drugCatalogId');
  if (!drugCatalogId.ok) return drugCatalogId;

  return {
    ok: true,
    value: {
      patientId: patientId.value,
      medicationName: medicationName.value,
      rxnormCode: rxnormCode.value,
      drugCatalogId: drugCatalogId.value,
    },
  };
}

function validateInteractionRuleSides(candidate: Record<string, unknown>) {
  const hasPrimary =
    hasTextContent(candidate.primaryDrugCatalogId) ||
    hasTextContent(candidate.primaryRxnormCode) ||
    hasTextContent(candidate.primaryMedicationName);
  if (!hasPrimary) {
    return { ok: false as const, error: 'One primary drug identifier is required' };
  }

  const hasInteracting =
    hasTextContent(candidate.interactingDrugCatalogId) ||
    hasTextContent(candidate.interactingRxnormCode) ||
    hasTextContent(candidate.interactingMedicationName);
  if (!hasInteracting) {
    return { ok: false as const, error: 'One interacting drug identifier is required' };
  }

  return { ok: true as const };
}

export function validateCreateDrugInteractionRuleBody(body: unknown):
  | { ok: true; value: CreateDrugInteractionRuleInput }
  | { ok: false; error: string } {
  const candidate = asObject(body);
  if (!candidate) {
    return { ok: false, error: 'Request body must be a JSON object' };
  }

  const clinicId = readRequiredString(candidate.clinicId, 'clinicId');
  if (!clinicId.ok) return clinicId;

  const sides = validateInteractionRuleSides(candidate);
  if (!sides.ok) return sides;

  const primaryDrugCatalogId = readOptionalNullableStringField(candidate, 'primaryDrugCatalogId');
  if (!primaryDrugCatalogId.ok) return primaryDrugCatalogId;

  const interactingDrugCatalogId = readOptionalNullableStringField(candidate, 'interactingDrugCatalogId');
  if (!interactingDrugCatalogId.ok) return interactingDrugCatalogId;

  const primaryRxnormCode = readOptionalNullableStringField(candidate, 'primaryRxnormCode');
  if (!primaryRxnormCode.ok) return primaryRxnormCode;

  const interactingRxnormCode = readOptionalNullableStringField(candidate, 'interactingRxnormCode');
  if (!interactingRxnormCode.ok) return interactingRxnormCode;

  const primaryMedicationName = readOptionalNullableStringField(candidate, 'primaryMedicationName');
  if (!primaryMedicationName.ok) return primaryMedicationName;

  const interactingMedicationName = readOptionalNullableStringField(candidate, 'interactingMedicationName');
  if (!interactingMedicationName.ok) return interactingMedicationName;

  const severity = readEnumValue<DrugInteractionSeverity>(
    candidate.severity,
    'severity',
    ['info', 'warning', 'critical']
  );
  if (!severity.ok) return severity;

  const description = readRequiredString(candidate.description, 'description');
  if (!description.ok) return description;

  const recommendation = readOptionalNullableStringField(candidate, 'recommendation');
  if (!recommendation.ok) return recommendation;

  const isActive = readOptionalBooleanField(candidate, 'isActive');
  if (!isActive.ok) return isActive;

  return {
    ok: true,
    value: {
      clinicId: clinicId.value,
      primaryDrugCatalogId: primaryDrugCatalogId.value,
      interactingDrugCatalogId: interactingDrugCatalogId.value,
      primaryRxnormCode: primaryRxnormCode.value,
      interactingRxnormCode: interactingRxnormCode.value,
      primaryMedicationName: primaryMedicationName.value,
      interactingMedicationName: interactingMedicationName.value,
      severity: severity.value,
      description: description.value,
      recommendation: recommendation.value,
      isActive: isActive.value,
    },
  };
}

export function validateUpdateDrugInteractionRuleBody(body: unknown, interactionRuleId: string):
  | { ok: true; value: UpdateDrugInteractionRuleInput }
  | { ok: false; error: string } {
  const candidate = asObject(body);
  if (!candidate) {
    return { ok: false, error: 'Request body must be a JSON object' };
  }

  const fields = [
    'primaryDrugCatalogId',
    'interactingDrugCatalogId',
    'primaryRxnormCode',
    'interactingRxnormCode',
    'primaryMedicationName',
    'interactingMedicationName',
    'severity',
    'description',
    'recommendation',
    'isActive',
  ];
  if (!fields.some((field) => Object.hasOwn(candidate, field))) {
    return { ok: false, error: 'At least one interaction rule field must be provided for update' };
  }

  const primaryDrugCatalogId = readOptionalNullableStringField(candidate, 'primaryDrugCatalogId');
  if (!primaryDrugCatalogId.ok) return primaryDrugCatalogId;

  const interactingDrugCatalogId = readOptionalNullableStringField(candidate, 'interactingDrugCatalogId');
  if (!interactingDrugCatalogId.ok) return interactingDrugCatalogId;

  const primaryRxnormCode = readOptionalNullableStringField(candidate, 'primaryRxnormCode');
  if (!primaryRxnormCode.ok) return primaryRxnormCode;

  const interactingRxnormCode = readOptionalNullableStringField(candidate, 'interactingRxnormCode');
  if (!interactingRxnormCode.ok) return interactingRxnormCode;

  const primaryMedicationName = readOptionalNullableStringField(candidate, 'primaryMedicationName');
  if (!primaryMedicationName.ok) return primaryMedicationName;

  const interactingMedicationName = readOptionalNullableStringField(candidate, 'interactingMedicationName');
  if (!interactingMedicationName.ok) return interactingMedicationName;

  const severity = readEnumValue<DrugInteractionSeverity>(
    candidate.severity,
    'severity',
    ['info', 'warning', 'critical']
  );
  if (!severity.ok) return severity;

  const description = readOptionalTrimmedStringField(candidate, 'description');
  if (!description.ok) return description;

  const recommendation = readOptionalNullableStringField(candidate, 'recommendation');
  if (!recommendation.ok) return recommendation;

  const isActive = readOptionalBooleanField(candidate, 'isActive');
  if (!isActive.ok) return isActive;

  return {
    ok: true,
    value: {
      interactionRuleId,
      ...(Object.hasOwn(candidate, 'primaryDrugCatalogId') ? { primaryDrugCatalogId: primaryDrugCatalogId.value } : {}),
      ...(Object.hasOwn(candidate, 'interactingDrugCatalogId') ? { interactingDrugCatalogId: interactingDrugCatalogId.value } : {}),
      ...(Object.hasOwn(candidate, 'primaryRxnormCode') ? { primaryRxnormCode: primaryRxnormCode.value } : {}),
      ...(Object.hasOwn(candidate, 'interactingRxnormCode') ? { interactingRxnormCode: interactingRxnormCode.value } : {}),
      ...(Object.hasOwn(candidate, 'primaryMedicationName') ? { primaryMedicationName: primaryMedicationName.value } : {}),
      ...(Object.hasOwn(candidate, 'interactingMedicationName') ? { interactingMedicationName: interactingMedicationName.value } : {}),
      ...(Object.hasOwn(candidate, 'severity') ? { severity: severity.value } : {}),
      ...(Object.hasOwn(candidate, 'description') ? { description: description.value } : {}),
      ...(Object.hasOwn(candidate, 'recommendation') ? { recommendation: recommendation.value } : {}),
      ...(Object.hasOwn(candidate, 'isActive') ? { isActive: isActive.value } : {}),
    },
  };
}

export function validateCreateFileAssetBody(body: unknown):
  | { ok: true; value: CreateFileAssetInput }
  | { ok: false; error: string } {
  const candidate = asObject(body);
  if (!candidate) {
    return { ok: false, error: 'Request body must be a JSON object' };
  }

  const clinicId = readRequiredString(candidate.clinicId, 'clinicId');
  if (!clinicId.ok) return clinicId;

  const storageKey = readRequiredString(candidate.storageKey, 'storageKey');
  if (!storageKey.ok) return storageKey;

  const originalFilename = readRequiredString(candidate.originalFilename, 'originalFilename');
  if (!originalFilename.ok) return originalFilename;

  const mimeType = readOptionalNullableStringField(candidate, 'mimeType');
  if (!mimeType.ok) return mimeType;

  const byteSize = readRequiredIntegerField(candidate.byteSize, 'byteSize');
  if (!byteSize.ok) return byteSize;
  if (byteSize.value < 0) {
    return { ok: false, error: 'byteSize must be greater than or equal to 0' };
  }

  const checksumSha256 = readOptionalNullableStringField(candidate, 'checksumSha256');
  if (!checksumSha256.ok) return checksumSha256;

  const uploadedByUserId = readOptionalNullableStringField(candidate, 'uploadedByUserId');
  if (!uploadedByUserId.ok) return uploadedByUserId;

  return {
    ok: true,
    value: {
      clinicId: clinicId.value,
      storageKey: storageKey.value,
      originalFilename: originalFilename.value,
      mimeType: mimeType.value,
      byteSize: byteSize.value,
      checksumSha256: checksumSha256.value,
      uploadedByUserId: uploadedByUserId.value,
    },
  };
}

export function validateUploadFileAssetBody(body: unknown):
  | { ok: true; value: UploadFileAssetInput }
  | { ok: false; error: string } {
  const base = validateCreateFileAssetBody(body);
  if (!base.ok) return base;

  const candidate = asObject(body);
  const contentBase64 = readRequiredString(candidate?.contentBase64, 'contentBase64');
  if (!contentBase64.ok) return contentBase64;

  if (contentBase64.value.length > 10 * 1024 * 1024) {
    return { ok: false, error: 'contentBase64 is too large' };
  }

  return {
    ok: true,
    value: {
      ...base.value,
      contentBase64: contentBase64.value,
    },
  };
}

export function validateCreateAttachmentLinkBody(body: unknown):
  | { ok: true; value: CreateAttachmentLinkInput }
  | { ok: false; error: string } {
  const candidate = asObject(body);
  if (!candidate) {
    return { ok: false, error: 'Request body must be a JSON object' };
  }

  const fileAssetId = readRequiredString(candidate.fileAssetId, 'fileAssetId');
  if (!fileAssetId.ok) return fileAssetId;

  const targetType = readRequiredEnumValue<AttachmentTargetType>(
    candidate.targetType,
    'targetType',
    ['patient', 'encounter', 'clinical_note', 'consent_record']
  );
  if (!targetType.ok) return targetType;

  const targetId = readRequiredString(candidate.targetId, 'targetId');
  if (!targetId.ok) return targetId;

  const label = readOptionalNullableStringField(candidate, 'label');
  if (!label.ok) return label;

  return {
    ok: true,
    value: {
      fileAssetId: fileAssetId.value,
      targetType: targetType.value,
      targetId: targetId.value,
      label: label.value,
    },
  };
}

export function validateCreatePatientAllergyBody(body: unknown):
  | { ok: true; value: CreatePatientAllergyInput }
  | { ok: false; error: string } {
  const candidate = asObject(body);
  if (!candidate) {
    return { ok: false, error: 'Request body must be a JSON object' };
  }

  const patientId = readRequiredString(candidate.patientId, 'patientId');
  if (!patientId.ok) return patientId;

  const allergenName = readRequiredString(candidate.allergenName, 'allergenName');
  if (!allergenName.ok) return allergenName;

  const allergenCategory = readOptionalNullableStringField(candidate, 'allergenCategory');
  if (!allergenCategory.ok) return allergenCategory;

  const reaction = readOptionalNullableStringField(candidate, 'reaction');
  if (!reaction.ok) return reaction;

  const severity = readEnumValue<AllergySeverity>(candidate.severity, 'severity', [
    'mild',
    'moderate',
    'severe',
    'unknown',
  ]);
  if (!severity.ok) return severity;

  const status = readEnumValue<AllergyStatus>(candidate.status, 'status', [
    'active',
    'inactive',
    'entered_in_error',
  ]);
  if (!status.ok) return status;

  const criticality = readOptionalNullableStringField(candidate, 'criticality');
  if (!criticality.ok) return criticality;

  const recordedAt = readOptionalNullableStringField(candidate, 'recordedAt');
  if (!recordedAt.ok) return recordedAt;

  const lastOccurrenceAt = readOptionalNullableStringField(candidate, 'lastOccurrenceAt');
  if (!lastOccurrenceAt.ok) return lastOccurrenceAt;

  const notes = readOptionalNullableStringField(candidate, 'notes');
  if (!notes.ok) return notes;

  return {
    ok: true,
    value: {
      patientId: patientId.value,
      allergenName: allergenName.value,
      allergenCategory: allergenCategory.value,
      reaction: reaction.value,
      severity: severity.value,
      status: status.value,
      criticality: criticality.value,
      recordedAt: recordedAt.value,
      lastOccurrenceAt: lastOccurrenceAt.value,
      notes: notes.value,
    },
  };
}

export function validateUpdatePatientAllergyBody(body: unknown, allergyId: string):
  | { ok: true; value: UpdatePatientAllergyInput }
  | { ok: false; error: string } {
  const candidate = asObject(body);
  if (!candidate) {
    return { ok: false, error: 'Request body must be a JSON object' };
  }

  const hasChanges = [
    'allergenName',
    'allergenCategory',
    'reaction',
    'severity',
    'status',
    'criticality',
    'recordedAt',
    'lastOccurrenceAt',
    'notes',
  ].some((field) => Object.hasOwn(candidate, field));
  if (!hasChanges) {
    return { ok: false, error: 'At least one allergy field must be provided for update' };
  }

  const allergenName = readOptionalTrimmedStringField(candidate, 'allergenName');
  if (!allergenName.ok) return allergenName;

  const allergenCategory = readOptionalNullableStringField(candidate, 'allergenCategory');
  if (!allergenCategory.ok) return allergenCategory;

  const reaction = readOptionalNullableStringField(candidate, 'reaction');
  if (!reaction.ok) return reaction;

  const severity = readEnumValue<AllergySeverity>(candidate.severity, 'severity', [
    'mild',
    'moderate',
    'severe',
    'unknown',
  ]);
  if (!severity.ok) return severity;

  const status = readEnumValue<AllergyStatus>(candidate.status, 'status', [
    'active',
    'inactive',
    'entered_in_error',
  ]);
  if (!status.ok) return status;

  const criticality = readOptionalNullableStringField(candidate, 'criticality');
  if (!criticality.ok) return criticality;

  const recordedAt = readOptionalNullableStringField(candidate, 'recordedAt');
  if (!recordedAt.ok) return recordedAt;

  const lastOccurrenceAt = readOptionalNullableStringField(candidate, 'lastOccurrenceAt');
  if (!lastOccurrenceAt.ok) return lastOccurrenceAt;

  const notes = readOptionalNullableStringField(candidate, 'notes');
  if (!notes.ok) return notes;

  return {
    ok: true,
    value: {
      allergyId,
      ...(Object.hasOwn(candidate, 'allergenName') ? { allergenName: allergenName.value } : {}),
      ...(Object.hasOwn(candidate, 'allergenCategory')
        ? { allergenCategory: allergenCategory.value }
        : {}),
      ...(Object.hasOwn(candidate, 'reaction') ? { reaction: reaction.value } : {}),
      ...(Object.hasOwn(candidate, 'severity') ? { severity: severity.value } : {}),
      ...(Object.hasOwn(candidate, 'status') ? { status: status.value } : {}),
      ...(Object.hasOwn(candidate, 'criticality') ? { criticality: criticality.value } : {}),
      ...(Object.hasOwn(candidate, 'recordedAt') ? { recordedAt: recordedAt.value } : {}),
      ...(Object.hasOwn(candidate, 'lastOccurrenceAt')
        ? { lastOccurrenceAt: lastOccurrenceAt.value }
        : {}),
      ...(Object.hasOwn(candidate, 'notes') ? { notes: notes.value } : {}),
    },
  };
}

export function validateCreatePatientConditionBody(body: unknown):
  | { ok: true; value: CreatePatientConditionInput }
  | { ok: false; error: string } {
  const candidate = asObject(body);
  if (!candidate) {
    return { ok: false, error: 'Request body must be a JSON object' };
  }

  const patientId = readRequiredString(candidate.patientId, 'patientId');
  if (!patientId.ok) return patientId;

  const conditionName = readRequiredString(candidate.conditionName, 'conditionName');
  if (!conditionName.ok) return conditionName;

  const conditionCode = readOptionalNullableStringField(candidate, 'conditionCode');
  if (!conditionCode.ok) return conditionCode;

  const codingSystem = readOptionalNullableStringField(candidate, 'codingSystem');
  if (!codingSystem.ok) return codingSystem;

  const clinicalStatus = readEnumValue<PatientConditionStatus>(
    candidate.clinicalStatus,
    'clinicalStatus',
    ['active', 'resolved', 'inactive', 'entered_in_error']
  );
  if (!clinicalStatus.ok) return clinicalStatus;

  const onsetDate = readOptionalNullableStringField(candidate, 'onsetDate');
  if (!onsetDate.ok) return onsetDate;

  const abatementDate = readOptionalNullableStringField(candidate, 'abatementDate');
  if (!abatementDate.ok) return abatementDate;

  const notes = readOptionalNullableStringField(candidate, 'notes');
  if (!notes.ok) return notes;

  return {
    ok: true,
    value: {
      patientId: patientId.value,
      conditionCode: conditionCode.value,
      codingSystem: codingSystem.value,
      conditionName: conditionName.value,
      clinicalStatus: clinicalStatus.value,
      onsetDate: onsetDate.value,
      abatementDate: abatementDate.value,
      notes: notes.value,
    },
  };
}

export function validateUpdatePatientConditionBody(body: unknown, conditionId: string):
  | { ok: true; value: UpdatePatientConditionInput }
  | { ok: false; error: string } {
  const candidate = asObject(body);
  if (!candidate) {
    return { ok: false, error: 'Request body must be a JSON object' };
  }

  const hasChanges = [
    'conditionCode',
    'codingSystem',
    'conditionName',
    'clinicalStatus',
    'onsetDate',
    'abatementDate',
    'notes',
  ].some((field) => Object.hasOwn(candidate, field));
  if (!hasChanges) {
    return { ok: false, error: 'At least one condition field must be provided for update' };
  }

  const conditionCode = readOptionalNullableStringField(candidate, 'conditionCode');
  if (!conditionCode.ok) return conditionCode;

  const codingSystem = readOptionalNullableStringField(candidate, 'codingSystem');
  if (!codingSystem.ok) return codingSystem;

  const conditionName = readOptionalTrimmedStringField(candidate, 'conditionName');
  if (!conditionName.ok) return conditionName;

  const clinicalStatus = readEnumValue<PatientConditionStatus>(
    candidate.clinicalStatus,
    'clinicalStatus',
    ['active', 'resolved', 'inactive', 'entered_in_error']
  );
  if (!clinicalStatus.ok) return clinicalStatus;

  const onsetDate = readOptionalNullableStringField(candidate, 'onsetDate');
  if (!onsetDate.ok) return onsetDate;

  const abatementDate = readOptionalNullableStringField(candidate, 'abatementDate');
  if (!abatementDate.ok) return abatementDate;

  const notes = readOptionalNullableStringField(candidate, 'notes');
  if (!notes.ok) return notes;

  return {
    ok: true,
    value: {
      conditionId,
      ...(Object.hasOwn(candidate, 'conditionCode') ? { conditionCode: conditionCode.value } : {}),
      ...(Object.hasOwn(candidate, 'codingSystem') ? { codingSystem: codingSystem.value } : {}),
      ...(Object.hasOwn(candidate, 'conditionName') ? { conditionName: conditionName.value } : {}),
      ...(Object.hasOwn(candidate, 'clinicalStatus')
        ? { clinicalStatus: clinicalStatus.value }
        : {}),
      ...(Object.hasOwn(candidate, 'onsetDate') ? { onsetDate: onsetDate.value } : {}),
      ...(Object.hasOwn(candidate, 'abatementDate')
        ? { abatementDate: abatementDate.value }
        : {}),
      ...(Object.hasOwn(candidate, 'notes') ? { notes: notes.value } : {}),
    },
  };
}

export function validateCreatePatientMedicationBody(body: unknown):
  | { ok: true; value: CreatePatientMedicationInput }
  | { ok: false; error: string } {
  const candidate = asObject(body);
  if (!candidate) {
    return { ok: false, error: 'Request body must be a JSON object' };
  }

  const patientId = readRequiredString(candidate.patientId, 'patientId');
  if (!patientId.ok) return patientId;

  const medicationName = readRequiredString(candidate.medicationName, 'medicationName');
  if (!medicationName.ok) return medicationName;

  const prescribedByPractitionerId = readOptionalNullableStringField(
    candidate,
    'prescribedByPractitionerId'
  );
  if (!prescribedByPractitionerId.ok) return prescribedByPractitionerId;

  const rxnormCode = readOptionalNullableStringField(candidate, 'rxnormCode');
  if (!rxnormCode.ok) return rxnormCode;

  const dosage = readOptionalNullableStringField(candidate, 'dosage');
  if (!dosage.ok) return dosage;

  const route = readOptionalNullableStringField(candidate, 'route');
  if (!route.ok) return route;

  const frequency = readOptionalNullableStringField(candidate, 'frequency');
  if (!frequency.ok) return frequency;

  const instructions = readOptionalNullableStringField(candidate, 'instructions');
  if (!instructions.ok) return instructions;

  const status = readEnumValue<PatientMedicationStatus>(candidate.status, 'status', [
    'active',
    'completed',
    'stopped',
    'on_hold',
    'entered_in_error',
  ]);
  if (!status.ok) return status;

  const startDate = readOptionalNullableStringField(candidate, 'startDate');
  if (!startDate.ok) return startDate;

  const endDate = readOptionalNullableStringField(candidate, 'endDate');
  if (!endDate.ok) return endDate;

  const notes = readOptionalNullableStringField(candidate, 'notes');
  if (!notes.ok) return notes;

  return {
    ok: true,
    value: {
      patientId: patientId.value,
      prescribedByPractitionerId: prescribedByPractitionerId.value,
      medicationName: medicationName.value,
      rxnormCode: rxnormCode.value,
      dosage: dosage.value,
      route: route.value,
      frequency: frequency.value,
      instructions: instructions.value,
      status: status.value,
      startDate: startDate.value,
      endDate: endDate.value,
      notes: notes.value,
    },
  };
}

export function validateUpdatePatientMedicationBody(body: unknown, medicationId: string):
  | { ok: true; value: UpdatePatientMedicationInput }
  | { ok: false; error: string } {
  const candidate = asObject(body);
  if (!candidate) {
    return { ok: false, error: 'Request body must be a JSON object' };
  }

  const hasChanges = [
    'prescribedByPractitionerId',
    'medicationName',
    'rxnormCode',
    'dosage',
    'route',
    'frequency',
    'instructions',
    'status',
    'startDate',
    'endDate',
    'notes',
  ].some((field) => Object.hasOwn(candidate, field));
  if (!hasChanges) {
    return { ok: false, error: 'At least one medication field must be provided for update' };
  }

  const prescribedByPractitionerId = readOptionalNullableStringField(
    candidate,
    'prescribedByPractitionerId'
  );
  if (!prescribedByPractitionerId.ok) return prescribedByPractitionerId;

  const medicationName = readOptionalTrimmedStringField(candidate, 'medicationName');
  if (!medicationName.ok) return medicationName;

  const rxnormCode = readOptionalNullableStringField(candidate, 'rxnormCode');
  if (!rxnormCode.ok) return rxnormCode;

  const dosage = readOptionalNullableStringField(candidate, 'dosage');
  if (!dosage.ok) return dosage;

  const route = readOptionalNullableStringField(candidate, 'route');
  if (!route.ok) return route;

  const frequency = readOptionalNullableStringField(candidate, 'frequency');
  if (!frequency.ok) return frequency;

  const instructions = readOptionalNullableStringField(candidate, 'instructions');
  if (!instructions.ok) return instructions;

  const status = readEnumValue<PatientMedicationStatus>(candidate.status, 'status', [
    'active',
    'completed',
    'stopped',
    'on_hold',
    'entered_in_error',
  ]);
  if (!status.ok) return status;

  const startDate = readOptionalNullableStringField(candidate, 'startDate');
  if (!startDate.ok) return startDate;

  const endDate = readOptionalNullableStringField(candidate, 'endDate');
  if (!endDate.ok) return endDate;

  const notes = readOptionalNullableStringField(candidate, 'notes');
  if (!notes.ok) return notes;

  return {
    ok: true,
    value: {
      medicationId,
      ...(Object.hasOwn(candidate, 'prescribedByPractitionerId')
        ? { prescribedByPractitionerId: prescribedByPractitionerId.value }
        : {}),
      ...(Object.hasOwn(candidate, 'medicationName')
        ? { medicationName: medicationName.value }
        : {}),
      ...(Object.hasOwn(candidate, 'rxnormCode') ? { rxnormCode: rxnormCode.value } : {}),
      ...(Object.hasOwn(candidate, 'dosage') ? { dosage: dosage.value } : {}),
      ...(Object.hasOwn(candidate, 'route') ? { route: route.value } : {}),
      ...(Object.hasOwn(candidate, 'frequency') ? { frequency: frequency.value } : {}),
      ...(Object.hasOwn(candidate, 'instructions')
        ? { instructions: instructions.value }
        : {}),
      ...(Object.hasOwn(candidate, 'status') ? { status: status.value } : {}),
      ...(Object.hasOwn(candidate, 'startDate') ? { startDate: startDate.value } : {}),
      ...(Object.hasOwn(candidate, 'endDate') ? { endDate: endDate.value } : {}),
      ...(Object.hasOwn(candidate, 'notes') ? { notes: notes.value } : {}),
    },
  };
}

export function validateCreatePatientFlagBody(body: unknown):
  | { ok: true; value: CreatePatientFlagInput }
  | { ok: false; error: string } {
  const candidate = asObject(body);
  if (!candidate) {
    return { ok: false, error: 'Request body must be a JSON object' };
  }

  const patientId = readRequiredString(candidate.patientId, 'patientId');
  if (!patientId.ok) return patientId;

  const flagType = readRequiredString(candidate.flagType, 'flagType');
  if (!flagType.ok) return flagType;

  const label = readRequiredString(candidate.label, 'label');
  if (!label.ok) return label;

  const description = readOptionalNullableStringField(candidate, 'description');
  if (!description.ok) return description;

  const severity = readEnumValue<PatientFlagSeverity>(candidate.severity, 'severity', [
    'info',
    'caution',
    'critical',
  ]);
  if (!severity.ok) return severity;

  const status = readEnumValue<PatientFlagStatus>(candidate.status, 'status', [
    'active',
    'inactive',
    'resolved',
    'entered_in_error',
  ]);
  if (!status.ok) return status;

  const source = readOptionalNullableStringField(candidate, 'source');
  if (!source.ok) return source;

  const startsAt = readOptionalNullableStringField(candidate, 'startsAt');
  if (!startsAt.ok) return startsAt;

  const endsAt = readOptionalNullableStringField(candidate, 'endsAt');
  if (!endsAt.ok) return endsAt;

  const createdByUserId = readOptionalNullableStringField(candidate, 'createdByUserId');
  if (!createdByUserId.ok) return createdByUserId;

  const notes = readOptionalNullableStringField(candidate, 'notes');
  if (!notes.ok) return notes;

  return {
    ok: true,
    value: {
      patientId: patientId.value,
      flagType: flagType.value,
      label: label.value,
      description: description.value,
      severity: severity.value,
      status: status.value,
      source: source.value,
      startsAt: startsAt.value,
      endsAt: endsAt.value,
      createdByUserId: createdByUserId.value,
      notes: notes.value,
    },
  };
}

export function validateUpdatePatientFlagBody(body: unknown, flagId: string):
  | { ok: true; value: UpdatePatientFlagInput }
  | { ok: false; error: string } {
  const candidate = asObject(body);
  if (!candidate) {
    return { ok: false, error: 'Request body must be a JSON object' };
  }

  const hasChanges = [
    'flagType',
    'label',
    'description',
    'severity',
    'status',
    'source',
    'startsAt',
    'endsAt',
    'notes',
  ].some((field) => Object.hasOwn(candidate, field));
  if (!hasChanges) {
    return { ok: false, error: 'At least one patient flag field must be provided for update' };
  }

  const flagType = readOptionalTrimmedStringField(candidate, 'flagType');
  if (!flagType.ok) return flagType;

  const label = readOptionalTrimmedStringField(candidate, 'label');
  if (!label.ok) return label;

  const description = readOptionalNullableStringField(candidate, 'description');
  if (!description.ok) return description;

  const severity = readEnumValue<PatientFlagSeverity>(candidate.severity, 'severity', [
    'info',
    'caution',
    'critical',
  ]);
  if (!severity.ok) return severity;

  const status = readEnumValue<PatientFlagStatus>(candidate.status, 'status', [
    'active',
    'inactive',
    'resolved',
    'entered_in_error',
  ]);
  if (!status.ok) return status;

  const source = readOptionalNullableStringField(candidate, 'source');
  if (!source.ok) return source;

  const startsAt = readOptionalNullableStringField(candidate, 'startsAt');
  if (!startsAt.ok) return startsAt;

  const endsAt = readOptionalNullableStringField(candidate, 'endsAt');
  if (!endsAt.ok) return endsAt;

  const notes = readOptionalNullableStringField(candidate, 'notes');
  if (!notes.ok) return notes;

  return {
    ok: true,
    value: {
      flagId,
      ...(Object.hasOwn(candidate, 'flagType') ? { flagType: flagType.value } : {}),
      ...(Object.hasOwn(candidate, 'label') ? { label: label.value } : {}),
      ...(Object.hasOwn(candidate, 'description')
        ? { description: description.value }
        : {}),
      ...(Object.hasOwn(candidate, 'severity') ? { severity: severity.value } : {}),
      ...(Object.hasOwn(candidate, 'status') ? { status: status.value } : {}),
      ...(Object.hasOwn(candidate, 'source') ? { source: source.value } : {}),
      ...(Object.hasOwn(candidate, 'startsAt') ? { startsAt: startsAt.value } : {}),
      ...(Object.hasOwn(candidate, 'endsAt') ? { endsAt: endsAt.value } : {}),
      ...(Object.hasOwn(candidate, 'notes') ? { notes: notes.value } : {}),
    },
  };
}

export function validateFinalizeClinicalNoteBody(body: unknown, clinicalNoteId: string):
  | { ok: true; value: FinalizeClinicalNoteInput }
  | { ok: false; error: string } {
  if (body !== undefined && (typeof body !== 'object' || body === null || Array.isArray(body))) {
    return { ok: false, error: 'Request body must be a JSON object when provided' };
  }

  const candidate = (body ?? {}) as Record<string, unknown>;

  return {
    ok: true,
    value: {
      clinicalNoteId,
      finalizedAt: readOptionalNullableString(candidate.finalizedAt),
    },
  };
}

export function validateSignClinicalNoteBody(body: unknown, clinicalNoteId: string):
  | { ok: true; value: SignClinicalNoteInput }
  | { ok: false; error: string } {
  if (body !== undefined && (typeof body !== 'object' || body === null || Array.isArray(body))) {
    return { ok: false, error: 'Request body must be a JSON object when provided' };
  }

  const candidate = (body ?? {}) as Record<string, unknown>;

  return {
    ok: true,
    value: {
      clinicalNoteId,
      signedAt: readOptionalNullableString(candidate.signedAt),
      authoredByPractitionerId: readOptionalNullableString(candidate.authoredByPractitionerId),
    },
  };
}

function hasTextContent(value: unknown): boolean {
  return typeof value === 'string' && value.trim().length > 0;
}

function asObject(body: unknown): Record<string, unknown> | null {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return null;
  }

  return body as Record<string, unknown>;
}

function readRequiredString(value: unknown, fieldName: string) {
  if (!hasTextContent(value)) {
    return { ok: false as const, error: `${fieldName} is required` };
  }

  return { ok: true as const, value: (value as string).trim() };
}

function readRequiredIntegerField(value: unknown, fieldName: string) {
  if (typeof value !== 'number' || !Number.isInteger(value)) {
    return { ok: false as const, error: `${fieldName} must be an integer` };
  }

  return { ok: true as const, value };
}

function readPositiveIntegerValue(value: unknown, fieldName: string) {
  const integer = readRequiredIntegerField(value, fieldName);
  if (!integer.ok) return integer;
  if (integer.value <= 0) {
    return { ok: false as const, error: `${fieldName} must be greater than zero` };
  }
  return integer;
}

function readOptionalNullableString(value: unknown): string | null | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return null;
  }

  if (typeof value !== 'string') {
    return undefined;
  }

  return value.trim();
}

function readOptionalNullableStringField(
  candidate: Record<string, unknown>,
  fieldName: string
): { ok: true; value: string | null | undefined } | { ok: false; error: string } {
  const value = candidate[fieldName];

  if (value === undefined) {
    return { ok: true, value: undefined };
  }

  if (value === null) {
    return { ok: true, value: null };
  }

  if (typeof value !== 'string') {
    return { ok: false, error: `${fieldName} must be a string or null` };
  }

  return { ok: true, value: value.trim() };
}

function readOptionalTrimmedStringField(
  candidate: Record<string, unknown>,
  fieldName: string
): { ok: true; value: string | undefined } | { ok: false; error: string } {
  const value = candidate[fieldName];

  if (value === undefined) {
    return { ok: true, value: undefined };
  }

  if (typeof value !== 'string' || value.trim().length === 0) {
    return { ok: false, error: `${fieldName} must be a non-empty string` };
  }

  return { ok: true, value: value.trim() };
}

function readOptionalNullableDateField(
  candidate: Record<string, unknown>,
  fieldName: string
): { ok: true; value: string | null | undefined } | { ok: false; error: string } {
  const value = readOptionalNullableStringField(candidate, fieldName);
  if (!value.ok) return value;
  if (value.value === undefined || value.value === null || value.value === '') {
    return { ok: true, value: value.value === '' ? null : value.value };
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value.value)) {
    return { ok: false, error: `${fieldName} must be a date string in YYYY-MM-DD format` };
  }
  return { ok: true, value: value.value };
}

function readEnumValue<T extends string>(
  value: unknown,
  fieldName: string,
  allowedValues: T[]
): { ok: true; value: T | undefined } | { ok: false; error: string } {
  if (value === undefined) {
    return { ok: true, value: undefined };
  }

  if (typeof value !== 'string' || !allowedValues.includes(value as T)) {
    return {
      ok: false,
      error: `${fieldName} must be one of: ${allowedValues.join(', ')}`,
    };
  }

  return { ok: true, value: value as T };
}

function readRequiredEnumValue<T extends string>(
  value: unknown,
  fieldName: string,
  allowedValues: T[]
): { ok: true; value: T } | { ok: false; error: string } {
  if (value === undefined) {
    return { ok: false, error: `${fieldName} is required` };
  }

  const result = readEnumValue(value, fieldName, allowedValues);
  if (!result.ok || result.value === undefined) {
    return result as { ok: false; error: string };
  }

  return { ok: true, value: result.value };
}

function readOptionalBooleanField(
  candidate: Record<string, unknown>,
  fieldName: string
): { ok: true; value: boolean | undefined } | { ok: false; error: string } {
  const value = candidate[fieldName];

  if (value === undefined) {
    return { ok: true, value: undefined };
  }

  if (typeof value !== 'boolean') {
    return { ok: false, error: `${fieldName} must be a boolean` };
  }

  return { ok: true, value };
}

function readOptionalStringArrayField(
  candidate: Record<string, unknown>,
  fieldName: string
): { ok: true; value: string[] | undefined } | { ok: false; error: string } {
  const value = candidate[fieldName];

  if (value === undefined) {
    return { ok: true, value: undefined };
  }

  if (!Array.isArray(value)) {
    return { ok: false, error: `${fieldName} must be an array of strings` };
  }

  const strings: string[] = [];
  for (const item of value) {
    if (typeof item !== 'string' || item.trim().length === 0) {
      return { ok: false, error: `${fieldName} must be an array of non-empty strings` };
    }
    strings.push(item.trim());
  }

  return { ok: true, value: strings };
}

function readOptionalIntegerField(
  candidate: Record<string, unknown>,
  fieldName: string
): { ok: true; value: number | null | undefined } | { ok: false; error: string } {
  const value = candidate[fieldName];

  if (value === undefined) {
    return { ok: true, value: undefined };
  }

  if (value === null) {
    return { ok: true, value: null };
  }

  if (typeof value !== 'number' || !Number.isInteger(value)) {
    return { ok: false, error: `${fieldName} must be an integer or null` };
  }

  return { ok: true, value };
}

function readOptionalNumberLike(value: unknown): number | string | null | undefined {
  if (value === undefined || value === null) return value as null | undefined;
  if (typeof value === 'number' || typeof value === 'string') return value;
  return undefined;
}

function readOptionalNumberLikeField(
  candidate: Record<string, unknown>,
  fieldName: string
): { ok: true; value: number | string | null | undefined } | { ok: false; error: string } {
  const value = candidate[fieldName];

  if (value === undefined || value === null) {
    return { ok: true, value: value as null | undefined };
  }

  if (typeof value === 'number') {
    return { ok: true, value };
  }

  if (typeof value === 'string') {
    if (value.trim().length === 0) {
      return { ok: false, error: `${fieldName} must not be an empty string` };
    }

    return { ok: true, value: value.trim() };
  }

  return { ok: false, error: `${fieldName} must be a number, string, or null` };
}

function readPositiveNumberLikeField(
  candidate: Record<string, unknown>,
  fieldName: string
): { ok: true; value: number | string } | { ok: false; error: string } {
  return readPositiveNumberLikeValue(candidate[fieldName], fieldName);
}

function readPositiveNumberLikeValue(
  value: unknown,
  fieldName: string
): { ok: true; value: number | string } | { ok: false; error: string } {
  const result = readOptionalNumberLikeValue(value, fieldName);
  if (!result.ok) return result;
  if (result.value === undefined || result.value === null) {
    return { ok: false, error: `${fieldName} is required` };
  }

  const numberValue = Number(result.value);
  if (!Number.isFinite(numberValue) || numberValue <= 0) {
    return { ok: false, error: `${fieldName} must be greater than 0` };
  }

  return { ok: true, value: result.value };
}

function readNonNegativeNumberLikeField(
  candidate: Record<string, unknown>,
  fieldName: string
): { ok: true; value: number | string } | { ok: false; error: string } {
  return readNonNegativeNumberLikeValue(candidate[fieldName], fieldName);
}

function readNonNegativeNumberLikeValue(
  value: unknown,
  fieldName: string
): { ok: true; value: number | string } | { ok: false; error: string } {
  const result = readOptionalNumberLikeValue(value, fieldName);
  if (!result.ok) return result;
  if (result.value === undefined || result.value === null) {
    return { ok: false, error: `${fieldName} is required` };
  }

  const numberValue = Number(result.value);
  if (!Number.isFinite(numberValue) || numberValue < 0) {
    return { ok: false, error: `${fieldName} must be greater than or equal to 0` };
  }

  return { ok: true, value: result.value };
}

function readOptionalNonNegativeNumberLikeField(
  candidate: Record<string, unknown>,
  fieldName: string
): { ok: true; value: number | string | null | undefined } | { ok: false; error: string } {
  return readOptionalNonNegativeNumberLikeValue(candidate[fieldName], fieldName);
}

function readOptionalNonNegativeNumberLikeValue(
  value: unknown,
  fieldName: string
): { ok: true; value: number | string | null | undefined } | { ok: false; error: string } {
  const result = readOptionalNumberLikeValue(value, fieldName);
  if (!result.ok) return result;
  if (result.value === undefined || result.value === null) {
    return { ok: true, value: result.value };
  }

  const numberValue = Number(result.value);
  if (!Number.isFinite(numberValue) || numberValue < 0) {
    return { ok: false, error: `${fieldName} must be greater than or equal to 0` };
  }

  return { ok: true, value: result.value };
}

function readOptionalNumberLikeValue(
  value: unknown,
  fieldName: string
): { ok: true; value: number | string | null | undefined } | { ok: false; error: string } {
  if (value === undefined || value === null) {
    return { ok: true, value: value as null | undefined };
  }

  if (typeof value === 'number') {
    return { ok: true, value };
  }

  if (typeof value === 'string') {
    if (value.trim().length === 0) {
      return { ok: false, error: `${fieldName} must not be an empty string` };
    }

    return { ok: true, value: value.trim() };
  }

  return { ok: false, error: `${fieldName} must be a number, string, or null` };
}

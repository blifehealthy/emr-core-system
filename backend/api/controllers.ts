import { toHttpError } from './postgresError.ts';
import {
  toAttachmentLinkDto,
  toAttachmentLinkDtos,
  toAppointmentDto,
  toAppointmentDtos,
  toClinicVisitDto,
  toClinicVisitDtos,
  toClinicSettingsDto,
  toClinicalNoteTemplateDto,
  toClinicalNoteTemplateDtos,
  toConsentRecordDto,
  toConsentRecordDtos,
  toDiagnosisDto,
  toDiagnosisDtos,
  toDrugCatalogItemDto,
  toDrugCatalogItemDtos,
  toDrugInteractionRuleDto,
  toDrugInteractionRuleDtos,
  toInventoryItemDto,
  toInventoryItemDtos,
  toInventoryLotDto,
  toInventoryLotDtos,
  toPurchaseOrderDto,
  toPurchaseOrderDtos,
  toPurchaseOrderApprovalPolicyDto,
  toPurchaseOrderApprovalPolicyDtos,
  toSupplierDto,
  toSupplierDtos,
  toMedicationDispenseDto,
  toMedicationDispenseDtos,
  toStockMovementDtos,
  toEncounterDto,
  toFileAssetDto,
  toFileAssetDtos,
  toInvoiceDto,
  toInvoiceDtos,
  toInsuranceClaimDto,
  toInsuranceClaimDtos,
  toChargeTemplateDto,
  toChargeTemplateDtos,
  toBillingNumberSequenceDto,
  toBillingNumberSequenceDtos,
  toCashierReconciliationDto,
  toCashierReconciliationDtos,
  toPatientDto,
  toPatientAllergyDto,
  toPatientAllergyDtos,
  toPatientConditionDto,
  toPatientConditionDtos,
  toPatientFlagDto,
  toPatientFlagDtos,
  toPatientMedicationDto,
  toPatientMedicationDtos,
  toPractitionerDto,
  toPractitionerDtos,
  toPrescriptionDto,
  toPrescriptionDtos,
  toSoapNoteDto,
  toUserDto,
  toUserDtos,
  toVitalSignDto,
  toVitalSignDtos,
} from './dtos.ts';
import {
  validateCreateAttachmentLinkBody,
  validateCreateAppointmentBody,
  validateCreateAuthSessionBody,
  validateCreateClinicVisitBody,
  validateCreateClinicalNoteTemplateBody,
  validateCreateConsentRecordBody,
  validateCreateDiagnosisBody,
  validateCreateDrugCatalogItemBody,
  validateCreateDrugInteractionRuleBody,
  validateCreateInventoryItemBody,
  validateUpdateInventoryItemBody,
  validateAdjustInventoryStockBody,
  validateReceiveInventoryLotBody,
  validateCreateSupplierBody,
  validateUpdateSupplierBody,
  validateCreatePurchaseOrderBody,
  validateUpdatePurchaseOrderBody,
  validateSubmitPurchaseOrderBody,
  validateApprovePurchaseOrderBody,
  validateRejectPurchaseOrderBody,
  validateReceivePurchaseOrderBody,
  validateCreatePurchaseOrderApprovalPolicyBody,
  validateUpdatePurchaseOrderApprovalPolicyBody,
  validateDispensePrescriptionBody,
  validateCreatePatientAllergyBody,
  validateCreatePatientConditionBody,
  validateCreatePatientFlagBody,
  validateCreatePatientMedicationBody,
  validateCreatePractitionerBody,
  validateCreatePrescriptionBody,
  validateCreateUserBody,
  validateCreateVitalSignBody,
  validateAssessPrescriptionSafetyBody,
  validateCreateEncounterBody,
  validateCreateInvoiceBody,
  validateCreateInvoiceFromEncounterBody,
  validateCreateChargeTemplateBody,
  validateCreateInsuranceClaimBody,
  validateCreateBillingNumberSequenceBody,
  validateIssueBillingNumberBody,
  validateCreateCashierReconciliationBody,
  validateCloseCashierReconciliationBody,
  validateCreateFileAssetBody,
  validateUploadFileAssetBody,
  validateCreatePatientBody,
  validateFinalizeClinicalNoteBody,
  validateSignClinicalNoteBody,
  validateUpdateAppointmentBody,
  validateUpdateClinicVisitBody,
  validateUpdateClinicalNoteTemplateBody,
  validateUpdateConsentRecordBody,
  validateUpdateDrugCatalogItemBody,
  validateUpdateDrugInteractionRuleBody,
  validateUpsertClinicSettingsBody,
  validateUpdateEncounterBody,
  validateUpdatePatientAllergyBody,
  validateUpdatePatientConditionBody,
  validateUpdatePatientFlagBody,
  validateUpdatePatientMedicationBody,
  validateUpdatePractitionerBody,
  validateUpdatePrescriptionBody,
  validateUpdateDiagnosisBody,
  validateUpdateSoapNoteBody,
  validateUpdateUserBody,
  validateUpdateVitalSignBody,
  validateRecordInvoicePaymentBody,
  validateRecordInvoiceRefundBody,
  validateVoidInvoiceBody,
  validateUpdateInvoiceBody,
  validateUpdateChargeTemplateBody,
  validateUpdateInsuranceClaimBody,
} from './validation.ts';
import { getActorContext } from './auth.ts';
import { AuthSessionConfigError } from '../services/createAuthSession.ts';
import type {
  AppointmentStatus,
  CashierReconciliationStatus,
  ClinicVisitStatus,
  Dependencies,
  EncounterStatus,
  HttpRequest,
  HttpResponse,
  UserRole,
} from './types.ts';

const JSON_HEADERS = { 'content-type': 'application/json; charset=utf-8' };
const appointmentTransitions: Record<AppointmentStatus, AppointmentStatus[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['checked_in', 'cancelled', 'no_show'],
  checked_in: ['completed'],
  completed: [],
  cancelled: [],
  no_show: [],
};
const encounterTransitions: Record<EncounterStatus, EncounterStatus[]> = {
  draft: ['in_progress', 'cancelled'],
  in_progress: ['completed', 'cancelled'],
  completed: ['signed'],
  signed: [],
  cancelled: [],
};

function readPatientId(row: unknown): string | null {
  if (!row || typeof row !== 'object') {
    return null;
  }

  const value = (row as Record<string, unknown>).patient_id;
  return typeof value === 'string' && value.trim().length > 0 ? value : null;
}

function readEncounterId(row: unknown): string | null {
  if (!row || typeof row !== 'object') {
    return null;
  }

  const value = (row as Record<string, unknown>).encounter_id;
  return typeof value === 'string' && value.trim().length > 0 ? value : null;
}

function hasSafetyWarnings(warnings: unknown[]): boolean {
  return Array.isArray(warnings) && warnings.length > 0;
}

function readOverrideReason(value: string | null | undefined): string | null {
  const text = String(value ?? '').trim();
  return text.length > 0 ? text : null;
}

function safetyOverrideError(warnings: unknown[]): HttpResponse {
  return {
    status: 409,
    headers: JSON_HEADERS,
    body: {
      error: 'Prescription safety override reason is required',
      data: { warnings },
    },
  };
}
const clinicVisitTransitions: Record<ClinicVisitStatus, ClinicVisitStatus[]> = {
  waiting: ['in_room', 'with_doctor', 'cancelled'],
  in_room: ['with_doctor', 'cancelled'],
  with_doctor: ['completed', 'cancelled'],
  completed: ['discharged'],
  discharged: [],
  cancelled: [],
};

export async function handleHealthCheck(dependencies: Dependencies): Promise<HttpResponse> {
  await dependencies.healthCheck();

  return {
    status: 200,
    headers: JSON_HEADERS,
    body: { status: 'ok' },
  };
}

export async function handleCreateAuthSession(
  request: HttpRequest,
  dependencies: Dependencies
): Promise<HttpResponse> {
  const validation = validateCreateAuthSessionBody(request.body);
  if (!validation.ok) return validationError(validation.error);

  if (!dependencies.createAuthSession) {
    return {
      status: 503,
      headers: JSON_HEADERS,
      body: { error: 'Auth sessions are not configured' },
    };
  }

  try {
    const session = await dependencies.createAuthSession(validation.value);
    if (!session) {
      return {
        status: 401,
        headers: JSON_HEADERS,
        body: { error: 'Invalid username or login code' },
      };
    }

    if ('failed' in session) {
      await dependencies.createAuditLog({
        entityType: 'user',
        entityId: session.user.id,
        action: 'session_login_failed',
        actorUserId: session.user.id,
        actorPractitionerId: session.user.practitioner_id,
        metadata: {
          clinicId: validation.value.clinicId,
          username: session.user.username,
          reason: session.reason,
          lockedUntil: session.lockedUntil,
        },
      });

      return {
        status: 401,
        headers: JSON_HEADERS,
        body: { error: 'Invalid username or login code' },
      };
    }

    await dependencies.createAuditLog({
      entityType: 'user',
      entityId: session.user.id,
      action: 'session_created',
      actorUserId: session.user.id,
      actorPractitionerId: session.user.practitioner_id,
      metadata: {
        clinicId: validation.value.clinicId,
        username: session.user.username,
        expiresAt: session.expiresAt,
      },
    });

    return {
      status: 201,
      headers: JSON_HEADERS,
      body: {
        data: {
          accessToken: session.accessToken,
          tokenType: session.tokenType,
          expiresAt: session.expiresAt,
          user: session.user,
        },
      },
    };
  } catch (error) {
    if (error instanceof AuthSessionConfigError) {
      return {
        status: 503,
        headers: JSON_HEADERS,
        body: { error: error.message },
      };
    }

    return mapError(error);
  }
}

export async function handleGetPatientDetail(
  request: HttpRequest,
  dependencies: Dependencies
): Promise<HttpResponse> {
  const clinicId = request.query?.clinicId?.trim();
  const medicalRecordNumber = request.query?.medicalRecordNumber?.trim();

  if (!clinicId || !medicalRecordNumber) {
    return validationError('clinicId and medicalRecordNumber are required query parameters');
  }

  try {
    const patient = await dependencies.getPatientWithEncountersAndSOAP({
      clinicId,
      medicalRecordNumber,
    });

    if (!patient) {
      return {
        status: 404,
        headers: JSON_HEADERS,
        body: { error: 'Patient not found' },
      };
    }

    return {
      status: 200,
      headers: JSON_HEADERS,
      body: { data: patient },
    };
  } catch (error) {
    return mapError(error);
  }
}

export async function handleCreatePatient(
  request: HttpRequest,
  dependencies: Dependencies
): Promise<HttpResponse> {
  const validation = validateCreatePatientBody(request.body);
  if (!validation.ok) return validationError(validation.error);

  try {
    const patient = await dependencies.createPatient(validation.value);
    const actor = getActorContext(request);

    await dependencies.createAuditLog({
      entityType: 'patient',
      entityId: (patient as { id: string }).id,
      action: 'created',
      actorUserId: actor.userId,
      actorPractitionerId: actor.practitionerId,
      metadata: {
        clinicId: validation.value.clinicId,
        medicalRecordNumber: validation.value.medicalRecordNumber,
      },
    });

    return { status: 201, headers: JSON_HEADERS, body: { data: toPatientDto(patient) } };
  } catch (error) {
    return mapError(error);
  }
}

export async function handleGetAuditLogsByEntity(
  request: HttpRequest,
  dependencies: Dependencies
): Promise<HttpResponse> {
  const entityType = request.query?.entityType?.trim();
  const entityId = request.query?.entityId?.trim();

  if (!entityType || !entityId) {
    return validationError('entityType and entityId are required query parameters');
  }

  const limit = readOptionalLimitQuery(request);
  if (!limit.ok) return validationError(limit.error);

  try {
    const logs = await dependencies.getAuditLogsByEntity({
      entityType,
      entityId,
      limit: limit.value,
    });

    return {
      status: 200,
      headers: JSON_HEADERS,
      body: { data: logs },
    };
  } catch (error) {
    return mapError(error);
  }
}

export async function handleGetPatientTimeline(
  request: HttpRequest,
  dependencies: Dependencies,
  patientId: string
): Promise<HttpResponse> {
  const limit = request.query?.limit ? Number(request.query.limit) : undefined;

  try {
    const timeline = await dependencies.getPatientTimeline({ patientId, limit });

    return {
      status: 200,
      headers: JSON_HEADERS,
      body: { data: timeline },
    };
  } catch (error) {
    return mapError(error);
  }
}

export async function handleCreateEncounter(
  request: HttpRequest,
  dependencies: Dependencies
): Promise<HttpResponse> {
  const validation = validateCreateEncounterBody(request.body);

  if (!validation.ok) {
    return validationError(validation.error);
  }

  try {
    const createdEncounter = await dependencies.createEncounterWithSOAP(validation.value);

    return {
      status: 201,
      headers: JSON_HEADERS,
      body: { data: createdEncounter },
    };
  } catch (error) {
    return mapError(error);
  }
}

export async function handleListAppointments(
  request: HttpRequest,
  dependencies: Dependencies
): Promise<HttpResponse> {
  const clinicId = request.query?.clinicId?.trim();

  if (!clinicId) {
    return validationError('clinicId is required query parameter');
  }

  const patientId = readOptionalQueryString(request, 'patientId');
  if (!patientId.ok) return validationError(patientId.error);

  const practitionerId = readOptionalQueryString(request, 'practitionerId');
  if (!practitionerId.ok) return validationError(practitionerId.error);

  const status = readOptionalEnumQuery(request, 'status', [
    'pending',
    'confirmed',
    'checked_in',
    'completed',
    'cancelled',
    'no_show',
  ]);
  if (!status.ok) return validationError(status.error);

  const appointments = await dependencies.listAppointments({
    clinicId,
    patientId: patientId.value,
    practitionerId: practitionerId.value,
    status: status.value,
  });

  return {
    status: 200,
    headers: JSON_HEADERS,
    body: { data: toAppointmentDtos(appointments) },
  };
}

export async function handleGetAppointment(
  _request: HttpRequest,
  dependencies: Dependencies,
  appointmentId: string
): Promise<HttpResponse> {
  if (!dependencies.getAppointmentById) {
    return mapError(new Error('Appointment read dependency is not configured'));
  }

  try {
    const appointment = await dependencies.getAppointmentById({ appointmentId });
    if (!appointment) {
      return { status: 404, headers: JSON_HEADERS, body: { error: 'Appointment not found' } };
    }

    return { status: 200, headers: JSON_HEADERS, body: { data: toAppointmentDto(appointment) } };
  } catch (error) {
    return mapError(error);
  }
}

export async function handleListClinicQueue(
  request: HttpRequest,
  dependencies: Dependencies
): Promise<HttpResponse> {
  if (!dependencies.listClinicQueue) {
    return mapError(new Error('Clinic queue dependency is not configured'));
  }

  const clinicId = request.query?.clinicId?.trim();
  if (!clinicId) return validationError('clinicId is required query parameter');

  const status = readOptionalEnumQuery(request, 'status', [
    'waiting',
    'in_room',
    'with_doctor',
    'completed',
    'discharged',
    'cancelled',
  ]);
  if (!status.ok) return validationError(status.error);

  const practitionerId = readOptionalQueryString(request, 'practitionerId');
  if (!practitionerId.ok) return validationError(practitionerId.error);

  const roomName = readOptionalQueryString(request, 'roomName');
  if (!roomName.ok) return validationError(roomName.error);

  const limit = readOptionalLimitQuery(request);
  if (!limit.ok) return validationError(limit.error);

  const visits = await dependencies.listClinicQueue({
    clinicId,
    status: status.value,
    practitionerId: practitionerId.value,
    roomName: roomName.value,
    limit: limit.value,
  });

  return { status: 200, headers: JSON_HEADERS, body: { data: toClinicVisitDtos(visits) } };
}

export async function handleCreateClinicVisit(
  request: HttpRequest,
  dependencies: Dependencies
): Promise<HttpResponse> {
  if (!dependencies.createClinicVisit) {
    return mapError(new Error('Clinic visit create dependency is not configured'));
  }

  const validation = validateCreateClinicVisitBody(request.body);
  if (!validation.ok) return validationError(validation.error);

  try {
    const visit = await dependencies.createClinicVisit(validation.value);
    const actor = getActorContext(request);
    await dependencies.createAuditLog({
      entityType: 'clinic_visit',
      entityId: (visit as { id: string }).id,
      action: 'created',
      actorUserId: actor.userId,
      actorPractitionerId: actor.practitionerId,
      metadata: { appointmentId: validation.value.appointmentId },
    });

    return { status: 201, headers: JSON_HEADERS, body: { data: toClinicVisitDto(visit) } };
  } catch (error) {
    return mapError(error);
  }
}

export async function handleUpdateClinicVisit(
  request: HttpRequest,
  dependencies: Dependencies,
  visitId: string
): Promise<HttpResponse> {
  if (!dependencies.updateClinicVisit) {
    return mapError(new Error('Clinic visit update dependency is not configured'));
  }

  const validation = validateUpdateClinicVisitBody(request.body, visitId);
  if (!validation.ok) return validationError(validation.error);

  const visit = await dependencies.updateClinicVisit(validation.value);
  if (!visit) {
    return { status: 404, headers: JSON_HEADERS, body: { error: 'Clinic visit not found' } };
  }

  const actor = getActorContext(request);
  await dependencies.createAuditLog({
    entityType: 'clinic_visit',
    entityId: visitId,
    action: 'updated',
    actorUserId: actor.userId,
    actorPractitionerId: actor.practitionerId,
    metadata: { fields: Object.keys(request.body as Record<string, unknown>) },
  });

  return { status: 200, headers: JSON_HEADERS, body: { data: toClinicVisitDto(visit) } };
}

export async function handleListClinicalNoteTemplates(
  request: HttpRequest,
  dependencies: Dependencies
): Promise<HttpResponse> {
  if (!dependencies.listClinicalNoteTemplates) {
    return mapError(new Error('Clinical note template dependency is not configured'));
  }

  const clinicId = request.query?.clinicId?.trim();
  if (!clinicId) return validationError('clinicId is required query parameter');

  const active = readOptionalEnumQuery(request, 'active', ['true', 'false']);
  if (!active.ok) return validationError(active.error);

  const templates = await dependencies.listClinicalNoteTemplates({
    clinicId,
    active: active.value === undefined ? undefined : active.value === 'true',
  });

  return { status: 200, headers: JSON_HEADERS, body: { data: toClinicalNoteTemplateDtos(templates) } };
}

export async function handleCreateClinicalNoteTemplate(
  request: HttpRequest,
  dependencies: Dependencies
): Promise<HttpResponse> {
  if (!dependencies.createClinicalNoteTemplate) {
    return mapError(new Error('Clinical note template create dependency is not configured'));
  }

  const validation = validateCreateClinicalNoteTemplateBody(request.body);
  if (!validation.ok) return validationError(validation.error);

  try {
    const template = await dependencies.createClinicalNoteTemplate(validation.value);
    const actor = getActorContext(request);
    await dependencies.createAuditLog({
      entityType: 'clinical_note_template',
      entityId: (template as { id: string }).id,
      action: 'created',
      actorUserId: actor.userId,
      actorPractitionerId: actor.practitionerId,
      metadata: { clinicId: validation.value.clinicId },
    });

    return { status: 201, headers: JSON_HEADERS, body: { data: toClinicalNoteTemplateDto(template) } };
  } catch (error) {
    return mapError(error);
  }
}

export async function handleUpdateClinicalNoteTemplate(
  request: HttpRequest,
  dependencies: Dependencies,
  templateId: string
): Promise<HttpResponse> {
  if (!dependencies.updateClinicalNoteTemplate) {
    return mapError(new Error('Clinical note template update dependency is not configured'));
  }

  const validation = validateUpdateClinicalNoteTemplateBody(request.body, templateId);
  if (!validation.ok) return validationError(validation.error);

  const template = await dependencies.updateClinicalNoteTemplate(validation.value);
  if (!template) {
    return { status: 404, headers: JSON_HEADERS, body: { error: 'Clinical note template not found' } };
  }

  const actor = getActorContext(request);
  await dependencies.createAuditLog({
    entityType: 'clinical_note_template',
    entityId: templateId,
    action: 'updated',
    actorUserId: actor.userId,
    actorPractitionerId: actor.practitionerId,
    metadata: { fields: Object.keys(request.body as Record<string, unknown>) },
  });

  return { status: 200, headers: JSON_HEADERS, body: { data: toClinicalNoteTemplateDto(template) } };
}

export async function handleGetClinicSettings(
  _request: HttpRequest,
  dependencies: Dependencies,
  clinicId: string
): Promise<HttpResponse> {
  if (!dependencies.getClinicSettings) {
    return mapError(new Error('Clinic settings dependency is not configured'));
  }

  const settings = await dependencies.getClinicSettings({ clinicId });
  if (!settings) {
    return { status: 404, headers: JSON_HEADERS, body: { error: 'Clinic settings not found' } };
  }

  return { status: 200, headers: JSON_HEADERS, body: { data: toClinicSettingsDto(settings) } };
}

export async function handleUpsertClinicSettings(
  request: HttpRequest,
  dependencies: Dependencies,
  clinicId: string
): Promise<HttpResponse> {
  if (!dependencies.upsertClinicSettings) {
    return mapError(new Error('Clinic settings update dependency is not configured'));
  }

  const validation = validateUpsertClinicSettingsBody(request.body, clinicId);
  if (!validation.ok) return validationError(validation.error);

  const settings = await dependencies.upsertClinicSettings(validation.value);
  const actor = getActorContext(request);
  await dependencies.createAuditLog({
    entityType: 'clinic_settings',
    entityId: clinicId,
    action: 'updated',
    actorUserId: actor.userId,
    actorPractitionerId: actor.practitionerId,
    metadata: { fields: Object.keys(request.body as Record<string, unknown>) },
  });

  return { status: 200, headers: JSON_HEADERS, body: { data: toClinicSettingsDto(settings) } };
}

export async function handleGetDailyOperationsReport(
  request: HttpRequest,
  dependencies: Dependencies
): Promise<HttpResponse> {
  if (!dependencies.getDailyOperationsReport) {
    return mapError(new Error('Daily operations report dependency is not configured'));
  }

  const clinicId = request.query?.clinicId?.trim();
  if (!clinicId) return validationError('clinicId is required query parameter');
  const startDate = request.query?.startDate?.trim() || request.query?.date?.trim();
  if (!startDate) return validationError('startDate is required query parameter');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
    return validationError('startDate must be YYYY-MM-DD');
  }
  const endDate = request.query?.endDate?.trim() || startDate;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
    return validationError('endDate must be YYYY-MM-DD');
  }
  if (endDate < startDate) {
    return validationError('endDate must be on or after startDate');
  }

  const report = await dependencies.getDailyOperationsReport({ clinicId, startDate, endDate });
  return { status: 200, headers: JSON_HEADERS, body: { data: report ?? { start_date: startDate, end_date: endDate } } };
}

export async function handleGetDailyOperationsReportCsv(
  request: HttpRequest,
  dependencies: Dependencies
): Promise<HttpResponse> {
  const reportResponse = await handleGetDailyOperationsReport(request, dependencies);
  if (reportResponse.status !== 200) return reportResponse;

  const report = (reportResponse.body as { data?: Record<string, unknown> }).data ?? {};
  const rows = [
    ['metric', 'value'],
    ['start_date', String(report.start_date ?? '')],
    ['end_date', String(report.end_date ?? '')],
    ['visits_total', String(report.visits_total ?? 0)],
    ['waiting', String(report.waiting ?? 0)],
    ['in_room', String(report.in_room ?? 0)],
    ['with_doctor', String(report.with_doctor ?? 0)],
    ['completed', String(report.completed ?? 0)],
    ['discharged', String(report.discharged ?? 0)],
    ['cancelled', String(report.cancelled ?? 0)],
    ['diagnoses_total', String(report.diagnoses_total ?? 0)],
    ['prescriptions_total', String(report.prescriptions_total ?? 0)],
  ];
  appendAggregateRows(rows, 'by_practitioner', report.by_practitioner, 'practitioner_id', 'visits');
  appendAggregateRows(rows, 'by_room', report.by_room, 'room_name', 'visits');
  appendAggregateRows(rows, 'top_diagnoses', report.top_diagnoses, 'diagnosis_name', 'count');
  appendAggregateRows(rows, 'by_prescriber', report.by_prescriber, 'prescribed_by_practitioner_id', 'prescriptions');
  const csv = rows.map((row) => row.map(csvCell).join(',')).join('\n');

  return {
    status: 200,
    headers: {
      'content-type': 'text/csv; charset=utf-8',
      'content-disposition': 'attachment; filename="daily-operations.csv"',
    },
    body: `${csv}\n`,
  };
}

export async function handleGetBillingSummaryReport(
  request: HttpRequest,
  dependencies: Dependencies
): Promise<HttpResponse> {
  if (!dependencies.getBillingSummaryReport) {
    return mapError(new Error('Billing summary report dependency is not configured'));
  }

  const clinicId = request.query?.clinicId?.trim();
  if (!clinicId) return validationError('clinicId is required query parameter');
  const startDate = request.query?.startDate?.trim() || request.query?.date?.trim();
  if (!startDate) return validationError('startDate is required query parameter');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
    return validationError('startDate must be YYYY-MM-DD');
  }
  const endDate = request.query?.endDate?.trim() || startDate;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
    return validationError('endDate must be YYYY-MM-DD');
  }
  if (endDate < startDate) {
    return validationError('endDate must be on or after startDate');
  }

  const report = await dependencies.getBillingSummaryReport({ clinicId, startDate, endDate });
  return { status: 200, headers: JSON_HEADERS, body: { data: report ?? { start_date: startDate, end_date: endDate } } };
}

export async function handleGetBillingSummaryReportCsv(
  request: HttpRequest,
  dependencies: Dependencies
): Promise<HttpResponse> {
  const reportResponse = await handleGetBillingSummaryReport(request, dependencies);
  if (reportResponse.status !== 200) return reportResponse;

  const report = (reportResponse.body as { data?: Record<string, unknown> }).data ?? {};
  const rows = [
    ['metric', 'value'],
    ['start_date', String(report.start_date ?? '')],
    ['end_date', String(report.end_date ?? '')],
    ['invoice_count', String(report.invoice_count ?? 0)],
    ['gross_total', String(report.gross_total ?? 0)],
    ['discount_total', String(report.discount_total ?? 0)],
    ['tax_total', String(report.tax_total ?? 0)],
    ['net_total', String(report.net_total ?? 0)],
    ['paid_total', String(report.paid_total ?? 0)],
    ['refunded_total', String(report.refunded_total ?? 0)],
    ['outstanding_total', String(report.outstanding_total ?? 0)],
    ['cash_total', String(report.cash_total ?? 0)],
    ['card_total', String(report.card_total ?? 0)],
    ['bank_transfer_total', String(report.bank_transfer_total ?? 0)],
    ['qr_total', String(report.qr_total ?? 0)],
    ['insurance_payment_total', String(report.insurance_payment_total ?? 0)],
    ['claim_count', String(report.claim_count ?? 0)],
    ['claims_submitted', String(report.claims_submitted ?? 0)],
    ['claims_paid', String(report.claims_paid ?? 0)],
    ['claims_rejected', String(report.claims_rejected ?? 0)],
  ];
  appendAggregateRows(rows, 'by_status', report.by_status, 'status', 'total_amount');
  appendAggregateRows(rows, 'by_payment_method', report.by_payment_method, 'method', 'total_amount');
  const csv = rows.map((row) => row.map(csvCell).join(',')).join('\n');

  return {
    status: 200,
    headers: {
      'content-type': 'text/csv; charset=utf-8',
      'content-disposition': 'attachment; filename="billing-summary.csv"',
    },
    body: `${csv}\n`,
  };
}

export async function handleCreateAppointment(
  request: HttpRequest,
  dependencies: Dependencies
): Promise<HttpResponse> {
  const validation = validateCreateAppointmentBody(request.body);
  if (!validation.ok) return validationError(validation.error);

  const appointment = await dependencies.createAppointment(validation.value);
  const actor = getActorContext(request);

  await dependencies.createAuditLog({
    entityType: 'appointment',
    entityId: (appointment as { id: string }).id,
    action: 'created',
    actorUserId: actor.userId,
    actorPractitionerId: actor.practitionerId,
    metadata: {
      appointmentNumber: validation.value.appointmentNumber,
      scheduledStartAt: validation.value.scheduledStartAt,
    },
  });

  return {
    status: 201,
    headers: JSON_HEADERS,
    body: { data: toAppointmentDto(appointment) },
  };
}

export async function handleUpdateAppointment(
  request: HttpRequest,
  dependencies: Dependencies,
  appointmentId: string
): Promise<HttpResponse> {
  const validation = validateUpdateAppointmentBody(request.body, appointmentId);
  if (!validation.ok) return validationError(validation.error);

  if (validation.value.status) {
    if (!dependencies.getAppointmentById) {
      return mapError(new Error('Appointment read dependency is not configured'));
    }

    const currentAppointment = await dependencies.getAppointmentById({ appointmentId });
    if (!currentAppointment) {
      return { status: 404, headers: JSON_HEADERS, body: { error: 'Appointment not found' } };
    }

    const currentStatus = readAppointmentStatus(currentAppointment);
    if (!currentStatus) {
      return mapError(new Error('Appointment status is not available'));
    }

    if (!isAllowedAppointmentTransition(currentStatus, validation.value.status)) {
      return {
        status: 409,
        headers: JSON_HEADERS,
        body: {
          error: `Appointment cannot transition from ${currentStatus} to ${validation.value.status}`,
        },
      };
    }
  }

  const appointment = await dependencies.updateAppointment(validation.value);

  if (!appointment) {
    return { status: 404, headers: JSON_HEADERS, body: { error: 'Appointment not found' } };
  }

  const actor = getActorContext(request);
  await dependencies.createAuditLog({
    entityType: 'appointment',
    entityId: appointmentId,
    action: 'updated',
    actorUserId: actor.userId,
    actorPractitionerId: actor.practitionerId,
    metadata: { fields: Object.keys(request.body as Record<string, unknown>) },
  });

  return {
    status: 200,
    headers: JSON_HEADERS,
    body: { data: toAppointmentDto(appointment) },
  };
}

export async function handleGetEncounter(
  request: HttpRequest,
  dependencies: Dependencies,
  encounterId: string
): Promise<HttpResponse> {
  if (!dependencies.getEncounterById) {
    return mapError(new Error('Encounter read dependency is not configured'));
  }

  const encounter = await dependencies.getEncounterById({ encounterId });
  if (!encounter) {
    return { status: 404, headers: JSON_HEADERS, body: { error: 'Encounter not found' } };
  }

  return { status: 200, headers: JSON_HEADERS, body: { data: toEncounterDto(encounter) } };
}

export async function handleUpdateEncounter(
  request: HttpRequest,
  dependencies: Dependencies,
  encounterId: string
): Promise<HttpResponse> {
  const validation = validateUpdateEncounterBody(request.body, encounterId);
  if (!validation.ok) return validationError(validation.error);

  if (validation.value.status) {
    if (!dependencies.getEncounterById) {
      return mapError(new Error('Encounter read dependency is not configured'));
    }

    const currentEncounter = await dependencies.getEncounterById({ encounterId });
    if (!currentEncounter) {
      return { status: 404, headers: JSON_HEADERS, body: { error: 'Encounter not found' } };
    }

    const currentStatus = readEncounterStatus(currentEncounter);
    if (!currentStatus) {
      return mapError(new Error('Encounter status is not available'));
    }

    if (!isAllowedEncounterTransition(currentStatus, validation.value.status)) {
      return {
        status: 409,
        headers: JSON_HEADERS,
        body: {
          error: `Encounter cannot transition from ${currentStatus} to ${validation.value.status}`,
        },
      };
    }
  }

  const encounter = await dependencies.updateEncounter(validation.value);
  if (!encounter) {
    return { status: 404, headers: JSON_HEADERS, body: { error: 'Encounter not found' } };
  }

  const actor = getActorContext(request);
  await dependencies.createAuditLog({
    entityType: 'encounter',
    entityId: encounterId,
    action: 'updated',
    actorUserId: actor.userId,
    actorPractitionerId: actor.practitionerId,
    metadata: { fields: Object.keys(request.body as Record<string, unknown>) },
  });

  return { status: 200, headers: JSON_HEADERS, body: { data: toEncounterDto(encounter) } };
}

function readAppointmentStatus(row: unknown): AppointmentStatus | null {
  if (!row || typeof row !== 'object' || Array.isArray(row)) {
    return null;
  }

  const status = (row as { status?: unknown }).status;
  return isAppointmentStatus(status) ? status : null;
}

function isAppointmentStatus(value: unknown): value is AppointmentStatus {
  return (
    value === 'pending' ||
    value === 'confirmed' ||
    value === 'checked_in' ||
    value === 'completed' ||
    value === 'cancelled' ||
    value === 'no_show'
  );
}

function isAllowedAppointmentTransition(
  currentStatus: AppointmentStatus,
  nextStatus: AppointmentStatus
) {
  return currentStatus === nextStatus || appointmentTransitions[currentStatus].includes(nextStatus);
}

function readEncounterStatus(row: unknown): EncounterStatus | null {
  if (!row || typeof row !== 'object' || Array.isArray(row)) {
    return null;
  }

  const status = (row as { status?: unknown }).status;
  return isEncounterStatus(status) ? status : null;
}

function isEncounterStatus(value: unknown): value is EncounterStatus {
  return (
    value === 'draft' ||
    value === 'in_progress' ||
    value === 'completed' ||
    value === 'signed' ||
    value === 'cancelled'
  );
}

function isAllowedEncounterTransition(currentStatus: EncounterStatus, nextStatus: EncounterStatus) {
  return currentStatus === nextStatus || encounterTransitions[currentStatus].includes(nextStatus);
}

export async function handleListConsentRecordsByPatient(
  request: HttpRequest,
  dependencies: Dependencies,
  patientId: string
): Promise<HttpResponse> {
  const status = readOptionalEnumQuery(request, 'status', [
    'granted',
    'revoked',
    'expired',
    'declined',
  ]);
  if (!status.ok) return validationError(status.error);

  const records = await dependencies.listConsentRecordsByPatient({
    patientId,
    status: status.value,
  });

  return {
    status: 200,
    headers: JSON_HEADERS,
    body: { data: toConsentRecordDtos(records) },
  };
}

export async function handleGetConsentRecord(
  _request: HttpRequest,
  dependencies: Dependencies,
  consentId: string
): Promise<HttpResponse> {
  if (!dependencies.getConsentRecordById) {
    return mapError(new Error('Consent read dependency is not configured'));
  }

  try {
    const record = await dependencies.getConsentRecordById({ consentId });
    if (!record) {
      return { status: 404, headers: JSON_HEADERS, body: { error: 'Consent record not found' } };
    }

    return { status: 200, headers: JSON_HEADERS, body: { data: toConsentRecordDto(record) } };
  } catch (error) {
    return mapError(error);
  }
}

export async function handleCreateConsentRecord(
  request: HttpRequest,
  dependencies: Dependencies
): Promise<HttpResponse> {
  const validation = validateCreateConsentRecordBody(request.body);
  if (!validation.ok) return validationError(validation.error);

  const actor = getActorContext(request);
  const record = await dependencies.createConsentRecord({
    ...validation.value,
    capturedByUserId: validation.value.capturedByUserId ?? actor.userId ?? null,
  });

  await dependencies.createAuditLog({
    entityType: 'consent_record',
    entityId: (record as { id: string }).id,
    action: 'created',
    actorUserId: actor.userId,
    actorPractitionerId: actor.practitionerId,
    metadata: { consentType: validation.value.consentType, status: validation.value.status },
  });

  return { status: 201, headers: JSON_HEADERS, body: { data: toConsentRecordDto(record) } };
}

export async function handleUpdateConsentRecord(
  request: HttpRequest,
  dependencies: Dependencies,
  consentId: string
): Promise<HttpResponse> {
  const validation = validateUpdateConsentRecordBody(request.body, consentId);
  if (!validation.ok) return validationError(validation.error);

  const record = await dependencies.updateConsentRecord(validation.value);
  if (!record) {
    return { status: 404, headers: JSON_HEADERS, body: { error: 'Consent record not found' } };
  }

  const actor = getActorContext(request);
  await dependencies.createAuditLog({
    entityType: 'consent_record',
    entityId: consentId,
    action: 'updated',
    actorUserId: actor.userId,
    actorPractitionerId: actor.practitionerId,
    metadata: { fields: Object.keys(request.body as Record<string, unknown>) },
  });

  return { status: 200, headers: JSON_HEADERS, body: { data: toConsentRecordDto(record) } };
}

export async function handleListAttachments(
  request: HttpRequest,
  dependencies: Dependencies
): Promise<HttpResponse> {
  const targetType = readRequiredEnumQuery(request, 'targetType', [
    'patient',
    'encounter',
    'clinical_note',
    'consent_record',
  ]);
  if (!targetType.ok) return validationError(targetType.error);

  const targetId = request.query?.targetId?.trim();
  if (!targetId) {
    return validationError('targetId is required query parameter');
  }

  const attachments = await dependencies.listAttachmentsByTarget({
    targetType: targetType.value,
    targetId,
  });

  return {
    status: 200,
    headers: JSON_HEADERS,
    body: { data: toAttachmentLinkDtos(attachments) },
  };
}

export async function handleGetFileAsset(
  _request: HttpRequest,
  dependencies: Dependencies,
  fileAssetId: string
): Promise<HttpResponse> {
  if (!dependencies.getFileAssetById) {
    return mapError(new Error('File asset read dependency is not configured'));
  }

  const fileAsset = await dependencies.getFileAssetById({ fileAssetId });
  if (!fileAsset) {
    return { status: 404, headers: JSON_HEADERS, body: { error: 'File asset not found' } };
  }

  return { status: 200, headers: JSON_HEADERS, body: { data: toFileAssetDto(fileAsset) } };
}

export async function handleDownloadFileAsset(
  _request: HttpRequest,
  dependencies: Dependencies,
  fileAssetId: string
): Promise<HttpResponse> {
  if (!dependencies.downloadFileAssetContent) {
    return mapError(new Error('File asset download dependency is not configured'));
  }

  const downloaded = await dependencies.downloadFileAssetContent({ fileAssetId });
  if (!downloaded) {
    return { status: 404, headers: JSON_HEADERS, body: { error: 'File asset content not found' } };
  }

  return {
    status: 200,
    headers: {
      'content-type': downloaded.mimeType || 'application/octet-stream',
      'cache-control': 'private, max-age=300',
    },
    body: downloaded.content,
  };
}

export async function handleListFileAssets(
  request: HttpRequest,
  dependencies: Dependencies
): Promise<HttpResponse> {
  if (!dependencies.listFileAssets) {
    return mapError(new Error('File asset list dependency is not configured'));
  }

  const clinicId = request.query?.clinicId?.trim();
  if (!clinicId) return validationError('clinicId is required query parameter');

  const search = readOptionalQueryString(request, 'search');
  if (!search.ok) return validationError(search.error);

  const limit = readOptionalLimitQuery(request);
  if (!limit.ok) return validationError(limit.error);

  const offset = readOptionalOffsetQuery(request);
  if (!offset.ok) return validationError(offset.error);

  const result = await dependencies.listFileAssets({
    clinicId,
    search: search.value,
    limit: limit.value,
    offset: offset.value,
  });

  return {
    status: 200,
    headers: JSON_HEADERS,
    body: { data: toFileAssetDtos(result.rows), meta: result.meta },
  };
}

export async function handleGetFileAssetStoragePolicy(
  _request: HttpRequest,
  dependencies: Dependencies
): Promise<HttpResponse> {
  if (!dependencies.getFileAssetStoragePolicy) {
    return mapError(new Error('File asset storage policy dependency is not configured'));
  }

  return {
    status: 200,
    headers: JSON_HEADERS,
    body: { data: dependencies.getFileAssetStoragePolicy() },
  };
}

export async function handleCreateFileAsset(
  request: HttpRequest,
  dependencies: Dependencies
): Promise<HttpResponse> {
  const validation = validateCreateFileAssetBody(request.body);
  if (!validation.ok) return validationError(validation.error);

  const actor = getActorContext(request);
  const fileAsset = await dependencies.createFileAsset({
    ...validation.value,
    uploadedByUserId: validation.value.uploadedByUserId ?? actor.userId ?? null,
  });

  await dependencies.createAuditLog({
    entityType: 'file_asset',
    entityId: (fileAsset as { id: string }).id,
    action: 'created',
    actorUserId: actor.userId,
    actorPractitionerId: actor.practitionerId,
    metadata: {
      storageKey: validation.value.storageKey,
      originalFilename: validation.value.originalFilename,
    },
  });

  return { status: 201, headers: JSON_HEADERS, body: { data: toFileAssetDto(fileAsset) } };
}

export async function handleUploadFileAsset(
  request: HttpRequest,
  dependencies: Dependencies
): Promise<HttpResponse> {
  if (!dependencies.uploadFileAsset) {
    return mapError(new Error('File asset upload dependency is not configured'));
  }

  const validation = validateUploadFileAssetBody(request.body);
  if (!validation.ok) return validationError(validation.error);

  const actor = getActorContext(request);
  const fileAsset = await dependencies.uploadFileAsset({
    ...validation.value,
    uploadedByUserId: validation.value.uploadedByUserId ?? actor.userId ?? null,
  });

  await dependencies.createAuditLog({
    entityType: 'file_asset',
    entityId: (fileAsset as { id: string }).id,
    action: 'uploaded',
    actorUserId: actor.userId,
    actorPractitionerId: actor.practitionerId,
    metadata: {
      storageKey: validation.value.storageKey,
      originalFilename: validation.value.originalFilename,
      byteSize: (fileAsset as { byte_size?: number }).byte_size ?? validation.value.byteSize,
    },
  });

  return { status: 201, headers: JSON_HEADERS, body: { data: toFileAssetDto(fileAsset) } };
}

export async function handleCreateAttachmentLink(
  request: HttpRequest,
  dependencies: Dependencies
): Promise<HttpResponse> {
  const validation = validateCreateAttachmentLinkBody(request.body);
  if (!validation.ok) return validationError(validation.error);

  const actor = getActorContext(request);
  const attachment = await dependencies.createAttachmentLink(validation.value);

  await dependencies.createAuditLog({
    entityType: 'attachment_link',
    entityId: (attachment as { id: string }).id,
    action: 'created',
    actorUserId: actor.userId,
    actorPractitionerId: actor.practitionerId,
    metadata: {
      fileAssetId: validation.value.fileAssetId,
      targetType: validation.value.targetType,
      targetId: validation.value.targetId,
    },
  });

  return {
    status: 201,
    headers: JSON_HEADERS,
    body: { data: toAttachmentLinkDto(attachment) },
  };
}

export async function handleListPatientAllergies(
  request: HttpRequest,
  dependencies: Dependencies,
  patientId: string
): Promise<HttpResponse> {
  const status = readOptionalEnumQuery(request, 'status', [
    'active',
    'inactive',
    'entered_in_error',
  ]);
  if (!status.ok) return validationError(status.error);

  const allergies = await dependencies.listPatientAllergies({
    patientId,
    status: status.value,
  });

  return {
    status: 200,
    headers: JSON_HEADERS,
    body: { data: toPatientAllergyDtos(allergies) },
  };
}

export async function handleGetPatientAllergy(
  _request: HttpRequest,
  dependencies: Dependencies,
  allergyId: string
): Promise<HttpResponse> {
  if (!dependencies.getPatientAllergyById) {
    return mapError(new Error('Patient allergy read dependency is not configured'));
  }

  const allergy = await dependencies.getPatientAllergyById({ allergyId });
  if (!allergy) {
    return { status: 404, headers: JSON_HEADERS, body: { error: 'Patient allergy not found' } };
  }

  return { status: 200, headers: JSON_HEADERS, body: { data: toPatientAllergyDto(allergy) } };
}

export async function handleCreatePatientAllergy(
  request: HttpRequest,
  dependencies: Dependencies
): Promise<HttpResponse> {
  const validation = validateCreatePatientAllergyBody(request.body);
  if (!validation.ok) return validationError(validation.error);

  const allergy = await dependencies.createPatientAllergy(validation.value);
  const actor = getActorContext(request);

  await dependencies.createAuditLog({
    entityType: 'patient_allergy',
    entityId: (allergy as { id: string }).id,
    action: 'created',
    actorUserId: actor.userId,
    actorPractitionerId: actor.practitionerId,
    metadata: { allergenName: validation.value.allergenName, patientId: validation.value.patientId },
  });

  return { status: 201, headers: JSON_HEADERS, body: { data: toPatientAllergyDto(allergy) } };
}

export async function handleUpdatePatientAllergy(
  request: HttpRequest,
  dependencies: Dependencies,
  allergyId: string
): Promise<HttpResponse> {
  const validation = validateUpdatePatientAllergyBody(request.body, allergyId);
  if (!validation.ok) return validationError(validation.error);

  const allergy = await dependencies.updatePatientAllergy(validation.value);
  if (!allergy) {
    return { status: 404, headers: JSON_HEADERS, body: { error: 'Patient allergy not found' } };
  }

  const actor = getActorContext(request);
  await dependencies.createAuditLog({
    entityType: 'patient_allergy',
    entityId: allergyId,
    action: 'updated',
    actorUserId: actor.userId,
    actorPractitionerId: actor.practitionerId,
    metadata: { fields: Object.keys(request.body as Record<string, unknown>) },
  });

  return { status: 200, headers: JSON_HEADERS, body: { data: toPatientAllergyDto(allergy) } };
}

export async function handleListPatientConditions(
  request: HttpRequest,
  dependencies: Dependencies,
  patientId: string
): Promise<HttpResponse> {
  const clinicalStatus = readOptionalEnumQuery(request, 'clinicalStatus', [
    'active',
    'resolved',
    'inactive',
    'entered_in_error',
  ]);
  if (!clinicalStatus.ok) return validationError(clinicalStatus.error);

  const conditions = await dependencies.listPatientConditions({
    patientId,
    clinicalStatus: clinicalStatus.value,
  });

  return {
    status: 200,
    headers: JSON_HEADERS,
    body: { data: toPatientConditionDtos(conditions) },
  };
}

export async function handleGetPatientCondition(
  _request: HttpRequest,
  dependencies: Dependencies,
  conditionId: string
): Promise<HttpResponse> {
  if (!dependencies.getPatientConditionById) {
    return mapError(new Error('Patient condition read dependency is not configured'));
  }

  const condition = await dependencies.getPatientConditionById({ conditionId });
  if (!condition) {
    return { status: 404, headers: JSON_HEADERS, body: { error: 'Patient condition not found' } };
  }

  return { status: 200, headers: JSON_HEADERS, body: { data: toPatientConditionDto(condition) } };
}

export async function handleCreatePatientCondition(
  request: HttpRequest,
  dependencies: Dependencies
): Promise<HttpResponse> {
  const validation = validateCreatePatientConditionBody(request.body);
  if (!validation.ok) return validationError(validation.error);

  const condition = await dependencies.createPatientCondition(validation.value);
  const actor = getActorContext(request);

  await dependencies.createAuditLog({
    entityType: 'patient_condition',
    entityId: (condition as { id: string }).id,
    action: 'created',
    actorUserId: actor.userId,
    actorPractitionerId: actor.practitionerId,
    metadata: { conditionName: validation.value.conditionName, patientId: validation.value.patientId },
  });

  return { status: 201, headers: JSON_HEADERS, body: { data: toPatientConditionDto(condition) } };
}

export async function handleUpdatePatientCondition(
  request: HttpRequest,
  dependencies: Dependencies,
  conditionId: string
): Promise<HttpResponse> {
  const validation = validateUpdatePatientConditionBody(request.body, conditionId);
  if (!validation.ok) return validationError(validation.error);

  const condition = await dependencies.updatePatientCondition(validation.value);
  if (!condition) {
    return { status: 404, headers: JSON_HEADERS, body: { error: 'Patient condition not found' } };
  }

  const actor = getActorContext(request);
  await dependencies.createAuditLog({
    entityType: 'patient_condition',
    entityId: conditionId,
    action: 'updated',
    actorUserId: actor.userId,
    actorPractitionerId: actor.practitionerId,
    metadata: { fields: Object.keys(request.body as Record<string, unknown>) },
  });

  return { status: 200, headers: JSON_HEADERS, body: { data: toPatientConditionDto(condition) } };
}

export async function handleListPatientMedications(
  request: HttpRequest,
  dependencies: Dependencies,
  patientId: string
): Promise<HttpResponse> {
  const status = readOptionalEnumQuery(request, 'status', [
    'active',
    'completed',
    'stopped',
    'on_hold',
    'entered_in_error',
  ]);
  if (!status.ok) return validationError(status.error);

  const medications = await dependencies.listPatientMedications({
    patientId,
    status: status.value,
  });

  return {
    status: 200,
    headers: JSON_HEADERS,
    body: { data: toPatientMedicationDtos(medications) },
  };
}

export async function handleGetPatientMedication(
  _request: HttpRequest,
  dependencies: Dependencies,
  medicationId: string
): Promise<HttpResponse> {
  if (!dependencies.getPatientMedicationById) {
    return mapError(new Error('Patient medication read dependency is not configured'));
  }

  const medication = await dependencies.getPatientMedicationById({ medicationId });
  if (!medication) {
    return { status: 404, headers: JSON_HEADERS, body: { error: 'Patient medication not found' } };
  }

  return { status: 200, headers: JSON_HEADERS, body: { data: toPatientMedicationDto(medication) } };
}

export async function handleCreatePatientMedication(
  request: HttpRequest,
  dependencies: Dependencies
): Promise<HttpResponse> {
  const validation = validateCreatePatientMedicationBody(request.body);
  if (!validation.ok) return validationError(validation.error);

  const medication = await dependencies.createPatientMedication(validation.value);
  const actor = getActorContext(request);

  await dependencies.createAuditLog({
    entityType: 'patient_medication',
    entityId: (medication as { id: string }).id,
    action: 'created',
    actorUserId: actor.userId,
    actorPractitionerId: actor.practitionerId,
    metadata: {
      medicationName: validation.value.medicationName,
      patientId: validation.value.patientId,
    },
  });

  return { status: 201, headers: JSON_HEADERS, body: { data: toPatientMedicationDto(medication) } };
}

export async function handleUpdatePatientMedication(
  request: HttpRequest,
  dependencies: Dependencies,
  medicationId: string
): Promise<HttpResponse> {
  const validation = validateUpdatePatientMedicationBody(request.body, medicationId);
  if (!validation.ok) return validationError(validation.error);

  const medication = await dependencies.updatePatientMedication(validation.value);
  if (!medication) {
    return { status: 404, headers: JSON_HEADERS, body: { error: 'Patient medication not found' } };
  }

  const actor = getActorContext(request);
  await dependencies.createAuditLog({
    entityType: 'patient_medication',
    entityId: medicationId,
    action: 'updated',
    actorUserId: actor.userId,
    actorPractitionerId: actor.practitionerId,
    metadata: { fields: Object.keys(request.body as Record<string, unknown>) },
  });

  return { status: 200, headers: JSON_HEADERS, body: { data: toPatientMedicationDto(medication) } };
}

export async function handleListPatientFlags(
  request: HttpRequest,
  dependencies: Dependencies,
  patientId: string
): Promise<HttpResponse> {
  const status = readOptionalEnumQuery(request, 'status', [
    'active',
    'inactive',
    'resolved',
    'entered_in_error',
  ]);
  if (!status.ok) return validationError(status.error);

  const severity = readOptionalEnumQuery(request, 'severity', ['info', 'caution', 'critical']);
  if (!severity.ok) return validationError(severity.error);

  const flags = await dependencies.listPatientFlags({
    patientId,
    status: status.value,
    severity: severity.value,
  });

  return {
    status: 200,
    headers: JSON_HEADERS,
    body: { data: toPatientFlagDtos(flags) },
  };
}

export async function handleGetPatientFlag(
  _request: HttpRequest,
  dependencies: Dependencies,
  flagId: string
): Promise<HttpResponse> {
  if (!dependencies.getPatientFlagById) {
    return mapError(new Error('Patient flag read dependency is not configured'));
  }

  const flag = await dependencies.getPatientFlagById({ flagId });
  if (!flag) {
    return { status: 404, headers: JSON_HEADERS, body: { error: 'Patient flag not found' } };
  }

  return { status: 200, headers: JSON_HEADERS, body: { data: toPatientFlagDto(flag) } };
}

export async function handleCreatePatientFlag(
  request: HttpRequest,
  dependencies: Dependencies
): Promise<HttpResponse> {
  const validation = validateCreatePatientFlagBody(request.body);
  if (!validation.ok) return validationError(validation.error);

  const actor = getActorContext(request);
  const flag = await dependencies.createPatientFlag({
    ...validation.value,
    createdByUserId: validation.value.createdByUserId ?? actor.userId,
  });

  await dependencies.createAuditLog({
    entityType: 'patient_flag',
    entityId: (flag as { id: string }).id,
    action: 'created',
    actorUserId: actor.userId,
    actorPractitionerId: actor.practitionerId,
    metadata: {
      patientId: validation.value.patientId,
      flagType: validation.value.flagType,
      severity: validation.value.severity ?? 'caution',
    },
  });

  return { status: 201, headers: JSON_HEADERS, body: { data: toPatientFlagDto(flag) } };
}

export async function handleUpdatePatientFlag(
  request: HttpRequest,
  dependencies: Dependencies,
  flagId: string
): Promise<HttpResponse> {
  const validation = validateUpdatePatientFlagBody(request.body, flagId);
  if (!validation.ok) return validationError(validation.error);

  const flag = await dependencies.updatePatientFlag(validation.value);
  if (!flag) {
    return { status: 404, headers: JSON_HEADERS, body: { error: 'Patient flag not found' } };
  }

  const actor = getActorContext(request);
  await dependencies.createAuditLog({
    entityType: 'patient_flag',
    entityId: flagId,
    action: 'updated',
    actorUserId: actor.userId,
    actorPractitionerId: actor.practitionerId,
    metadata: { fields: Object.keys(request.body as Record<string, unknown>) },
  });

  return { status: 200, headers: JSON_HEADERS, body: { data: toPatientFlagDto(flag) } };
}

export async function handleListUsers(
  request: HttpRequest,
  dependencies: Dependencies
): Promise<HttpResponse> {
  const clinicId = request.query?.clinicId?.trim();

  if (!clinicId) {
    return validationError('clinicId is required query parameter');
  }

  const search = readOptionalQueryString(request, 'search');
  if (!search.ok) return validationError(search.error);

  const active = readOptionalEnumQuery(request, 'active', ['active', 'inactive', 'all']);
  if (!active.ok) return validationError(active.error);

  const limit = readOptionalLimitQuery(request);
  if (!limit.ok) return validationError(limit.error);

  const offset = readOptionalOffsetQuery(request);
  if (!offset.ok) return validationError(offset.error);

  const users = await dependencies.listUsers({
    clinicId,
    search: search.value,
    active: active.value,
    limit: limit.value,
    offset: offset.value,
  });
  return {
    status: 200,
    headers: JSON_HEADERS,
    body: { data: toUserDtos(users.rows), meta: users.meta },
  };
}

export async function handleCreateUser(
  request: HttpRequest,
  dependencies: Dependencies
): Promise<HttpResponse> {
  const validation = validateCreateUserBody(request.body);
  if (!validation.ok) return validationError(validation.error);

  try {
    const user = await dependencies.createUser(validation.value);

    const actor = getActorContext(request);
    await dependencies.createAuditLog({
      entityType: 'user',
      entityId: (user as { id: string }).id,
      action: 'created',
      actorUserId: actor.userId,
      actorPractitionerId: actor.practitionerId,
      metadata: { username: validation.value.username },
    });

    return { status: 201, headers: JSON_HEADERS, body: { data: toUserDto(user) } };
  } catch (error) {
    return mapError(error);
  }
}

export async function handleUpdateUser(
  request: HttpRequest,
  dependencies: Dependencies,
  userId: string
): Promise<HttpResponse> {
  const validation = validateUpdateUserBody(request.body, userId);
  if (!validation.ok) return validationError(validation.error);

  try {
    const user = await dependencies.updateUser(validation.value);

    if (!user) {
      return { status: 404, headers: JSON_HEADERS, body: { error: 'User not found' } };
    }

    const actor = getActorContext(request);
    await dependencies.createAuditLog({
      entityType: 'user',
      entityId: userId,
      action: 'updated',
      actorUserId: actor.userId,
      actorPractitionerId: actor.practitionerId,
      metadata: { fields: Object.keys(request.body as Record<string, unknown>) },
    });

    return { status: 200, headers: JSON_HEADERS, body: { data: toUserDto(user) } };
  } catch (error) {
    return mapError(error);
  }
}

export async function handleListPractitioners(
  request: HttpRequest,
  dependencies: Dependencies
): Promise<HttpResponse> {
  const clinicId = request.query?.clinicId?.trim();

  if (!clinicId) {
    return validationError('clinicId is required query parameter');
  }

  const search = readOptionalQueryString(request, 'search');
  if (!search.ok) return validationError(search.error);

  const active = readOptionalEnumQuery(request, 'active', ['active', 'inactive', 'all']);
  if (!active.ok) return validationError(active.error);

  const limit = readOptionalLimitQuery(request);
  if (!limit.ok) return validationError(limit.error);

  const offset = readOptionalOffsetQuery(request);
  if (!offset.ok) return validationError(offset.error);

  const practitioners = await dependencies.listPractitioners({
    clinicId,
    search: search.value,
    active: active.value,
    limit: limit.value,
    offset: offset.value,
  });
  return {
    status: 200,
    headers: JSON_HEADERS,
    body: { data: toPractitionerDtos(practitioners.rows), meta: practitioners.meta },
  };
}

export async function handleCreatePractitioner(
  request: HttpRequest,
  dependencies: Dependencies
): Promise<HttpResponse> {
  const validation = validateCreatePractitionerBody(request.body);
  if (!validation.ok) return validationError(validation.error);

  try {
    const practitioner = await dependencies.createPractitioner(validation.value);

    const actor = getActorContext(request);
    await dependencies.createAuditLog({
      entityType: 'practitioner',
      entityId: (practitioner as { id: string }).id,
      action: 'created',
      actorUserId: actor.userId,
      actorPractitionerId: actor.practitionerId,
      metadata: { practitionerCode: validation.value.practitionerCode },
    });

    return { status: 201, headers: JSON_HEADERS, body: { data: toPractitionerDto(practitioner) } };
  } catch (error) {
    return mapError(error);
  }
}

export async function handleUpdatePractitioner(
  request: HttpRequest,
  dependencies: Dependencies,
  practitionerId: string
): Promise<HttpResponse> {
  const validation = validateUpdatePractitionerBody(request.body, practitionerId);
  if (!validation.ok) return validationError(validation.error);

  try {
    const practitioner = await dependencies.updatePractitioner(validation.value);

    if (!practitioner) {
      return { status: 404, headers: JSON_HEADERS, body: { error: 'Practitioner not found' } };
    }

    const actor = getActorContext(request);
    await dependencies.createAuditLog({
      entityType: 'practitioner',
      entityId: practitionerId,
      action: 'updated',
      actorUserId: actor.userId,
      actorPractitionerId: actor.practitionerId,
      metadata: { fields: Object.keys(request.body as Record<string, unknown>) },
    });

    return { status: 200, headers: JSON_HEADERS, body: { data: toPractitionerDto(practitioner) } };
  } catch (error) {
    return mapError(error);
  }
}

export async function handleListDrugCatalog(
  request: HttpRequest,
  dependencies: Dependencies
): Promise<HttpResponse> {
  if (!dependencies.listDrugCatalog) {
    return mapError(new Error('Drug catalog list dependency is not configured'));
  }

  const clinicId = request.query?.clinicId?.trim();

  if (!clinicId) {
    return validationError('clinicId is required query parameter');
  }

  const search = readOptionalQueryString(request, 'search');
  if (!search.ok) return validationError(search.error);

  const active = readOptionalEnumQuery(request, 'active', ['active', 'inactive', 'all']);
  if (!active.ok) return validationError(active.error);

  const limit = readOptionalLimitQuery(request);
  if (!limit.ok) return validationError(limit.error);

  const offset = readOptionalOffsetQuery(request);
  if (!offset.ok) return validationError(offset.error);

  const catalog = await dependencies.listDrugCatalog({
    clinicId,
    search: search.value,
    active: active.value,
    limit: limit.value,
    offset: offset.value,
  });
  return {
    status: 200,
    headers: JSON_HEADERS,
    body: { data: toDrugCatalogItemDtos(catalog.rows), meta: catalog.meta },
  };
}

export async function handleCreateDrugCatalogItem(
  request: HttpRequest,
  dependencies: Dependencies
): Promise<HttpResponse> {
  if (!dependencies.createDrugCatalogItem) {
    return mapError(new Error('Drug catalog create dependency is not configured'));
  }

  const validation = validateCreateDrugCatalogItemBody(request.body);
  if (!validation.ok) return validationError(validation.error);

  try {
    const item = await dependencies.createDrugCatalogItem(validation.value);

    const actor = getActorContext(request);
    await dependencies.createAuditLog({
      entityType: 'drug_catalog',
      entityId: (item as { id: string }).id,
      action: 'created',
      actorUserId: actor.userId,
      actorPractitionerId: actor.practitionerId,
      metadata: { medicationName: validation.value.medicationName },
    });

    return { status: 201, headers: JSON_HEADERS, body: { data: toDrugCatalogItemDto(item) } };
  } catch (error) {
    return mapError(error);
  }
}

export async function handleUpdateDrugCatalogItem(
  request: HttpRequest,
  dependencies: Dependencies,
  drugCatalogId: string
): Promise<HttpResponse> {
  if (!dependencies.updateDrugCatalogItem) {
    return mapError(new Error('Drug catalog update dependency is not configured'));
  }

  const validation = validateUpdateDrugCatalogItemBody(request.body, drugCatalogId);
  if (!validation.ok) return validationError(validation.error);

  try {
    const item = await dependencies.updateDrugCatalogItem(validation.value);

    if (!item) {
      return { status: 404, headers: JSON_HEADERS, body: { error: 'Drug catalog item not found' } };
    }

    const actor = getActorContext(request);
    await dependencies.createAuditLog({
      entityType: 'drug_catalog',
      entityId: drugCatalogId,
      action: 'updated',
      actorUserId: actor.userId,
      actorPractitionerId: actor.practitionerId,
      metadata: { fields: Object.keys(request.body as Record<string, unknown>) },
    });

    return { status: 200, headers: JSON_HEADERS, body: { data: toDrugCatalogItemDto(item) } };
  } catch (error) {
    return mapError(error);
  }
}

export async function handleListInventoryItems(
  request: HttpRequest,
  dependencies: Dependencies
): Promise<HttpResponse> {
  if (!dependencies.listInventoryItems) {
    return mapError(new Error('Inventory item list dependency is not configured'));
  }

  const clinicId = request.query?.clinicId?.trim();
  if (!clinicId) return validationError('clinicId is required query parameter');
  const search = readOptionalQueryString(request, 'search');
  if (!search.ok) return validationError(search.error);
  const active = readOptionalEnumQuery(request, 'active', ['active', 'inactive', 'all']);
  if (!active.ok) return validationError(active.error);
  const lowStock = readOptionalBooleanQuery(request, 'lowStock');
  if (!lowStock.ok) return validationError(lowStock.error);
  const limit = readOptionalLimitQuery(request);
  if (!limit.ok) return validationError(limit.error);
  const offset = readOptionalOffsetQuery(request);
  if (!offset.ok) return validationError(offset.error);

  const items = await dependencies.listInventoryItems({
    clinicId,
    search: search.value,
    active: active.value,
    lowStock: lowStock.value,
    limit: limit.value,
    offset: offset.value,
  });

  return {
    status: 200,
    headers: JSON_HEADERS,
    body: { data: toInventoryItemDtos(items.rows), meta: items.meta },
  };
}

export async function handleCreateInventoryItem(
  request: HttpRequest,
  dependencies: Dependencies
): Promise<HttpResponse> {
  if (!dependencies.createInventoryItem) {
    return mapError(new Error('Inventory item create dependency is not configured'));
  }

  const validation = validateCreateInventoryItemBody(request.body);
  if (!validation.ok) return validationError(validation.error);

  try {
    const item = await dependencies.createInventoryItem(validation.value);
    const actor = getActorContext(request);
    await dependencies.createAuditLog({
      entityType: 'inventory_item',
      entityId: (item as { id: string }).id,
      action: 'created',
      actorUserId: actor.userId,
      actorPractitionerId: actor.practitionerId,
      metadata: { itemCode: validation.value.itemCode },
    });

    return { status: 201, headers: JSON_HEADERS, body: { data: toInventoryItemDto(item) } };
  } catch (error) {
    return mapError(error);
  }
}

export async function handleUpdateInventoryItem(
  request: HttpRequest,
  dependencies: Dependencies,
  inventoryItemId: string
): Promise<HttpResponse> {
  if (!dependencies.updateInventoryItem) {
    return mapError(new Error('Inventory item update dependency is not configured'));
  }

  const validation = validateUpdateInventoryItemBody(request.body, inventoryItemId);
  if (!validation.ok) return validationError(validation.error);

  try {
    const item = await dependencies.updateInventoryItem(validation.value);
    if (!item) {
      return { status: 404, headers: JSON_HEADERS, body: { error: 'Inventory item not found' } };
    }

    const actor = getActorContext(request);
    await dependencies.createAuditLog({
      entityType: 'inventory_item',
      entityId: inventoryItemId,
      action: 'updated',
      actorUserId: actor.userId,
      actorPractitionerId: actor.practitionerId,
      metadata: { fields: Object.keys(request.body as Record<string, unknown>) },
    });

    return { status: 200, headers: JSON_HEADERS, body: { data: toInventoryItemDto(item) } };
  } catch (error) {
    return mapError(error);
  }
}

export async function handleAdjustInventoryStock(
  request: HttpRequest,
  dependencies: Dependencies,
  inventoryItemId: string
): Promise<HttpResponse> {
  if (!dependencies.adjustInventoryStock) {
    return mapError(new Error('Inventory stock adjustment dependency is not configured'));
  }

  const validation = validateAdjustInventoryStockBody(request.body, inventoryItemId);
  if (!validation.ok) return validationError(validation.error);

  try {
    const item = await dependencies.adjustInventoryStock(validation.value);
    if (!item) {
      return { status: 404, headers: JSON_HEADERS, body: { error: 'Inventory item not found' } };
    }

    const actor = getActorContext(request);
    await dependencies.createAuditLog({
      entityType: 'inventory_item',
      entityId: inventoryItemId,
      action: 'stock_adjusted',
      actorUserId: actor.userId,
      actorPractitionerId: actor.practitionerId,
      metadata: {
        movementType: validation.value.movementType,
        quantity: validation.value.quantity,
      },
    });

    return { status: 200, headers: JSON_HEADERS, body: { data: toInventoryItemDto(item) } };
  } catch (error) {
    return mapError(error);
  }
}

export async function handleListInventoryLots(
  request: HttpRequest,
  dependencies: Dependencies
): Promise<HttpResponse> {
  if (!dependencies.listInventoryLots) {
    return mapError(new Error('Inventory lot list dependency is not configured'));
  }

  const clinicId = request.query?.clinicId?.trim();
  if (!clinicId) return validationError('clinicId is required query parameter');
  const inventoryItemId = readOptionalQueryString(request, 'inventoryItemId');
  if (!inventoryItemId.ok) return validationError(inventoryItemId.error);
  const expiringBefore = readOptionalQueryString(request, 'expiringBefore');
  if (!expiringBefore.ok) return validationError(expiringBefore.error);
  const includeEmpty = readOptionalBooleanQuery(request, 'includeEmpty');
  if (!includeEmpty.ok) return validationError(includeEmpty.error);
  const limit = readOptionalLimitQuery(request);
  if (!limit.ok) return validationError(limit.error);
  const offset = readOptionalOffsetQuery(request);
  if (!offset.ok) return validationError(offset.error);

  const lots = await dependencies.listInventoryLots({
    clinicId,
    inventoryItemId: inventoryItemId.value,
    expiringBefore: expiringBefore.value,
    includeEmpty: includeEmpty.value,
    limit: limit.value,
    offset: offset.value,
  });

  return {
    status: 200,
    headers: JSON_HEADERS,
    body: { data: toInventoryLotDtos(lots.rows), meta: lots.meta },
  };
}

export async function handleReceiveInventoryLot(
  request: HttpRequest,
  dependencies: Dependencies
): Promise<HttpResponse> {
  if (!dependencies.receiveInventoryLot) {
    return mapError(new Error('Inventory lot receiving dependency is not configured'));
  }

  const validation = validateReceiveInventoryLotBody(request.body);
  if (!validation.ok) return validationError(validation.error);

  try {
    const lot = await dependencies.receiveInventoryLot(validation.value);
    if (!lot) {
      return { status: 404, headers: JSON_HEADERS, body: { error: 'Inventory item not found' } };
    }

    const actor = getActorContext(request);
    await dependencies.createAuditLog({
      entityType: 'inventory_lot',
      entityId: (lot as { id: string }).id,
      action: 'received',
      actorUserId: actor.userId,
      actorPractitionerId: actor.practitionerId,
      metadata: {
        inventoryItemId: validation.value.inventoryItemId,
        lotNumber: validation.value.lotNumber,
        quantity: validation.value.quantity,
      },
    });

    return { status: 201, headers: JSON_HEADERS, body: { data: toInventoryLotDto(lot) } };
  } catch (error) {
    return mapError(error);
  }
}

export async function handleListSuppliers(
  request: HttpRequest,
  dependencies: Dependencies
): Promise<HttpResponse> {
  if (!dependencies.listSuppliers) {
    return mapError(new Error('Supplier list dependency is not configured'));
  }

  const clinicId = request.query?.clinicId?.trim();
  if (!clinicId) return validationError('clinicId is required query parameter');
  const search = readOptionalQueryString(request, 'search');
  if (!search.ok) return validationError(search.error);
  const status = readOptionalEnumQuery(request, 'status', ['active', 'inactive', 'all']);
  if (!status.ok) return validationError(status.error);
  const limit = readOptionalLimitQuery(request);
  if (!limit.ok) return validationError(limit.error);
  const offset = readOptionalOffsetQuery(request);
  if (!offset.ok) return validationError(offset.error);

  const suppliers = await dependencies.listSuppliers({
    clinicId,
    search: search.value,
    status: status.value,
    limit: limit.value,
    offset: offset.value,
  });

  return {
    status: 200,
    headers: JSON_HEADERS,
    body: { data: toSupplierDtos(suppliers.rows), meta: suppliers.meta },
  };
}

export async function handleCreateSupplier(
  request: HttpRequest,
  dependencies: Dependencies
): Promise<HttpResponse> {
  if (!dependencies.createSupplier) {
    return mapError(new Error('Supplier create dependency is not configured'));
  }

  const validation = validateCreateSupplierBody(request.body);
  if (!validation.ok) return validationError(validation.error);

  try {
    const supplier = await dependencies.createSupplier(validation.value);
    const actor = getActorContext(request);
    await dependencies.createAuditLog({
      entityType: 'supplier',
      entityId: (supplier as { id: string }).id,
      action: 'created',
      actorUserId: actor.userId,
      actorPractitionerId: actor.practitionerId,
      metadata: { supplierCode: validation.value.supplierCode },
    });

    return { status: 201, headers: JSON_HEADERS, body: { data: toSupplierDto(supplier) } };
  } catch (error) {
    return mapError(error);
  }
}

export async function handleUpdateSupplier(
  request: HttpRequest,
  dependencies: Dependencies,
  supplierId: string
): Promise<HttpResponse> {
  if (!dependencies.updateSupplier) {
    return mapError(new Error('Supplier update dependency is not configured'));
  }

  const validation = validateUpdateSupplierBody(request.body, supplierId);
  if (!validation.ok) return validationError(validation.error);

  try {
    const supplier = await dependencies.updateSupplier(validation.value);
    if (!supplier) {
      return { status: 404, headers: JSON_HEADERS, body: { error: 'Supplier not found' } };
    }

    const actor = getActorContext(request);
    await dependencies.createAuditLog({
      entityType: 'supplier',
      entityId: supplierId,
      action: 'updated',
      actorUserId: actor.userId,
      actorPractitionerId: actor.practitionerId,
      metadata: { fields: Object.keys(request.body as Record<string, unknown>) },
    });

    return { status: 200, headers: JSON_HEADERS, body: { data: toSupplierDto(supplier) } };
  } catch (error) {
    return mapError(error);
  }
}

export async function handleListPurchaseOrders(
  request: HttpRequest,
  dependencies: Dependencies
): Promise<HttpResponse> {
  if (!dependencies.listPurchaseOrders) {
    return mapError(new Error('Purchase order list dependency is not configured'));
  }

  const clinicId = request.query?.clinicId?.trim();
  if (!clinicId) return validationError('clinicId is required query parameter');
  const supplierId = readOptionalQueryString(request, 'supplierId');
  if (!supplierId.ok) return validationError(supplierId.error);
  const status = readOptionalEnumQuery(request, 'status', [
    'draft',
    'ordered',
    'partially_received',
    'received',
    'cancelled',
    'all',
  ]);
  if (!status.ok) return validationError(status.error);
  const approvalStatus = readOptionalEnumQuery(request, 'approvalStatus', [
    'draft',
    'pending_approval',
    'approved',
    'rejected',
    'all',
  ]);
  if (!approvalStatus.ok) return validationError(approvalStatus.error);
  const limit = readOptionalLimitQuery(request);
  if (!limit.ok) return validationError(limit.error);
  const offset = readOptionalOffsetQuery(request);
  if (!offset.ok) return validationError(offset.error);

  const orders = await dependencies.listPurchaseOrders({
    clinicId,
    supplierId: supplierId.value,
    status: status.value,
    approvalStatus: approvalStatus.value,
    limit: limit.value,
    offset: offset.value,
  });

  return {
    status: 200,
    headers: JSON_HEADERS,
    body: { data: toPurchaseOrderDtos(orders.rows), meta: orders.meta },
  };
}

export async function handleListPurchaseOrderApprovalPolicies(
  request: HttpRequest,
  dependencies: Dependencies
): Promise<HttpResponse> {
  if (!dependencies.listPurchaseOrderApprovalPolicies) {
    return mapError(new Error('Purchase order approval policy list dependency is not configured'));
  }

  const clinicId = request.query?.clinicId?.trim();
  if (!clinicId) return validationError('clinicId is required query parameter');
  const active = readOptionalEnumQuery(request, 'active', ['active', 'inactive', 'all']);
  if (!active.ok) return validationError(active.error);
  const limit = readOptionalLimitQuery(request);
  if (!limit.ok) return validationError(limit.error);
  const offset = readOptionalOffsetQuery(request);
  if (!offset.ok) return validationError(offset.error);

  const policies = await dependencies.listPurchaseOrderApprovalPolicies({
    clinicId,
    active: active.value,
    limit: limit.value,
    offset: offset.value,
  });

  return {
    status: 200,
    headers: JSON_HEADERS,
    body: { data: toPurchaseOrderApprovalPolicyDtos(policies.rows), meta: policies.meta },
  };
}

export async function handleCreatePurchaseOrderApprovalPolicy(
  request: HttpRequest,
  dependencies: Dependencies
): Promise<HttpResponse> {
  if (!dependencies.createPurchaseOrderApprovalPolicy) {
    return mapError(new Error('Purchase order approval policy create dependency is not configured'));
  }

  const validation = validateCreatePurchaseOrderApprovalPolicyBody(request.body);
  if (!validation.ok) return validationError(validation.error);

  try {
    const policy = await dependencies.createPurchaseOrderApprovalPolicy(validation.value);
    const actor = getActorContext(request);
    await dependencies.createAuditLog({
      entityType: 'purchase_order_approval_policy',
      entityId: (policy as { id: string }).id,
      action: 'created',
      actorUserId: actor.userId,
      actorPractitionerId: actor.practitionerId,
      metadata: { policyName: validation.value.policyName },
    });

    return {
      status: 201,
      headers: JSON_HEADERS,
      body: { data: toPurchaseOrderApprovalPolicyDto(policy) },
    };
  } catch (error) {
    return mapError(error);
  }
}

export async function handleUpdatePurchaseOrderApprovalPolicy(
  request: HttpRequest,
  dependencies: Dependencies,
  policyId: string
): Promise<HttpResponse> {
  if (!dependencies.updatePurchaseOrderApprovalPolicy) {
    return mapError(new Error('Purchase order approval policy update dependency is not configured'));
  }

  const validation = validateUpdatePurchaseOrderApprovalPolicyBody(request.body, policyId);
  if (!validation.ok) return validationError(validation.error);

  try {
    const policy = await dependencies.updatePurchaseOrderApprovalPolicy(validation.value);
    if (!policy) {
      return { status: 404, headers: JSON_HEADERS, body: { error: 'Approval policy not found' } };
    }

    const actor = getActorContext(request);
    await dependencies.createAuditLog({
      entityType: 'purchase_order_approval_policy',
      entityId: policyId,
      action: 'updated',
      actorUserId: actor.userId,
      actorPractitionerId: actor.practitionerId,
      metadata: { fields: Object.keys(request.body as Record<string, unknown>) },
    });

    return {
      status: 200,
      headers: JSON_HEADERS,
      body: { data: toPurchaseOrderApprovalPolicyDto(policy) },
    };
  } catch (error) {
    return mapError(error);
  }
}

export async function handleCreatePurchaseOrder(
  request: HttpRequest,
  dependencies: Dependencies
): Promise<HttpResponse> {
  if (!dependencies.createPurchaseOrder) {
    return mapError(new Error('Purchase order create dependency is not configured'));
  }

  const validation = validateCreatePurchaseOrderBody(request.body);
  if (!validation.ok) return validationError(validation.error);

  try {
    const order = await dependencies.createPurchaseOrder(validation.value);
    if (!order) {
      return { status: 404, headers: JSON_HEADERS, body: { error: 'Purchase order inventory item not found' } };
    }

    const actor = getActorContext(request);
    await dependencies.createAuditLog({
      entityType: 'purchase_order',
      entityId: (order as { id: string }).id,
      action: 'created',
      actorUserId: actor.userId,
      actorPractitionerId: actor.practitionerId,
      metadata: {
        purchaseOrderNumber: validation.value.purchaseOrderNumber,
        lineCount: validation.value.lines.length,
      },
    });

    return { status: 201, headers: JSON_HEADERS, body: { data: toPurchaseOrderDto(order) } };
  } catch (error) {
    return mapError(error);
  }
}

export async function handleUpdatePurchaseOrder(
  request: HttpRequest,
  dependencies: Dependencies,
  purchaseOrderId: string
): Promise<HttpResponse> {
  if (!dependencies.updatePurchaseOrder) {
    return mapError(new Error('Purchase order update dependency is not configured'));
  }

  const validation = validateUpdatePurchaseOrderBody(request.body, purchaseOrderId);
  if (!validation.ok) return validationError(validation.error);

  try {
    const order = await dependencies.updatePurchaseOrder(validation.value);
    if (!order) {
      return { status: 404, headers: JSON_HEADERS, body: { error: 'Purchase order not found' } };
    }

    const actor = getActorContext(request);
    await dependencies.createAuditLog({
      entityType: 'purchase_order',
      entityId: purchaseOrderId,
      action: 'updated',
      actorUserId: actor.userId,
      actorPractitionerId: actor.practitionerId,
      metadata: { fields: Object.keys(request.body as Record<string, unknown>) },
    });

    return { status: 200, headers: JSON_HEADERS, body: { data: toPurchaseOrderDto(order) } };
  } catch (error) {
    return mapError(error);
  }
}

export async function handleReceivePurchaseOrder(
  request: HttpRequest,
  dependencies: Dependencies,
  purchaseOrderId: string
): Promise<HttpResponse> {
  if (!dependencies.receivePurchaseOrder) {
    return mapError(new Error('Purchase order receive dependency is not configured'));
  }

  const validation = validateReceivePurchaseOrderBody(request.body, purchaseOrderId);
  if (!validation.ok) return validationError(validation.error);

  try {
    const order = await dependencies.receivePurchaseOrder(validation.value);
    if (!order) {
      return { status: 404, headers: JSON_HEADERS, body: { error: 'Purchase order line not found' } };
    }

    const actor = getActorContext(request);
    await dependencies.createAuditLog({
      entityType: 'purchase_order',
      entityId: purchaseOrderId,
      action: 'received',
      actorUserId: actor.userId,
      actorPractitionerId: actor.practitionerId,
      metadata: {
        purchaseOrderLineId: validation.value.purchaseOrderLineId,
        lotNumber: validation.value.lotNumber,
        quantity: validation.value.quantity,
      },
    });

    return { status: 200, headers: JSON_HEADERS, body: { data: toPurchaseOrderDto(order) } };
  } catch (error) {
    return mapError(error);
  }
}

export async function handleSubmitPurchaseOrder(
  request: HttpRequest,
  dependencies: Dependencies,
  purchaseOrderId: string
): Promise<HttpResponse> {
  if (!dependencies.submitPurchaseOrder) {
    return mapError(new Error('Purchase order submit dependency is not configured'));
  }

  const validation = validateSubmitPurchaseOrderBody(request.body, purchaseOrderId);
  if (!validation.ok) return validationError(validation.error);

  try {
    const order = await dependencies.submitPurchaseOrder(validation.value);
    if (!order) {
      return { status: 409, headers: JSON_HEADERS, body: { error: 'Purchase order cannot be submitted' } };
    }

    const actor = getActorContext(request);
    await dependencies.createAuditLog({
      entityType: 'purchase_order',
      entityId: purchaseOrderId,
      action: 'submitted',
      actorUserId: actor.userId,
      actorPractitionerId: actor.practitionerId,
      metadata: {},
    });

    return { status: 200, headers: JSON_HEADERS, body: { data: toPurchaseOrderDto(order) } };
  } catch (error) {
    return mapError(error);
  }
}

export async function handleApprovePurchaseOrder(
  request: HttpRequest,
  dependencies: Dependencies,
  purchaseOrderId: string
): Promise<HttpResponse> {
  if (!dependencies.approvePurchaseOrder) {
    return mapError(new Error('Purchase order approve dependency is not configured'));
  }

  const validation = validateApprovePurchaseOrderBody(request.body, purchaseOrderId);
  if (!validation.ok) return validationError(validation.error);

  try {
    const actor = getActorContext(request);
    const order = await dependencies.approvePurchaseOrder({
      ...validation.value,
      approverRole: validation.value.approverRole ?? (actor.role as UserRole | undefined),
    });
    if (!order) {
      return { status: 409, headers: JSON_HEADERS, body: { error: 'Purchase order cannot be approved' } };
    }

    await dependencies.createAuditLog({
      entityType: 'purchase_order',
      entityId: purchaseOrderId,
      action: 'approved',
      actorUserId: actor.userId,
      actorPractitionerId: actor.practitionerId,
      metadata: {},
    });

    return { status: 200, headers: JSON_HEADERS, body: { data: toPurchaseOrderDto(order) } };
  } catch (error) {
    return mapError(error);
  }
}

export async function handleRejectPurchaseOrder(
  request: HttpRequest,
  dependencies: Dependencies,
  purchaseOrderId: string
): Promise<HttpResponse> {
  if (!dependencies.rejectPurchaseOrder) {
    return mapError(new Error('Purchase order reject dependency is not configured'));
  }

  const validation = validateRejectPurchaseOrderBody(request.body, purchaseOrderId);
  if (!validation.ok) return validationError(validation.error);

  try {
    const actor = getActorContext(request);
    const order = await dependencies.rejectPurchaseOrder({
      ...validation.value,
      approverRole: validation.value.approverRole ?? (actor.role as UserRole | undefined),
    });
    if (!order) {
      return { status: 409, headers: JSON_HEADERS, body: { error: 'Purchase order cannot be rejected' } };
    }

    await dependencies.createAuditLog({
      entityType: 'purchase_order',
      entityId: purchaseOrderId,
      action: 'rejected',
      actorUserId: actor.userId,
      actorPractitionerId: actor.practitionerId,
      metadata: { rejectionReason: validation.value.rejectionReason },
    });

    return { status: 200, headers: JSON_HEADERS, body: { data: toPurchaseOrderDto(order) } };
  } catch (error) {
    return mapError(error);
  }
}

export async function handleListStockMovements(
  request: HttpRequest,
  dependencies: Dependencies
): Promise<HttpResponse> {
  if (!dependencies.listStockMovements) {
    return mapError(new Error('Stock movement list dependency is not configured'));
  }

  const clinicId = request.query?.clinicId?.trim();
  if (!clinicId) return validationError('clinicId is required query parameter');
  const inventoryItemId = readOptionalQueryString(request, 'inventoryItemId');
  if (!inventoryItemId.ok) return validationError(inventoryItemId.error);
  const limit = readOptionalLimitQuery(request);
  if (!limit.ok) return validationError(limit.error);
  const offset = readOptionalOffsetQuery(request);
  if (!offset.ok) return validationError(offset.error);

  const movements = await dependencies.listStockMovements({
    clinicId,
    inventoryItemId: inventoryItemId.value,
    limit: limit.value,
    offset: offset.value,
  });

  return {
    status: 200,
    headers: JSON_HEADERS,
    body: { data: toStockMovementDtos(movements.rows), meta: movements.meta },
  };
}

export async function handleAssessPrescriptionSafety(
  request: HttpRequest,
  dependencies: Dependencies
): Promise<HttpResponse> {
  if (!dependencies.assessPrescriptionSafety) {
    return mapError(new Error('Prescription safety dependency is not configured'));
  }

  const validation = validateAssessPrescriptionSafetyBody(request.body);
  if (!validation.ok) return validationError(validation.error);

  const assessment = await dependencies.assessPrescriptionSafety(validation.value);

  return {
    status: 200,
    headers: JSON_HEADERS,
    body: { data: assessment },
  };
}

export async function handleListDrugInteractionRules(
  request: HttpRequest,
  dependencies: Dependencies
): Promise<HttpResponse> {
  if (!dependencies.listDrugInteractionRules) {
    return mapError(new Error('Drug interaction rule list dependency is not configured'));
  }

  const clinicId = request.query?.clinicId?.trim();
  if (!clinicId) {
    return validationError('clinicId is required query parameter');
  }

  const active = readOptionalEnumQuery(request, 'active', ['active', 'inactive', 'all']);
  if (!active.ok) return validationError(active.error);

  const limit = readOptionalLimitQuery(request);
  if (!limit.ok) return validationError(limit.error);

  const offset = readOptionalOffsetQuery(request);
  if (!offset.ok) return validationError(offset.error);

  const rules = await dependencies.listDrugInteractionRules({
    clinicId,
    active: active.value,
    limit: limit.value,
    offset: offset.value,
  });

  return {
    status: 200,
    headers: JSON_HEADERS,
    body: { data: toDrugInteractionRuleDtos(rules.rows), meta: rules.meta },
  };
}

export async function handleCreateDrugInteractionRule(
  request: HttpRequest,
  dependencies: Dependencies
): Promise<HttpResponse> {
  if (!dependencies.createDrugInteractionRule) {
    return mapError(new Error('Drug interaction rule create dependency is not configured'));
  }

  const validation = validateCreateDrugInteractionRuleBody(request.body);
  if (!validation.ok) return validationError(validation.error);

  const rule = await dependencies.createDrugInteractionRule(validation.value);
  const actor = getActorContext(request);
  await dependencies.createAuditLog({
    entityType: 'drug_interaction_rule',
    entityId: (rule as { id: string }).id,
    action: 'created',
    actorUserId: actor.userId,
    actorPractitionerId: actor.practitionerId,
    metadata: { severity: validation.value.severity ?? 'warning' },
  });

  return { status: 201, headers: JSON_HEADERS, body: { data: toDrugInteractionRuleDto(rule) } };
}

export async function handleUpdateDrugInteractionRule(
  request: HttpRequest,
  dependencies: Dependencies,
  interactionRuleId: string
): Promise<HttpResponse> {
  if (!dependencies.updateDrugInteractionRule) {
    return mapError(new Error('Drug interaction rule update dependency is not configured'));
  }

  const validation = validateUpdateDrugInteractionRuleBody(request.body, interactionRuleId);
  if (!validation.ok) return validationError(validation.error);

  const rule = await dependencies.updateDrugInteractionRule(validation.value);
  if (!rule) {
    return { status: 404, headers: JSON_HEADERS, body: { error: 'Drug interaction rule not found' } };
  }

  const actor = getActorContext(request);
  await dependencies.createAuditLog({
    entityType: 'drug_interaction_rule',
    entityId: interactionRuleId,
    action: 'updated',
    actorUserId: actor.userId,
    actorPractitionerId: actor.practitionerId,
    metadata: { fields: Object.keys(request.body as Record<string, unknown>) },
  });

  return { status: 200, headers: JSON_HEADERS, body: { data: toDrugInteractionRuleDto(rule) } };
}

export async function handleListPrescriptionsByEncounter(
  request: HttpRequest,
  dependencies: Dependencies,
  encounterId: string
): Promise<HttpResponse> {
  const clinicalNoteId = readOptionalQueryString(request, 'clinicalNoteId');
  if (!clinicalNoteId.ok) return validationError(clinicalNoteId.error);

  const status = readOptionalEnumQuery(request, 'status', [
    'active',
    'completed',
    'cancelled',
  ]);
  if (!status.ok) return validationError(status.error);

  const limit = readOptionalLimitQuery(request);
  if (!limit.ok) return validationError(limit.error);

  const offset = readOptionalOffsetQuery(request);
  if (!offset.ok) return validationError(offset.error);

  const prescriptions = await dependencies.listPrescriptionsByEncounter({
    encounterId,
    clinicalNoteId: clinicalNoteId.value,
    status: status.value,
    limit: limit.value,
    offset: offset.value,
  });
  return {
    status: 200,
    headers: JSON_HEADERS,
    body: { data: toPrescriptionDtos(prescriptions.rows), meta: prescriptions.meta },
  };
}

export async function handleListInvoices(
  request: HttpRequest,
  dependencies: Dependencies
): Promise<HttpResponse> {
  if (!dependencies.listInvoices) {
    return mapError(new Error('Invoice list dependency is not configured'));
  }

  const clinicId = readOptionalQueryString(request, 'clinicId');
  if (!clinicId.ok) return validationError(clinicId.error);
  if (!clinicId.value) return validationError('clinicId is required query parameter');

  const patientId = readOptionalQueryString(request, 'patientId');
  if (!patientId.ok) return validationError(patientId.error);

  const status = readOptionalEnumQuery(request, 'status', [
    'draft',
    'issued',
    'partially_paid',
    'paid',
    'voided',
  ]);
  if (!status.ok) return validationError(status.error);

  const limit = readOptionalLimitQuery(request);
  if (!limit.ok) return validationError(limit.error);
  const offset = readOptionalOffsetQuery(request);
  if (!offset.ok) return validationError(offset.error);

  const invoices = await dependencies.listInvoices({
    clinicId: clinicId.value,
    patientId: patientId.value,
    status: status.value,
    limit: limit.value,
    offset: offset.value,
  });

  return {
    status: 200,
    headers: JSON_HEADERS,
    body: { data: toInvoiceDtos(invoices.rows), meta: invoices.meta },
  };
}

export async function handleGetInvoice(
  dependencies: Dependencies,
  invoiceId: string
): Promise<HttpResponse> {
  if (!dependencies.getInvoiceById) {
    return mapError(new Error('Invoice get dependency is not configured'));
  }

  const invoice = await dependencies.getInvoiceById({ invoiceId });
  if (!invoice) {
    return { status: 404, headers: JSON_HEADERS, body: { error: 'Invoice not found' } };
  }

  return { status: 200, headers: JSON_HEADERS, body: { data: toInvoiceDto(invoice) } };
}

export async function handleCreateInvoice(
  request: HttpRequest,
  dependencies: Dependencies
): Promise<HttpResponse> {
  if (!dependencies.createInvoice) {
    return mapError(new Error('Invoice create dependency is not configured'));
  }

  const validation = validateCreateInvoiceBody(request.body);
  if (!validation.ok) return validationError(validation.error);

  const invoice = await dependencies.createInvoice(validation.value);
  const actor = getActorContext(request);
  await dependencies.createAuditLog({
    entityType: 'invoice',
    entityId: (invoice as { id: string }).id,
    action: 'created',
    actorUserId: actor.userId,
    actorPractitionerId: actor.practitionerId,
    metadata: {
      clinicId: validation.value.clinicId,
      patientId: validation.value.patientId,
      invoiceNumber: validation.value.invoiceNumber,
      lineItemCount: validation.value.lineItems.length,
    },
  });

  return { status: 201, headers: JSON_HEADERS, body: { data: toInvoiceDto(invoice) } };
}

export async function handleCreateInvoiceFromEncounter(
  request: HttpRequest,
  dependencies: Dependencies
): Promise<HttpResponse> {
  if (!dependencies.createInvoiceFromEncounter) {
    return mapError(new Error('Invoice charge capture dependency is not configured'));
  }
  const validation = validateCreateInvoiceFromEncounterBody(request.body);
  if (!validation.ok) return validationError(validation.error);
  const invoice = await dependencies.createInvoiceFromEncounter(validation.value);
  if (!invoice) {
    return { status: 404, headers: JSON_HEADERS, body: { error: 'Encounter not found' } };
  }
  const actor = getActorContext(request);
  await dependencies.createAuditLog({
    entityType: 'invoice',
    entityId: (invoice as { id: string }).id,
    action: 'charge_captured',
    actorUserId: actor.userId,
    actorPractitionerId: actor.practitionerId,
    metadata: {
      clinicId: validation.value.clinicId,
      patientId: validation.value.patientId,
      encounterId: validation.value.encounterId,
    },
  });
  return { status: 201, headers: JSON_HEADERS, body: { data: toInvoiceDto(invoice) } };
}

export async function handleUpdateInvoice(
  request: HttpRequest,
  dependencies: Dependencies,
  invoiceId: string
): Promise<HttpResponse> {
  if (!dependencies.updateInvoice) {
    return mapError(new Error('Invoice update dependency is not configured'));
  }
  const validation = validateUpdateInvoiceBody(request.body, invoiceId);
  if (!validation.ok) return validationError(validation.error);
  const invoice = await dependencies.updateInvoice(validation.value);
  if (!invoice) {
    return { status: 404, headers: JSON_HEADERS, body: { error: 'Invoice not found or not editable' } };
  }
  const actor = getActorContext(request);
  await dependencies.createAuditLog({
    entityType: 'invoice',
    entityId: invoiceId,
    action: 'updated',
    actorUserId: actor.userId,
    actorPractitionerId: actor.practitionerId,
    metadata: {
      lineItemCount: validation.value.lineItems?.length,
      receiptNumber: validation.value.receiptNumber,
      taxInvoiceNumber: validation.value.taxInvoiceNumber,
      status: validation.value.status,
    },
  });
  return { status: 200, headers: JSON_HEADERS, body: { data: toInvoiceDto(invoice) } };
}

export async function handleRecordInvoicePayment(
  request: HttpRequest,
  dependencies: Dependencies,
  invoiceId: string
): Promise<HttpResponse> {
  if (!dependencies.recordInvoicePayment) {
    return mapError(new Error('Invoice payment dependency is not configured'));
  }

  const validation = validateRecordInvoicePaymentBody(request.body, invoiceId);
  if (!validation.ok) return validationError(validation.error);

  const invoice = await dependencies.recordInvoicePayment(validation.value);
  if (!invoice) {
    return { status: 404, headers: JSON_HEADERS, body: { error: 'Invoice not found' } };
  }

  const actor = getActorContext(request);
  await dependencies.createAuditLog({
    entityType: 'invoice',
    entityId: invoiceId,
    action: 'payment_recorded',
    actorUserId: actor.userId,
    actorPractitionerId: actor.practitionerId,
    metadata: {
      paymentNumber: validation.value.paymentNumber,
      method: validation.value.method,
      amount: validation.value.amount,
    },
  });

  return { status: 200, headers: JSON_HEADERS, body: { data: toInvoiceDto(invoice) } };
}

export async function handleRecordInvoiceRefund(
  request: HttpRequest,
  dependencies: Dependencies,
  invoiceId: string
): Promise<HttpResponse> {
  if (!dependencies.recordInvoiceRefund) {
    return mapError(new Error('Invoice refund dependency is not configured'));
  }

  const validation = validateRecordInvoiceRefundBody(request.body, invoiceId);
  if (!validation.ok) return validationError(validation.error);

  const invoice = await dependencies.recordInvoiceRefund(validation.value);
  if (!invoice) {
    return { status: 404, headers: JSON_HEADERS, body: { error: 'Invoice not found' } };
  }

  const actor = getActorContext(request);
  await dependencies.createAuditLog({
    entityType: 'invoice',
    entityId: invoiceId,
    action: 'refund_recorded',
    actorUserId: actor.userId,
    actorPractitionerId: actor.practitionerId,
    metadata: {
      refundNumber: validation.value.refundNumber,
      method: validation.value.method,
      amount: validation.value.amount,
    },
  });

  return { status: 200, headers: JSON_HEADERS, body: { data: toInvoiceDto(invoice) } };
}

export async function handleVoidInvoice(
  request: HttpRequest,
  dependencies: Dependencies,
  invoiceId: string
): Promise<HttpResponse> {
  if (!dependencies.voidInvoice) {
    return mapError(new Error('Invoice void dependency is not configured'));
  }

  const validation = validateVoidInvoiceBody(request.body, invoiceId);
  if (!validation.ok) return validationError(validation.error);

  const invoice = await dependencies.voidInvoice(validation.value);
  if (!invoice) {
    return { status: 404, headers: JSON_HEADERS, body: { error: 'Invoice not found' } };
  }

  const actor = getActorContext(request);
  await dependencies.createAuditLog({
    entityType: 'invoice',
    entityId: invoiceId,
    action: 'voided',
    actorUserId: actor.userId,
    actorPractitionerId: actor.practitionerId,
    metadata: {
      voidReason: validation.value.voidReason,
    },
  });

  return { status: 200, headers: JSON_HEADERS, body: { data: toInvoiceDto(invoice) } };
}

export async function handleListChargeTemplates(
  request: HttpRequest,
  dependencies: Dependencies
): Promise<HttpResponse> {
  if (!dependencies.listChargeTemplates) {
    return mapError(new Error('Charge template list dependency is not configured'));
  }

  const clinicId = readOptionalQueryString(request, 'clinicId');
  if (!clinicId.ok) return validationError(clinicId.error);
  if (!clinicId.value) return validationError('clinicId is required query parameter');

  const active = readOptionalEnumQuery(request, 'active', ['active', 'inactive', 'all']);
  if (!active.ok) return validationError(active.error);
  const limit = readOptionalLimitQuery(request);
  if (!limit.ok) return validationError(limit.error);
  const offset = readOptionalOffsetQuery(request);
  if (!offset.ok) return validationError(offset.error);

  const templates = await dependencies.listChargeTemplates({
    clinicId: clinicId.value,
    active: active.value,
    limit: limit.value,
    offset: offset.value,
  });

  return {
    status: 200,
    headers: JSON_HEADERS,
    body: { data: toChargeTemplateDtos(templates.rows), meta: templates.meta },
  };
}

export async function handleCreateChargeTemplate(
  request: HttpRequest,
  dependencies: Dependencies
): Promise<HttpResponse> {
  if (!dependencies.createChargeTemplate) {
    return mapError(new Error('Charge template create dependency is not configured'));
  }

  const validation = validateCreateChargeTemplateBody(request.body);
  if (!validation.ok) return validationError(validation.error);

  const template = await dependencies.createChargeTemplate(validation.value);
  const actor = getActorContext(request);
  await dependencies.createAuditLog({
    entityType: 'charge_template',
    entityId: (template as { id: string }).id,
    action: 'created',
    actorUserId: actor.userId,
    actorPractitionerId: actor.practitionerId,
    metadata: { clinicId: validation.value.clinicId, code: validation.value.code },
  });

  return { status: 201, headers: JSON_HEADERS, body: { data: toChargeTemplateDto(template) } };
}

export async function handleUpdateChargeTemplate(
  request: HttpRequest,
  dependencies: Dependencies,
  chargeTemplateId: string
): Promise<HttpResponse> {
  if (!dependencies.updateChargeTemplate) {
    return mapError(new Error('Charge template update dependency is not configured'));
  }

  const validation = validateUpdateChargeTemplateBody(request.body, chargeTemplateId);
  if (!validation.ok) return validationError(validation.error);

  const template = await dependencies.updateChargeTemplate(validation.value);
  if (!template) {
    return { status: 404, headers: JSON_HEADERS, body: { error: 'Charge template not found' } };
  }

  const actor = getActorContext(request);
  await dependencies.createAuditLog({
    entityType: 'charge_template',
    entityId: chargeTemplateId,
    action: 'updated',
    actorUserId: actor.userId,
    actorPractitionerId: actor.practitionerId,
    metadata: { isActive: validation.value.isActive },
  });

  return { status: 200, headers: JSON_HEADERS, body: { data: toChargeTemplateDto(template) } };
}

export async function handleListInsuranceClaims(
  request: HttpRequest,
  dependencies: Dependencies
): Promise<HttpResponse> {
  if (!dependencies.listInsuranceClaims) {
    return mapError(new Error('Insurance claim list dependency is not configured'));
  }
  const clinicId = readOptionalQueryString(request, 'clinicId');
  if (!clinicId.ok) return validationError(clinicId.error);
  if (!clinicId.value) return validationError('clinicId is required query parameter');
  const invoiceId = readOptionalQueryString(request, 'invoiceId');
  if (!invoiceId.ok) return validationError(invoiceId.error);
  const status = readOptionalEnumQuery(request, 'status', [
    'draft',
    'submitted',
    'accepted',
    'rejected',
    'paid',
    'cancelled',
  ]);
  if (!status.ok) return validationError(status.error);
  const limit = readOptionalLimitQuery(request);
  if (!limit.ok) return validationError(limit.error);
  const offset = readOptionalOffsetQuery(request);
  if (!offset.ok) return validationError(offset.error);
  const claims = await dependencies.listInsuranceClaims({
    clinicId: clinicId.value,
    invoiceId: invoiceId.value,
    status: status.value,
    limit: limit.value,
    offset: offset.value,
  });
  return {
    status: 200,
    headers: JSON_HEADERS,
    body: { data: toInsuranceClaimDtos(claims.rows), meta: claims.meta },
  };
}

export async function handleCreateInsuranceClaim(
  request: HttpRequest,
  dependencies: Dependencies
): Promise<HttpResponse> {
  if (!dependencies.createInsuranceClaim) {
    return mapError(new Error('Insurance claim create dependency is not configured'));
  }
  const validation = validateCreateInsuranceClaimBody(request.body);
  if (!validation.ok) return validationError(validation.error);
  const claim = await dependencies.createInsuranceClaim(validation.value);
  const actor = getActorContext(request);
  await dependencies.createAuditLog({
    entityType: 'insurance_claim',
    entityId: (claim as { id: string }).id,
    action: 'created',
    actorUserId: actor.userId,
    actorPractitionerId: actor.practitionerId,
    metadata: { invoiceId: validation.value.invoiceId, claimNumber: validation.value.claimNumber },
  });
  return { status: 201, headers: JSON_HEADERS, body: { data: toInsuranceClaimDto(claim) } };
}

export async function handleUpdateInsuranceClaim(
  request: HttpRequest,
  dependencies: Dependencies,
  insuranceClaimId: string
): Promise<HttpResponse> {
  if (!dependencies.updateInsuranceClaim) {
    return mapError(new Error('Insurance claim update dependency is not configured'));
  }
  const validation = validateUpdateInsuranceClaimBody(request.body, insuranceClaimId);
  if (!validation.ok) return validationError(validation.error);
  const claim = await dependencies.updateInsuranceClaim(validation.value);
  if (!claim) {
    return { status: 404, headers: JSON_HEADERS, body: { error: 'Insurance claim not found' } };
  }
  const actor = getActorContext(request);
  await dependencies.createAuditLog({
    entityType: 'insurance_claim',
    entityId: insuranceClaimId,
    action: 'updated',
    actorUserId: actor.userId,
    actorPractitionerId: actor.practitionerId,
    metadata: { status: validation.value.status },
  });
  return { status: 200, headers: JSON_HEADERS, body: { data: toInsuranceClaimDto(claim) } };
}

export async function handleListBillingNumberSequences(
  request: HttpRequest,
  dependencies: Dependencies
): Promise<HttpResponse> {
  if (!dependencies.listBillingNumberSequences) {
    return mapError(new Error('Billing number sequence list dependency is not configured'));
  }

  const clinicId = request.query?.clinicId?.trim();
  if (!clinicId) return validationError('clinicId is required query parameter');

  const sequences = await dependencies.listBillingNumberSequences({ clinicId });
  return { status: 200, headers: JSON_HEADERS, body: { data: toBillingNumberSequenceDtos(sequences) } };
}

export async function handleCreateBillingNumberSequence(
  request: HttpRequest,
  dependencies: Dependencies
): Promise<HttpResponse> {
  if (!dependencies.createBillingNumberSequence) {
    return mapError(new Error('Billing number sequence create dependency is not configured'));
  }

  const validation = validateCreateBillingNumberSequenceBody(request.body);
  if (!validation.ok) return validationError(validation.error);

  try {
    const sequence = await dependencies.createBillingNumberSequence(validation.value);
    const actor = getActorContext(request);
    await dependencies.createAuditLog({
      entityType: 'billing_number_sequence',
      entityId: (sequence as { id: string }).id,
      action: 'created',
      actorUserId: actor.userId,
      actorPractitionerId: actor.practitionerId,
      metadata: { documentType: validation.value.documentType },
    });

    return { status: 201, headers: JSON_HEADERS, body: { data: toBillingNumberSequenceDto(sequence) } };
  } catch (error) {
    return mapError(error);
  }
}

export async function handleIssueBillingNumber(
  request: HttpRequest,
  dependencies: Dependencies
): Promise<HttpResponse> {
  if (!dependencies.issueBillingNumber) {
    return mapError(new Error('Billing number issue dependency is not configured'));
  }

  const validation = validateIssueBillingNumberBody(request.body);
  if (!validation.ok) return validationError(validation.error);

  const issued = await dependencies.issueBillingNumber(validation.value);
  if (!issued) {
    return { status: 404, headers: JSON_HEADERS, body: { error: 'Active billing number sequence not found' } };
  }

  const actor = getActorContext(request);
  await dependencies.createAuditLog({
    entityType: 'billing_number_sequence',
    entityId: validation.value.clinicId,
    action: 'issued',
    actorUserId: actor.userId,
    actorPractitionerId: actor.practitionerId,
    metadata: { clinicId: validation.value.clinicId, documentNumber: issued.documentNumber },
  });

  return { status: 200, headers: JSON_HEADERS, body: { data: issued } };
}

export async function handleListCashierReconciliations(
  request: HttpRequest,
  dependencies: Dependencies
): Promise<HttpResponse> {
  if (!dependencies.listCashierReconciliations) {
    return mapError(new Error('Cashier reconciliation list dependency is not configured'));
  }

  const clinicId = request.query?.clinicId?.trim();
  if (!clinicId) return validationError('clinicId is required query parameter');
  const status = readOptionalEnumQuery<CashierReconciliationStatus>(
    request,
    'status',
    ['open', 'closed', 'cancelled']
  );
  if (!status.ok) return validationError(status.error);
  const limit = readOptionalLimitQuery(request);
  if (!limit.ok) return validationError(limit.error);
  const offset = readOptionalOffsetQuery(request);
  if (!offset.ok) return validationError(offset.error);

  const reconciliations = await dependencies.listCashierReconciliations({
    clinicId,
    status: status.value,
    limit: limit.value,
    offset: offset.value,
  });

  return {
    status: 200,
    headers: JSON_HEADERS,
    body: { data: toCashierReconciliationDtos(reconciliations.rows), meta: reconciliations.meta },
  };
}

export async function handleCreateCashierReconciliation(
  request: HttpRequest,
  dependencies: Dependencies
): Promise<HttpResponse> {
  if (!dependencies.createCashierReconciliation) {
    return mapError(new Error('Cashier reconciliation create dependency is not configured'));
  }

  const validation = validateCreateCashierReconciliationBody(request.body);
  if (!validation.ok) return validationError(validation.error);

  try {
    const reconciliation = await dependencies.createCashierReconciliation(validation.value);
    const actor = getActorContext(request);
    await dependencies.createAuditLog({
      entityType: 'cashier_reconciliation',
      entityId: (reconciliation as { id: string }).id,
      action: 'created',
      actorUserId: actor.userId,
      actorPractitionerId: actor.practitionerId,
      metadata: { reconciliationDate: validation.value.reconciliationDate },
    });

    return { status: 201, headers: JSON_HEADERS, body: { data: toCashierReconciliationDto(reconciliation) } };
  } catch (error) {
    return mapError(error);
  }
}

export async function handleCloseCashierReconciliation(
  request: HttpRequest,
  dependencies: Dependencies,
  reconciliationId: string
): Promise<HttpResponse> {
  if (!dependencies.closeCashierReconciliation) {
    return mapError(new Error('Cashier reconciliation close dependency is not configured'));
  }

  const validation = validateCloseCashierReconciliationBody(request.body, reconciliationId);
  if (!validation.ok) return validationError(validation.error);

  const reconciliation = await dependencies.closeCashierReconciliation(validation.value);
  if (!reconciliation) {
    return { status: 404, headers: JSON_HEADERS, body: { error: 'Open cashier reconciliation not found' } };
  }

  const actor = getActorContext(request);
  await dependencies.createAuditLog({
    entityType: 'cashier_reconciliation',
    entityId: reconciliationId,
    action: 'closed',
    actorUserId: actor.userId,
    actorPractitionerId: actor.practitionerId,
    metadata: { countedCashAmount: validation.value.countedCashAmount },
  });

  return { status: 200, headers: JSON_HEADERS, body: { data: toCashierReconciliationDto(reconciliation) } };
}

export async function handleListDiagnosesByEncounter(
  request: HttpRequest,
  dependencies: Dependencies,
  encounterId: string
): Promise<HttpResponse> {
  if (!dependencies.listDiagnosesByEncounter) {
    return mapError(new Error('Diagnosis list dependency is not configured'));
  }

  const clinicalNoteId = readOptionalQueryString(request, 'clinicalNoteId');
  if (!clinicalNoteId.ok) return validationError(clinicalNoteId.error);

  const status = readOptionalEnumQuery(request, 'status', [
    'active',
    'resolved',
    'entered_in_error',
  ]);
  if (!status.ok) return validationError(status.error);

  const limit = readOptionalLimitQuery(request);
  if (!limit.ok) return validationError(limit.error);

  const offset = readOptionalOffsetQuery(request);
  if (!offset.ok) return validationError(offset.error);

  const diagnoses = await dependencies.listDiagnosesByEncounter({
    encounterId,
    clinicalNoteId: clinicalNoteId.value,
    status: status.value,
    limit: limit.value,
    offset: offset.value,
  });
  return {
    status: 200,
    headers: JSON_HEADERS,
    body: { data: toDiagnosisDtos(diagnoses.rows), meta: diagnoses.meta },
  };
}

export async function handleListVitalSignsByEncounter(
  request: HttpRequest,
  dependencies: Dependencies,
  encounterId: string
): Promise<HttpResponse> {
  if (!dependencies.listVitalSignsByEncounter) {
    return mapError(new Error('Vital sign list dependency is not configured'));
  }

  const clinicalNoteId = readOptionalQueryString(request, 'clinicalNoteId');
  if (!clinicalNoteId.ok) return validationError(clinicalNoteId.error);

  const limit = readOptionalLimitQuery(request);
  if (!limit.ok) return validationError(limit.error);

  const offset = readOptionalOffsetQuery(request);
  if (!offset.ok) return validationError(offset.error);

  const vitalSigns = await dependencies.listVitalSignsByEncounter({
    encounterId,
    clinicalNoteId: clinicalNoteId.value,
    limit: limit.value,
    offset: offset.value,
  });
  return {
    status: 200,
    headers: JSON_HEADERS,
    body: { data: toVitalSignDtos(vitalSigns.rows), meta: vitalSigns.meta },
  };
}

export async function handleCreatePrescription(
  request: HttpRequest,
  dependencies: Dependencies
): Promise<HttpResponse> {
  const validation = validateCreatePrescriptionBody(request.body);
  if (!validation.ok) return validationError(validation.error);

  const actor = getActorContext(request);
  let safetyWarnings: unknown[] = [];
  let assessedDrugCatalogId = validation.value.drugCatalogId ?? null;

  if (dependencies.assessPrescriptionSafety && dependencies.getEncounterById) {
    const encounter = await dependencies.getEncounterById({
      encounterId: validation.value.encounterId,
    });
    const patientId = readPatientId(encounter);

    if (patientId) {
      const assessment = await dependencies.assessPrescriptionSafety({
        patientId,
        medicationName: validation.value.medicationName,
        rxnormCode: validation.value.rxnormCode,
        drugCatalogId: validation.value.drugCatalogId,
      });
      safetyWarnings = assessment.warnings;
      assessedDrugCatalogId = assessment.drugCatalogId ?? assessedDrugCatalogId;
    }
  }

  const overrideReason = readOverrideReason(validation.value.safetyOverrideReason);
  if (hasSafetyWarnings(safetyWarnings) && !overrideReason) {
    return safetyOverrideError(safetyWarnings);
  }

  const overrideFields = overrideReason
    ? {
        safetyOverrideReason: overrideReason,
        safetyOverriddenAt: new Date().toISOString(),
        safetyOverriddenByUserId: actor.userId ?? null,
        safetyOverriddenByPractitionerId: actor.practitionerId ?? null,
      }
    : {};

  const prescription = await dependencies.createPrescription({
    ...validation.value,
    prescribedByPractitionerId:
      validation.value.prescribedByPractitionerId ?? actor.practitionerId ?? null,
    drugCatalogId: assessedDrugCatalogId,
    safetyWarnings,
    ...overrideFields,
  });

  await dependencies.createAuditLog({
    entityType: 'prescription',
    entityId: (prescription as { id: string }).id,
    action: 'created',
    actorUserId: actor.userId,
    actorPractitionerId: actor.practitionerId,
    metadata: {
      medicationName: validation.value.medicationName,
      safetyWarningCount: safetyWarnings.length,
    },
  });

  return { status: 201, headers: JSON_HEADERS, body: { data: toPrescriptionDto(prescription) } };
}

export async function handleCreateDiagnosis(
  request: HttpRequest,
  dependencies: Dependencies
): Promise<HttpResponse> {
  if (!dependencies.createDiagnosis) {
    return mapError(new Error('Diagnosis create dependency is not configured'));
  }

  const validation = validateCreateDiagnosisBody(request.body);
  if (!validation.ok) return validationError(validation.error);

  const diagnosis = await dependencies.createDiagnosis(validation.value);
  const actor = getActorContext(request);

  await dependencies.createAuditLog({
    entityType: 'diagnosis',
    entityId: (diagnosis as { id: string }).id,
    action: 'created',
    actorUserId: actor.userId,
    actorPractitionerId: actor.practitionerId,
    metadata: { diagnosisName: validation.value.diagnosisName },
  });

  return { status: 201, headers: JSON_HEADERS, body: { data: toDiagnosisDto(diagnosis) } };
}

export async function handleCreateVitalSign(
  request: HttpRequest,
  dependencies: Dependencies
): Promise<HttpResponse> {
  if (!dependencies.createVitalSign) {
    return mapError(new Error('Vital sign create dependency is not configured'));
  }

  const validation = validateCreateVitalSignBody(request.body);
  if (!validation.ok) return validationError(validation.error);

  const actor = getActorContext(request);
  const vitalSign = await dependencies.createVitalSign({
    ...validation.value,
    measuredByPractitionerId:
      validation.value.measuredByPractitionerId ?? actor.practitionerId ?? null,
  });

  await dependencies.createAuditLog({
    entityType: 'vital_sign',
    entityId: (vitalSign as { id: string }).id,
    action: 'created',
    actorUserId: actor.userId,
    actorPractitionerId: actor.practitionerId,
    metadata: { encounterId: validation.value.encounterId },
  });

  return { status: 201, headers: JSON_HEADERS, body: { data: toVitalSignDto(vitalSign) } };
}

export async function handleUpdatePrescription(
  request: HttpRequest,
  dependencies: Dependencies,
  prescriptionId: string
): Promise<HttpResponse> {
  const validation = validateUpdatePrescriptionBody(request.body, prescriptionId);
  if (!validation.ok) return validationError(validation.error);

  let safetyWarnings: unknown[] | undefined;
  let assessedDrugCatalogId = validation.value.drugCatalogId;

  if (
    dependencies.assessPrescriptionSafety &&
    dependencies.getPrescriptionById &&
    dependencies.getEncounterById &&
    (Object.hasOwn(validation.value, 'medicationName') ||
      Object.hasOwn(validation.value, 'rxnormCode') ||
      Object.hasOwn(validation.value, 'drugCatalogId'))
  ) {
    const existing = await dependencies.getPrescriptionById({ prescriptionId });
    const encounterId = readEncounterId(existing);

    if (existing && encounterId) {
      const encounter = await dependencies.getEncounterById({ encounterId });
      const patientId = readPatientId(encounter);

      if (patientId) {
        const existingRow = existing as Record<string, unknown>;
        const medicationName =
          validation.value.medicationName ??
          (typeof existingRow.medication_name === 'string' ? existingRow.medication_name : '');
        const rxnormCode = Object.hasOwn(validation.value, 'rxnormCode')
          ? validation.value.rxnormCode
          : typeof existingRow.rxnorm_code === 'string'
            ? existingRow.rxnorm_code
            : null;
        const drugCatalogId = Object.hasOwn(validation.value, 'drugCatalogId')
          ? validation.value.drugCatalogId
          : typeof existingRow.drug_catalog_id === 'string'
            ? existingRow.drug_catalog_id
            : null;
        const assessment = await dependencies.assessPrescriptionSafety({
          patientId,
          medicationName,
          rxnormCode,
          drugCatalogId,
        });
        safetyWarnings = assessment.warnings;
        assessedDrugCatalogId = assessment.drugCatalogId ?? drugCatalogId;
      }
    }
  }

  const overrideReason = readOverrideReason(validation.value.safetyOverrideReason);
  if (safetyWarnings !== undefined && hasSafetyWarnings(safetyWarnings) && !overrideReason) {
    return safetyOverrideError(safetyWarnings);
  }

  const actor = getActorContext(request);
  const overrideFields =
    overrideReason && safetyWarnings !== undefined && hasSafetyWarnings(safetyWarnings)
      ? {
          safetyOverrideReason: overrideReason,
          safetyOverriddenAt: new Date().toISOString(),
          safetyOverriddenByUserId: actor.userId ?? null,
          safetyOverriddenByPractitionerId: actor.practitionerId ?? null,
        }
      : Object.hasOwn(validation.value, 'safetyOverrideReason')
        ? { safetyOverrideReason: overrideReason }
        : {};

  const prescription = await dependencies.updatePrescription({
    ...validation.value,
    ...(assessedDrugCatalogId !== undefined ? { drugCatalogId: assessedDrugCatalogId } : {}),
    ...(safetyWarnings !== undefined ? { safetyWarnings } : {}),
    ...overrideFields,
  });

  if (!prescription) {
    return { status: 404, headers: JSON_HEADERS, body: { error: 'Prescription not found' } };
  }

  await dependencies.createAuditLog({
    entityType: 'prescription',
    entityId: prescriptionId,
    action: 'updated',
    actorUserId: actor.userId,
    actorPractitionerId: actor.practitionerId,
    metadata: { fields: Object.keys(request.body as Record<string, unknown>) },
  });

  return { status: 200, headers: JSON_HEADERS, body: { data: toPrescriptionDto(prescription) } };
}

export async function handleListMedicationDispenses(
  request: HttpRequest,
  dependencies: Dependencies,
  prescriptionId?: string
): Promise<HttpResponse> {
  if (!dependencies.listMedicationDispenses) {
    return mapError(new Error('Medication dispense list dependency is not configured'));
  }

  const clinicId = readOptionalQueryString(request, 'clinicId');
  if (!clinicId.ok) return validationError(clinicId.error);
  if (!prescriptionId && !clinicId.value) {
    return validationError('clinicId is required query parameter');
  }
  const limit = readOptionalLimitQuery(request);
  if (!limit.ok) return validationError(limit.error);
  const offset = readOptionalOffsetQuery(request);
  if (!offset.ok) return validationError(offset.error);

  const dispenses = await dependencies.listMedicationDispenses({
    clinicId: clinicId.value,
    prescriptionId,
    limit: limit.value,
    offset: offset.value,
  });

  return {
    status: 200,
    headers: JSON_HEADERS,
    body: { data: toMedicationDispenseDtos(dispenses.rows), meta: dispenses.meta },
  };
}

export async function handleDispensePrescription(
  request: HttpRequest,
  dependencies: Dependencies,
  prescriptionId: string
): Promise<HttpResponse> {
  if (!dependencies.dispensePrescription) {
    return mapError(new Error('Medication dispense dependency is not configured'));
  }

  const validation = validateDispensePrescriptionBody(request.body, prescriptionId);
  if (!validation.ok) return validationError(validation.error);

  try {
    const dispense = await dependencies.dispensePrescription(validation.value);
    if (!dispense) {
      return { status: 404, headers: JSON_HEADERS, body: { error: 'Prescription or inventory item not found' } };
    }

    const actor = getActorContext(request);
    await dependencies.createAuditLog({
      entityType: 'medication_dispense',
      entityId: (dispense as { id: string }).id,
      action: 'dispensed',
      actorUserId: actor.userId,
      actorPractitionerId: actor.practitionerId,
      metadata: {
        prescriptionId,
        inventoryItemId: validation.value.inventoryItemId,
        quantity: validation.value.quantity,
      },
    });

    return { status: 201, headers: JSON_HEADERS, body: { data: toMedicationDispenseDto(dispense) } };
  } catch (error) {
    return mapError(error);
  }
}

export async function handleGetSoapNote(
  _request: HttpRequest,
  dependencies: Dependencies,
  clinicalNoteId: string
): Promise<HttpResponse> {
  if (!dependencies.getSoapNoteByClinicalNoteId) {
    return mapError(new Error('SOAP note read dependency is not configured'));
  }

  try {
    const soapNote = await dependencies.getSoapNoteByClinicalNoteId({ clinicalNoteId });
    if (!soapNote) {
      return { status: 404, headers: JSON_HEADERS, body: { error: 'SOAP note not found' } };
    }

    return { status: 200, headers: JSON_HEADERS, body: { data: toSoapNoteDto(soapNote) } };
  } catch (error) {
    return mapError(error);
  }
}

export async function handleGetDiagnosis(
  _request: HttpRequest,
  dependencies: Dependencies,
  diagnosisId: string
): Promise<HttpResponse> {
  if (!dependencies.getDiagnosisById) {
    return mapError(new Error('Diagnosis read dependency is not configured'));
  }

  try {
    const diagnosis = await dependencies.getDiagnosisById({ diagnosisId });
    if (!diagnosis) {
      return { status: 404, headers: JSON_HEADERS, body: { error: 'Diagnosis not found' } };
    }

    return { status: 200, headers: JSON_HEADERS, body: { data: toDiagnosisDto(diagnosis) } };
  } catch (error) {
    return mapError(error);
  }
}

export async function handleGetVitalSign(
  _request: HttpRequest,
  dependencies: Dependencies,
  vitalSignId: string
): Promise<HttpResponse> {
  if (!dependencies.getVitalSignById) {
    return mapError(new Error('Vital sign read dependency is not configured'));
  }

  try {
    const vitalSign = await dependencies.getVitalSignById({ vitalSignId });
    if (!vitalSign) {
      return { status: 404, headers: JSON_HEADERS, body: { error: 'Vital sign not found' } };
    }

    return { status: 200, headers: JSON_HEADERS, body: { data: toVitalSignDto(vitalSign) } };
  } catch (error) {
    return mapError(error);
  }
}

export async function handleGetPrescription(
  _request: HttpRequest,
  dependencies: Dependencies,
  prescriptionId: string
): Promise<HttpResponse> {
  if (!dependencies.getPrescriptionById) {
    return mapError(new Error('Prescription read dependency is not configured'));
  }

  try {
    const prescription = await dependencies.getPrescriptionById({ prescriptionId });
    if (!prescription) {
      return { status: 404, headers: JSON_HEADERS, body: { error: 'Prescription not found' } };
    }

    return { status: 200, headers: JSON_HEADERS, body: { data: toPrescriptionDto(prescription) } };
  } catch (error) {
    return mapError(error);
  }
}

export async function handleUpdateSoapNote(
  request: HttpRequest,
  dependencies: Dependencies,
  clinicalNoteId: string
): Promise<HttpResponse> {
  const validation = validateUpdateSoapNoteBody(request.body, clinicalNoteId);
  if (!validation.ok) return validationError(validation.error);

  try {
    const soapNote = await dependencies.updateSoapNote(validation.value);
    if (!soapNote) {
      return { status: 404, headers: JSON_HEADERS, body: { error: 'SOAP note not found' } };
    }
    const actor = getActorContext(request);
    await dependencies.createAuditLog({
      entityType: 'soap_note',
      entityId: clinicalNoteId,
      action: 'updated',
      actorUserId: actor.userId,
      actorPractitionerId: actor.practitionerId,
      metadata: {
        fields: Object.keys(request.body as Record<string, unknown>),
      },
    });
    return { status: 200, headers: JSON_HEADERS, body: { data: toSoapNoteDto(soapNote) } };
  } catch (error) {
    return mapError(error);
  }
}

export async function handleUpdateDiagnosis(
  request: HttpRequest,
  dependencies: Dependencies,
  diagnosisId: string
): Promise<HttpResponse> {
  const validation = validateUpdateDiagnosisBody(request.body, diagnosisId);
  if (!validation.ok) return validationError(validation.error);

  try {
    const diagnosis = await dependencies.updateDiagnosis(validation.value);
    if (!diagnosis) {
      return { status: 404, headers: JSON_HEADERS, body: { error: 'Diagnosis not found' } };
    }
    const actor = getActorContext(request);
    await dependencies.createAuditLog({
      entityType: 'diagnosis',
      entityId: diagnosisId,
      action: 'updated',
      actorUserId: actor.userId,
      actorPractitionerId: actor.practitionerId,
      metadata: {
        fields: Object.keys(request.body as Record<string, unknown>),
      },
    });
    return { status: 200, headers: JSON_HEADERS, body: { data: toDiagnosisDto(diagnosis) } };
  } catch (error) {
    return mapError(error);
  }
}

export async function handleUpdateVitalSign(
  request: HttpRequest,
  dependencies: Dependencies,
  vitalSignId: string
): Promise<HttpResponse> {
  const validation = validateUpdateVitalSignBody(request.body, vitalSignId);
  if (!validation.ok) return validationError(validation.error);

  try {
    const vitalSign = await dependencies.updateVitalSign(validation.value);
    if (!vitalSign) {
      return { status: 404, headers: JSON_HEADERS, body: { error: 'Vital sign not found' } };
    }
    const actor = getActorContext(request);
    await dependencies.createAuditLog({
      entityType: 'vital_sign',
      entityId: vitalSignId,
      action: 'updated',
      actorUserId: actor.userId,
      actorPractitionerId: actor.practitionerId,
      metadata: {
        fields: Object.keys(request.body as Record<string, unknown>),
      },
    });
    return { status: 200, headers: JSON_HEADERS, body: { data: toVitalSignDto(vitalSign) } };
  } catch (error) {
    return mapError(error);
  }
}

export async function handleFinalizeClinicalNote(
  request: HttpRequest,
  dependencies: Dependencies,
  clinicalNoteId: string
): Promise<HttpResponse> {
  const validation = validateFinalizeClinicalNoteBody(request.body, clinicalNoteId);
  if (!validation.ok) return validationError(validation.error);

  try {
    const note = await dependencies.finalizeClinicalNote(validation.value);
    if (!note) {
      return { status: 404, headers: JSON_HEADERS, body: { error: 'Clinical note not found' } };
    }
    const actor = getActorContext(request);
    await dependencies.createAuditLog({
      entityType: 'clinical_note',
      entityId: clinicalNoteId,
      action: 'finalized',
      actorUserId: actor.userId,
      actorPractitionerId: actor.practitionerId,
      metadata: { status: 'final' },
    });
    return { status: 200, headers: JSON_HEADERS, body: { data: note } };
  } catch (error) {
    return mapError(error);
  }
}

export async function handleSignClinicalNote(
  request: HttpRequest,
  dependencies: Dependencies,
  clinicalNoteId: string
): Promise<HttpResponse> {
  const validation = validateSignClinicalNoteBody(request.body, clinicalNoteId);
  if (!validation.ok) return validationError(validation.error);

  try {
    const actor = getActorContext(request);
    const note = await dependencies.signClinicalNote({
      ...validation.value,
      authoredByPractitionerId:
        validation.value.authoredByPractitionerId ?? actor.practitionerId ?? null,
    });
    if (!note) {
      return { status: 404, headers: JSON_HEADERS, body: { error: 'Clinical note not found' } };
    }
    await dependencies.createAuditLog({
      entityType: 'clinical_note',
      entityId: clinicalNoteId,
      action: 'signed',
      actorUserId: actor.userId,
      actorPractitionerId: actor.practitionerId,
      metadata: { status: 'final' },
    });
    return { status: 200, headers: JSON_HEADERS, body: { data: note } };
  } catch (error) {
    return mapError(error);
  }
}

export async function handleDeleteSoapNote(
  request: HttpRequest,
  dependencies: Dependencies,
  clinicalNoteId: string
): Promise<HttpResponse> {
  if (!dependencies.softDeleteSoapNote) {
    return mapError(new Error('SOAP note delete dependency is not configured'));
  }

  try {
    const soapNote = await dependencies.softDeleteSoapNote({ clinicalNoteId });
    if (!soapNote) {
      return { status: 404, headers: JSON_HEADERS, body: { error: 'SOAP note not found' } };
    }

    const actor = getActorContext(request);
    await dependencies.createAuditLog({
      entityType: 'soap_note',
      entityId: clinicalNoteId,
      action: 'deleted',
      actorUserId: actor.userId,
      actorPractitionerId: actor.practitionerId,
    });

    return { status: 200, headers: JSON_HEADERS, body: { data: toSoapNoteDto(soapNote) } };
  } catch (error) {
    return mapError(error);
  }
}

export async function handleDeleteDiagnosis(
  request: HttpRequest,
  dependencies: Dependencies,
  diagnosisId: string
): Promise<HttpResponse> {
  if (!dependencies.softDeleteDiagnosis) {
    return mapError(new Error('Diagnosis delete dependency is not configured'));
  }

  try {
    const diagnosis = await dependencies.softDeleteDiagnosis({ diagnosisId });
    if (!diagnosis) {
      return { status: 404, headers: JSON_HEADERS, body: { error: 'Diagnosis not found' } };
    }

    const actor = getActorContext(request);
    await dependencies.createAuditLog({
      entityType: 'diagnosis',
      entityId: diagnosisId,
      action: 'deleted',
      actorUserId: actor.userId,
      actorPractitionerId: actor.practitionerId,
    });

    return { status: 200, headers: JSON_HEADERS, body: { data: toDiagnosisDto(diagnosis) } };
  } catch (error) {
    return mapError(error);
  }
}

export async function handleDeleteVitalSign(
  request: HttpRequest,
  dependencies: Dependencies,
  vitalSignId: string
): Promise<HttpResponse> {
  if (!dependencies.softDeleteVitalSign) {
    return mapError(new Error('Vital sign delete dependency is not configured'));
  }

  try {
    const vitalSign = await dependencies.softDeleteVitalSign({ vitalSignId });
    if (!vitalSign) {
      return { status: 404, headers: JSON_HEADERS, body: { error: 'Vital sign not found' } };
    }

    const actor = getActorContext(request);
    await dependencies.createAuditLog({
      entityType: 'vital_sign',
      entityId: vitalSignId,
      action: 'deleted',
      actorUserId: actor.userId,
      actorPractitionerId: actor.practitionerId,
    });

    return { status: 200, headers: JSON_HEADERS, body: { data: toVitalSignDto(vitalSign) } };
  } catch (error) {
    return mapError(error);
  }
}

export async function handleDeletePrescription(
  request: HttpRequest,
  dependencies: Dependencies,
  prescriptionId: string
): Promise<HttpResponse> {
  if (!dependencies.softDeletePrescription) {
    return mapError(new Error('Prescription delete dependency is not configured'));
  }

  try {
    const prescription = await dependencies.softDeletePrescription({ prescriptionId });
    if (!prescription) {
      return { status: 404, headers: JSON_HEADERS, body: { error: 'Prescription not found' } };
    }

    const actor = getActorContext(request);
    await dependencies.createAuditLog({
      entityType: 'prescription',
      entityId: prescriptionId,
      action: 'deleted',
      actorUserId: actor.userId,
      actorPractitionerId: actor.practitionerId,
    });

    return { status: 200, headers: JSON_HEADERS, body: { data: toPrescriptionDto(prescription) } };
  } catch (error) {
    return mapError(error);
  }
}

export async function handleDeletePatientAllergy(
  request: HttpRequest,
  dependencies: Dependencies,
  allergyId: string
): Promise<HttpResponse> {
  if (!dependencies.softDeletePatientAllergy) {
    return mapError(new Error('Patient allergy delete dependency is not configured'));
  }

  try {
    const allergy = await dependencies.softDeletePatientAllergy({ allergyId });
    if (!allergy) {
      return { status: 404, headers: JSON_HEADERS, body: { error: 'Patient allergy not found' } };
    }

    const actor = getActorContext(request);
    await dependencies.createAuditLog({
      entityType: 'patient_allergy',
      entityId: allergyId,
      action: 'deleted',
      actorUserId: actor.userId,
      actorPractitionerId: actor.practitionerId,
    });

    return { status: 200, headers: JSON_HEADERS, body: { data: toPatientAllergyDto(allergy) } };
  } catch (error) {
    return mapError(error);
  }
}

export async function handleDeletePatientCondition(
  request: HttpRequest,
  dependencies: Dependencies,
  conditionId: string
): Promise<HttpResponse> {
  if (!dependencies.softDeletePatientCondition) {
    return mapError(new Error('Patient condition delete dependency is not configured'));
  }

  try {
    const condition = await dependencies.softDeletePatientCondition({ conditionId });
    if (!condition) {
      return { status: 404, headers: JSON_HEADERS, body: { error: 'Patient condition not found' } };
    }

    const actor = getActorContext(request);
    await dependencies.createAuditLog({
      entityType: 'patient_condition',
      entityId: conditionId,
      action: 'deleted',
      actorUserId: actor.userId,
      actorPractitionerId: actor.practitionerId,
    });

    return { status: 200, headers: JSON_HEADERS, body: { data: toPatientConditionDto(condition) } };
  } catch (error) {
    return mapError(error);
  }
}

export async function handleDeletePatientMedication(
  request: HttpRequest,
  dependencies: Dependencies,
  medicationId: string
): Promise<HttpResponse> {
  if (!dependencies.softDeletePatientMedication) {
    return mapError(new Error('Patient medication delete dependency is not configured'));
  }

  try {
    const medication = await dependencies.softDeletePatientMedication({ medicationId });
    if (!medication) {
      return { status: 404, headers: JSON_HEADERS, body: { error: 'Patient medication not found' } };
    }

    const actor = getActorContext(request);
    await dependencies.createAuditLog({
      entityType: 'patient_medication',
      entityId: medicationId,
      action: 'deleted',
      actorUserId: actor.userId,
      actorPractitionerId: actor.practitionerId,
    });

    return { status: 200, headers: JSON_HEADERS, body: { data: toPatientMedicationDto(medication) } };
  } catch (error) {
    return mapError(error);
  }
}

export async function handleDeletePatientFlag(
  request: HttpRequest,
  dependencies: Dependencies,
  flagId: string
): Promise<HttpResponse> {
  if (!dependencies.softDeletePatientFlag) {
    return mapError(new Error('Patient flag delete dependency is not configured'));
  }

  try {
    const flag = await dependencies.softDeletePatientFlag({ flagId });
    if (!flag) {
      return { status: 404, headers: JSON_HEADERS, body: { error: 'Patient flag not found' } };
    }

    const actor = getActorContext(request);
    await dependencies.createAuditLog({
      entityType: 'patient_flag',
      entityId: flagId,
      action: 'deleted',
      actorUserId: actor.userId,
      actorPractitionerId: actor.practitionerId,
    });

    return { status: 200, headers: JSON_HEADERS, body: { data: toPatientFlagDto(flag) } };
  } catch (error) {
    return mapError(error);
  }
}

export function validationError(error: string): HttpResponse {
  return {
    status: 400,
    headers: JSON_HEADERS,
    body: { error },
  };
}

export function notFound(): HttpResponse {
  return {
    status: 404,
    headers: JSON_HEADERS,
    body: { error: 'Route not found' },
  };
}

function mapError(error: unknown): HttpResponse {
  const httpError = toHttpError(error);

  return {
    status: httpError.status,
    headers: JSON_HEADERS,
    body: httpError.body,
  };
}

function readOptionalQueryString(
  request: HttpRequest,
  fieldName: string
): { ok: true; value: string | undefined } | { ok: false; error: string } {
  const value = request.query?.[fieldName];

  if (value === undefined) {
    return { ok: true, value: undefined };
  }

  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return { ok: false, error: `${fieldName} must be a non-empty string` };
  }

  return { ok: true, value: trimmed };
}

function csvCell(value: string) {
  if (!/[",\n]/.test(value)) return value;
  return `"${value.replaceAll('"', '""')}"`;
}

function appendAggregateRows(
  rows: string[][],
  section: string,
  items: unknown,
  keyField: string,
  valueField: string
) {
  if (!Array.isArray(items)) return;

  for (const item of items) {
    if (!item || typeof item !== 'object') continue;
    const row = item as Record<string, unknown>;
    rows.push([`${section}:${String(row[keyField] ?? 'unassigned')}`, String(row[valueField] ?? 0)]);
  }
}

function readOptionalEnumQuery<T extends string>(
  request: HttpRequest,
  fieldName: string,
  allowedValues: T[]
): { ok: true; value: T | undefined } | { ok: false; error: string } {
  const value = request.query?.[fieldName];

  if (value === undefined) {
    return { ok: true, value: undefined };
  }

  if (!allowedValues.includes(value as T)) {
    return {
      ok: false,
      error: `${fieldName} must be one of: ${allowedValues.join(', ')}`,
    };
  }

  return { ok: true, value: value as T };
}

function readOptionalBooleanQuery(
  request: HttpRequest,
  fieldName: string
): { ok: true; value: boolean | undefined } | { ok: false; error: string } {
  const value = request.query?.[fieldName];

  if (value === undefined) {
    return { ok: true, value: undefined };
  }

  if (value !== 'true' && value !== 'false') {
    return { ok: false, error: `${fieldName} must be true or false` };
  }

  return { ok: true, value: value === 'true' };
}

function readRequiredEnumQuery<T extends string>(
  request: HttpRequest,
  fieldName: string,
  allowedValues: readonly T[]
): { ok: true; value: T } | { ok: false; error: string } {
  const value = request.query?.[fieldName];

  if (value === undefined || value.trim().length === 0) {
    return { ok: false, error: `${fieldName} is required query parameter` };
  }

  if (!allowedValues.includes(value as T)) {
    return {
      ok: false,
      error: `${fieldName} must be one of: ${allowedValues.join(', ')}`,
    };
  }

  return { ok: true, value: value as T };
}

function readOptionalLimitQuery(
  request: HttpRequest
): { ok: true; value: number | undefined } | { ok: false; error: string } {
  const rawLimit = request.query?.limit;

  if (rawLimit === undefined) {
    return { ok: true, value: undefined };
  }

  const limit = Number(rawLimit);
  if (!Number.isInteger(limit) || limit <= 0 || limit > 200) {
    return { ok: false, error: 'limit must be an integer between 1 and 200' };
  }

  return { ok: true, value: limit };
}

function readOptionalOffsetQuery(
  request: HttpRequest
): { ok: true; value: number | undefined } | { ok: false; error: string } {
  const rawOffset = request.query?.offset;

  if (rawOffset === undefined) {
    return { ok: true, value: undefined };
  }

  const offset = Number(rawOffset);
  if (!Number.isInteger(offset) || offset < 0) {
    return { ok: false, error: 'offset must be an integer greater than or equal to 0' };
  }

  return { ok: true, value: offset };
}

import { toHttpError } from './postgresError.ts';
import {
  toAttachmentLinkDto,
  toAttachmentLinkDtos,
  toAppointmentDto,
  toAppointmentDtos,
  toClinicVisitDto,
  toClinicVisitDtos,
  toConsentRecordDto,
  toConsentRecordDtos,
  toDiagnosisDto,
  toDiagnosisDtos,
  toEncounterDto,
  toFileAssetDto,
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
  validateCreateClinicVisitBody,
  validateCreateConsentRecordBody,
  validateCreateDiagnosisBody,
  validateCreatePatientAllergyBody,
  validateCreatePatientConditionBody,
  validateCreatePatientFlagBody,
  validateCreatePatientMedicationBody,
  validateCreatePractitionerBody,
  validateCreatePrescriptionBody,
  validateCreateUserBody,
  validateCreateVitalSignBody,
  validateCreateEncounterBody,
  validateCreateFileAssetBody,
  validateCreatePatientBody,
  validateFinalizeClinicalNoteBody,
  validateSignClinicalNoteBody,
  validateUpdateAppointmentBody,
  validateUpdateClinicVisitBody,
  validateUpdateConsentRecordBody,
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
} from './validation.ts';
import { getActorContext } from './auth.ts';
import type {
  AppointmentStatus,
  ClinicVisitStatus,
  Dependencies,
  EncounterStatus,
  HttpRequest,
  HttpResponse,
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

  const limit = readOptionalLimitQuery(request);
  if (!limit.ok) return validationError(limit.error);

  const visits = await dependencies.listClinicQueue({
    clinicId,
    status: status.value,
    practitionerId: practitionerId.value,
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
  const prescription = await dependencies.createPrescription({
    ...validation.value,
    prescribedByPractitionerId:
      validation.value.prescribedByPractitionerId ?? actor.practitionerId ?? null,
  });

  await dependencies.createAuditLog({
    entityType: 'prescription',
    entityId: (prescription as { id: string }).id,
    action: 'created',
    actorUserId: actor.userId,
    actorPractitionerId: actor.practitionerId,
    metadata: { medicationName: validation.value.medicationName },
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

  const prescription = await dependencies.updatePrescription(validation.value);

  if (!prescription) {
    return { status: 404, headers: JSON_HEADERS, body: { error: 'Prescription not found' } };
  }

  const actor = getActorContext(request);
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

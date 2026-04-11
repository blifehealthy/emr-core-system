import { toHttpError } from './postgresError.ts';
import {
  toAppointmentDto,
  toAppointmentDtos,
  toDiagnosisDto,
  toDiagnosisDtos,
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
  validateCreateAppointmentBody,
  validateCreateDiagnosisBody,
  validateCreatePractitionerBody,
  validateCreatePrescriptionBody,
  validateCreateUserBody,
  validateCreateVitalSignBody,
  validateCreateEncounterBody,
  validateFinalizeClinicalNoteBody,
  validateSignClinicalNoteBody,
  validateUpdateAppointmentBody,
  validateUpdatePractitionerBody,
  validateUpdatePrescriptionBody,
  validateUpdateDiagnosisBody,
  validateUpdateSoapNoteBody,
  validateUpdateUserBody,
  validateUpdateVitalSignBody,
} from './validation.ts';
import { getActorContext } from './auth.ts';
import type { Dependencies, HttpRequest, HttpResponse } from './types.ts';

const JSON_HEADERS = { 'content-type': 'application/json; charset=utf-8' };

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

export async function handleGetAuditLogsByEntity(
  request: HttpRequest,
  dependencies: Dependencies
): Promise<HttpResponse> {
  const entityType = request.query?.entityType?.trim();
  const entityId = request.query?.entityId?.trim();
  const limit = request.query?.limit ? Number(request.query.limit) : undefined;

  if (!entityType || !entityId) {
    return validationError('entityType and entityId are required query parameters');
  }

  try {
    const logs = await dependencies.getAuditLogsByEntity({
      entityType,
      entityId,
      limit,
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

export async function handleListUsers(
  request: HttpRequest,
  dependencies: Dependencies
): Promise<HttpResponse> {
  const clinicId = request.query?.clinicId?.trim();

  if (!clinicId) {
    return validationError('clinicId is required query parameter');
  }

  const users = await dependencies.listUsers({ clinicId });
  return { status: 200, headers: JSON_HEADERS, body: { data: toUserDtos(users) } };
}

export async function handleCreateUser(
  request: HttpRequest,
  dependencies: Dependencies
): Promise<HttpResponse> {
  const validation = validateCreateUserBody(request.body);
  if (!validation.ok) return validationError(validation.error);

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
}

export async function handleUpdateUser(
  request: HttpRequest,
  dependencies: Dependencies,
  userId: string
): Promise<HttpResponse> {
  const validation = validateUpdateUserBody(request.body, userId);
  if (!validation.ok) return validationError(validation.error);

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
}

export async function handleListPractitioners(
  request: HttpRequest,
  dependencies: Dependencies
): Promise<HttpResponse> {
  const clinicId = request.query?.clinicId?.trim();

  if (!clinicId) {
    return validationError('clinicId is required query parameter');
  }

  const practitioners = await dependencies.listPractitioners({ clinicId });
  return { status: 200, headers: JSON_HEADERS, body: { data: toPractitionerDtos(practitioners) } };
}

export async function handleCreatePractitioner(
  request: HttpRequest,
  dependencies: Dependencies
): Promise<HttpResponse> {
  const validation = validateCreatePractitionerBody(request.body);
  if (!validation.ok) return validationError(validation.error);

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
}

export async function handleUpdatePractitioner(
  request: HttpRequest,
  dependencies: Dependencies,
  practitionerId: string
): Promise<HttpResponse> {
  const validation = validateUpdatePractitionerBody(request.body, practitionerId);
  if (!validation.ok) return validationError(validation.error);

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

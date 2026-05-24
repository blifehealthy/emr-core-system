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
  CreatePatientInput,
  CreatePatientAllergyInput,
  CreatePatientConditionInput,
  CreatePatientFlagInput,
  CreatePatientMedicationInput,
  CreateDiagnosisInput,
  CreateEncounterInput,
  CreatePractitionerValidatedInput,
  CreatePrescriptionInput,
  CreateUserValidatedInput,
  CreateVitalSignInput,
  DiagnosisStatus,
  DiagnosisType,
  EncounterClass,
  EncounterStatus,
  UpdateEncounterInput,
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
  UpdateUserValidatedInput,
  UpdateVitalSignInput,
  UserRole,
  PrescriptionStatus,
} from './types.ts';

const clinicVisitStatuses: ClinicVisitStatus[] = [
  'waiting',
  'in_room',
  'with_doctor',
  'completed',
  'discharged',
  'cancelled',
];

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

  const hasChanges = ['displayName', 'role', 'isActive'].some((field) =>
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
      medicationName: medicationName.value,
      rxnormCode: rxnormCode.value,
      dosage: dosage.value,
      route: route.value,
      frequency: frequency.value,
      durationText: durationText.value,
      instructions: instructions.value,
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
    'medicationName',
    'rxnormCode',
    'dosage',
    'route',
    'frequency',
    'durationText',
    'instructions',
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
      ...(Object.hasOwn(candidate, 'status') ? { status: status.value } : {}),
      ...(Object.hasOwn(candidate, 'startDate') ? { startDate: startDate.value } : {}),
      ...(Object.hasOwn(candidate, 'endDate') ? { endDate: endDate.value } : {}),
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

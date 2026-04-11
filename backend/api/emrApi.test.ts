import test from 'node:test';
import assert from 'node:assert/strict';

import { createEmrApi } from './emrApi.ts';
import type { Dependencies } from './types.ts';

function makeDeps(overrides: Partial<Dependencies> = {}): Dependencies {
  const base: Dependencies = {
    async getPatientWithEncountersAndSOAP() {
      return null;
    },
    async getConsentRecordById() {
      return { id: 'consent-1' };
    },
    async getFileAssetById() {
      return { id: 'file-1' };
    },
    async getPatientAllergyById() {
      return { id: 'allergy-1' };
    },
    async getPatientConditionById() {
      return { id: 'condition-1' };
    },
    async getSoapNoteByClinicalNoteId() {
      return { clinical_note_id: 'clinical-note-1' };
    },
    async getAppointmentById() {
      return { id: 'appointment-1' };
    },
    async getDiagnosisById() {
      return { id: 'diagnosis-1' };
    },
    async getVitalSignById() {
      return { id: 'vital-sign-1' };
    },
    async getPrescriptionById() {
      return { id: 'prescription-1' };
    },
    async listDiagnosesByEncounter() {
      return {
        rows: [],
        meta: { limit: 50, offset: 0, hasMore: false, nextOffset: null },
      };
    },
    async listAppointments() {
      return [];
    },
    async createAppointment() {
      return { id: 'appointment-1' };
    },
    async listAttachmentsByTarget() {
      return [];
    },
    async createFileAsset() {
      return { id: 'file-1' };
    },
    async createAttachmentLink() {
      return { id: 'attachment-1' };
    },
    async listPatientAllergies() {
      return [];
    },
    async createPatientAllergy() {
      return { id: 'allergy-1' };
    },
    async listPatientConditions() {
      return [];
    },
    async createPatientCondition() {
      return { id: 'condition-1' };
    },
    async updatePatientCondition() {
      return { id: 'condition-1' };
    },
    async updatePatientAllergy() {
      return { id: 'allergy-1' };
    },
    async listConsentRecordsByPatient() {
      return [];
    },
    async createConsentRecord() {
      return { id: 'consent-1' };
    },
    async updateConsentRecord() {
      return { id: 'consent-1' };
    },
    async updateAppointment() {
      return { id: 'appointment-1' };
    },
    async listVitalSignsByEncounter() {
      return {
        rows: [],
        meta: { limit: 50, offset: 0, hasMore: false, nextOffset: null },
      };
    },
    async listUsers() {
      return [];
    },
    async createUser() {
      return { id: 'user-1' };
    },
    async updateUser() {
      return { id: 'user-1' };
    },
    async listPractitioners() {
      return [];
    },
    async createPractitioner() {
      return { id: 'practitioner-1' };
    },
    async updatePractitioner() {
      return { id: 'practitioner-1' };
    },
    async listPrescriptionsByEncounter() {
      return {
        rows: [],
        meta: { limit: 50, offset: 0, hasMore: false, nextOffset: null },
      };
    },
    async createPrescription() {
      return { id: 'prescription-1' };
    },
    async createDiagnosis() {
      return { id: 'diagnosis-1' };
    },
    async createVitalSign() {
      return { id: 'vital-sign-1' };
    },
    async updatePrescription() {
      return { id: 'prescription-1' };
    },
    async createEncounterWithSOAP() {
      return {
        encounter: { id: 'encounter-1' },
        clinical_note: { id: 'clinical-note-1' },
        soap_note: { clinical_note_id: 'clinical-note-1' },
        diagnoses: [],
        vital_signs: [],
      };
    },
    async updateSoapNote() {
      return { clinical_note_id: 'clinical-note-1' };
    },
    async updateDiagnosis() {
      return { id: 'diagnosis-1' };
    },
    async updateVitalSign() {
      return { id: 'vital-sign-1' };
    },
    async softDeleteSoapNote() {
      return { clinical_note_id: 'clinical-note-1', deleted_at: '2026-01-01T00:00:00.000Z' };
    },
    async softDeleteDiagnosis() {
      return { id: 'diagnosis-1', deleted_at: '2026-01-01T00:00:00.000Z' };
    },
    async softDeleteVitalSign() {
      return { id: 'vital-sign-1', deleted_at: '2026-01-01T00:00:00.000Z' };
    },
    async softDeletePrescription() {
      return { id: 'prescription-1', deleted_at: '2026-01-01T00:00:00.000Z' };
    },
    async softDeletePatientAllergy() {
      return { id: 'allergy-1', deleted_at: '2026-01-01T00:00:00.000Z' };
    },
    async softDeletePatientCondition() {
      return { id: 'condition-1', deleted_at: '2026-01-01T00:00:00.000Z' };
    },
    async finalizeClinicalNote() {
      return { id: 'clinical-note-1', status: 'final' };
    },
    async signClinicalNote() {
      return { id: 'clinical-note-1', status: 'final' };
    },
    async createAuditLog() {
      return { id: 'audit-1' };
    },
    async getAuditLogsByEntity() {
      return [];
    },
    async getPatientTimeline() {
      return [];
    },
    async healthCheck() {},
  };

  return {
    ...base,
    ...overrides,
  };
}

test('GET /api/patients/detail returns patient data', async () => {
  const api = createEmrApi(
    makeDeps({
      async getPatientWithEncountersAndSOAP(input) {
        assert.deepEqual(input, { clinicId: 'clinic-1', medicalRecordNumber: 'MRN-001' });
        return {
          id: 'patient-1',
          clinic_id: 'clinic-1',
          medical_record_number: 'MRN-001',
          national_id: null,
          first_name: 'Jane',
          middle_name: null,
          last_name: 'Doe',
          preferred_name: null,
          date_of_birth: null,
          sex_at_birth: 'female',
          phone_number: null,
          email: null,
          blood_type: null,
          notes: null,
          created_at: '2026-01-01T00:00:00.000Z',
          updated_at: '2026-01-01T00:00:00.000Z',
          encounters: [],
        };
      },
    })
  );

  const response = await api({
    method: 'GET',
    path: '/api/patients/detail',
    headers: { 'x-user-role': 'doctor' },
    query: { clinicId: 'clinic-1', medicalRecordNumber: 'MRN-001' },
  });

  assert.equal(response.status, 200);
});

test('POST /api/encounters validates and creates encounter', async () => {
  const api = createEmrApi(makeDeps());
  const response = await api({
    method: 'POST',
    path: '/api/encounters',
    headers: { 'x-user-role': 'doctor' },
    body: { patientId: 'patient-1', encounterNumber: 'ENC-001', subjective: 'fever' },
  });
  assert.equal(response.status, 201);
});

test('appointments APIs work and enforce roles', async () => {
  const api = createEmrApi(
    makeDeps({
      async listAppointments(input) {
        assert.equal(input.clinicId, 'clinic-1');
        assert.equal(input.patientId, 'patient-1');
        assert.equal(input.status, 'confirmed');
        return [{ id: 'appointment-1' }];
      },
      async getAppointmentById(input) {
        assert.equal(input.appointmentId, 'appointment-1');
        return { id: 'appointment-1' };
      },
      async createAppointment(input) {
        assert.equal(input.appointmentNumber, 'APT-001');
        assert.equal(input.scheduledStartAt, '2026-01-10T09:00:00.000Z');
        return { id: 'appointment-1' };
      },
      async updateAppointment(input) {
        assert.equal(input.appointmentId, 'appointment-1');
        assert.equal(input.status, 'checked_in');
        return { id: 'appointment-1' };
      },
    })
  );

  const listAppointments = await api({
    method: 'GET',
    path: '/api/appointments',
    headers: { 'x-user-role': 'doctor' },
    query: { clinicId: 'clinic-1', patientId: 'patient-1', status: 'confirmed' },
  });
  assert.equal(listAppointments.status, 200);

  const getAppointment = await api({
    method: 'GET',
    path: '/api/appointments/appointment-1',
    headers: { 'x-user-role': 'nurse' },
  });
  assert.equal(getAppointment.status, 200);

  const createAppointment = await api({
    method: 'POST',
    path: '/api/appointments',
    headers: { 'x-user-role': 'nurse', 'x-user-id': 'user-1' },
    body: {
      clinicId: 'clinic-1',
      patientId: 'patient-1',
      appointmentNumber: 'APT-001',
      scheduledStartAt: '2026-01-10T09:00:00.000Z',
    },
  });
  assert.equal(createAppointment.status, 201);

  const updateAppointment = await api({
    method: 'PATCH',
    path: '/api/appointments/appointment-1',
    headers: { 'x-user-role': 'doctor', 'x-user-id': 'user-1' },
    body: { status: 'checked_in' },
  });
  assert.equal(updateAppointment.status, 200);
});

test('appointments APIs validate bad payloads and filters', async () => {
  const api = createEmrApi(makeDeps());

  const missingClinicId = await api({
    method: 'GET',
    path: '/api/appointments',
    headers: { 'x-user-role': 'doctor' },
  });
  assert.equal(missingClinicId.status, 400);

  const invalidStatus = await api({
    method: 'GET',
    path: '/api/appointments',
    headers: { 'x-user-role': 'doctor' },
    query: { clinicId: 'clinic-1', status: 'rescheduled' },
  });
  assert.equal(invalidStatus.status, 400);

  const createInvalid = await api({
    method: 'POST',
    path: '/api/appointments',
    headers: { 'x-user-role': 'doctor' },
    body: { clinicId: 'clinic-1', patientId: 'patient-1' },
  });
  assert.equal(createInvalid.status, 400);

  const patchInvalid = await api({
    method: 'PATCH',
    path: '/api/appointments/appointment-1',
    headers: { 'x-user-role': 'doctor' },
    body: {},
  });
  assert.equal(patchInvalid.status, 400);
});

test('consent APIs work and enforce roles', async () => {
  const api = createEmrApi(
    makeDeps({
      async listConsentRecordsByPatient(input) {
        assert.equal(input.patientId, 'patient-1');
        assert.equal(input.status, 'granted');
        return [{ id: 'consent-1' }];
      },
      async getConsentRecordById(input) {
        assert.equal(input.consentId, 'consent-1');
        return { id: 'consent-1' };
      },
      async createConsentRecord(input) {
        assert.equal(input.consentType, 'privacy_notice');
        return { id: 'consent-1' };
      },
      async updateConsentRecord(input) {
        assert.equal(input.consentId, 'consent-1');
        assert.equal(input.status, 'revoked');
        return { id: 'consent-1' };
      },
    })
  );

  const list = await api({
    method: 'GET',
    path: '/api/patients/patient-1/consents',
    headers: { 'x-user-role': 'doctor' },
    query: { status: 'granted' },
  });
  assert.equal(list.status, 200);

  const getOne = await api({
    method: 'GET',
    path: '/api/consents/consent-1',
    headers: { 'x-user-role': 'nurse' },
  });
  assert.equal(getOne.status, 200);

  const create = await api({
    method: 'POST',
    path: '/api/consents',
    headers: { 'x-user-role': 'admin', 'x-user-id': 'user-1' },
    body: {
      clinicId: 'clinic-1',
      patientId: 'patient-1',
      consentType: 'privacy_notice',
      status: 'granted',
    },
  });
  assert.equal(create.status, 201);

  const update = await api({
    method: 'PATCH',
    path: '/api/consents/consent-1',
    headers: { 'x-user-role': 'doctor', 'x-user-id': 'user-1' },
    body: { status: 'revoked' },
  });
  assert.equal(update.status, 200);
});

test('consent APIs validate bad payloads and filters', async () => {
  const api = createEmrApi(makeDeps());

  const invalidListStatus = await api({
    method: 'GET',
    path: '/api/patients/patient-1/consents',
    headers: { 'x-user-role': 'doctor' },
    query: { status: 'pending' },
  });
  assert.equal(invalidListStatus.status, 400);

  const invalidCreate = await api({
    method: 'POST',
    path: '/api/consents',
    headers: { 'x-user-role': 'doctor' },
    body: { clinicId: 'clinic-1', patientId: 'patient-1' },
  });
  assert.equal(invalidCreate.status, 400);

  const invalidPatch = await api({
    method: 'PATCH',
    path: '/api/consents/consent-1',
    headers: { 'x-user-role': 'doctor' },
    body: {},
  });
  assert.equal(invalidPatch.status, 400);
});

test('attachment APIs work and enforce roles', async () => {
  const api = createEmrApi(
    makeDeps({
      async listAttachmentsByTarget(input) {
        assert.equal(input.targetType, 'consent_record');
        assert.equal(input.targetId, 'consent-1');
        return [{ id: 'attachment-1' }];
      },
      async getFileAssetById(input) {
        assert.equal(input.fileAssetId, 'file-1');
        return { id: 'file-1' };
      },
      async createFileAsset(input) {
        assert.equal(input.storageKey, 'uploads/file-1.pdf');
        return { id: 'file-1' };
      },
      async createAttachmentLink(input) {
        assert.equal(input.fileAssetId, 'file-1');
        assert.equal(input.targetType, 'patient');
        return { id: 'attachment-1' };
      },
    })
  );

  const list = await api({
    method: 'GET',
    path: '/api/attachments',
    headers: { 'x-user-role': 'doctor' },
    query: { targetType: 'consent_record', targetId: 'consent-1' },
  });
  assert.equal(list.status, 200);

  const getFile = await api({
    method: 'GET',
    path: '/api/file-assets/file-1',
    headers: { 'x-user-role': 'nurse' },
  });
  assert.equal(getFile.status, 200);

  const createFile = await api({
    method: 'POST',
    path: '/api/file-assets',
    headers: { 'x-user-role': 'admin', 'x-user-id': 'user-1' },
    body: {
      clinicId: 'clinic-1',
      storageKey: 'uploads/file-1.pdf',
      originalFilename: 'lab-result.pdf',
      byteSize: 1024,
    },
  });
  assert.equal(createFile.status, 201);

  const createLink = await api({
    method: 'POST',
    path: '/api/attachments',
    headers: { 'x-user-role': 'doctor', 'x-user-id': 'user-1' },
    body: {
      fileAssetId: 'file-1',
      targetType: 'patient',
      targetId: 'patient-1',
    },
  });
  assert.equal(createLink.status, 201);
});

test('attachment APIs validate bad payloads and filters', async () => {
  const api = createEmrApi(makeDeps());

  const missingTarget = await api({
    method: 'GET',
    path: '/api/attachments',
    headers: { 'x-user-role': 'doctor' },
    query: { targetId: 'patient-1' },
  });
  assert.equal(missingTarget.status, 400);

  const invalidFile = await api({
    method: 'POST',
    path: '/api/file-assets',
    headers: { 'x-user-role': 'doctor' },
    body: { clinicId: 'clinic-1', storageKey: 'uploads/file-1.pdf', byteSize: -1 },
  });
  assert.equal(invalidFile.status, 400);

  const invalidLink = await api({
    method: 'POST',
    path: '/api/attachments',
    headers: { 'x-user-role': 'doctor' },
    body: { fileAssetId: 'file-1', targetType: 'visit', targetId: 'patient-1' },
  });
  assert.equal(invalidLink.status, 400);
});

test('patient allergy APIs work and enforce roles', async () => {
  const api = createEmrApi(
    makeDeps({
      async listPatientAllergies(input) {
        assert.equal(input.patientId, 'patient-1');
        assert.equal(input.status, 'active');
        return [{ id: 'allergy-1' }];
      },
      async getPatientAllergyById(input) {
        assert.equal(input.allergyId, 'allergy-1');
        return { id: 'allergy-1' };
      },
      async createPatientAllergy(input) {
        assert.equal(input.patientId, 'patient-1');
        assert.equal(input.allergenName, 'Peanuts');
        return { id: 'allergy-1' };
      },
      async updatePatientAllergy(input) {
        assert.equal(input.allergyId, 'allergy-1');
        assert.equal(input.status, 'inactive');
        return { id: 'allergy-1' };
      },
    })
  );

  const list = await api({
    method: 'GET',
    path: '/api/patients/patient-1/allergies',
    headers: { 'x-user-role': 'doctor' },
    query: { status: 'active' },
  });
  assert.equal(list.status, 200);

  const getOne = await api({
    method: 'GET',
    path: '/api/patient-allergies/allergy-1',
    headers: { 'x-user-role': 'nurse' },
  });
  assert.equal(getOne.status, 200);

  const create = await api({
    method: 'POST',
    path: '/api/patient-allergies',
    headers: { 'x-user-role': 'nurse', 'x-user-id': 'user-1' },
    body: { patientId: 'patient-1', allergenName: 'Peanuts', severity: 'severe' },
  });
  assert.equal(create.status, 201);

  const update = await api({
    method: 'PATCH',
    path: '/api/patient-allergies/allergy-1',
    headers: { 'x-user-role': 'doctor', 'x-user-id': 'user-1' },
    body: { status: 'inactive' },
  });
  assert.equal(update.status, 200);

  const remove = await api({
    method: 'DELETE',
    path: '/api/patient-allergies/allergy-1',
    headers: { 'x-user-role': 'doctor', 'x-user-id': 'user-1' },
  });
  assert.equal(remove.status, 200);
});

test('patient allergy APIs validate bad payloads and filters', async () => {
  const api = createEmrApi(makeDeps());

  const invalidListStatus = await api({
    method: 'GET',
    path: '/api/patients/patient-1/allergies',
    headers: { 'x-user-role': 'doctor' },
    query: { status: 'pending' },
  });
  assert.equal(invalidListStatus.status, 400);

  const invalidCreate = await api({
    method: 'POST',
    path: '/api/patient-allergies',
    headers: { 'x-user-role': 'doctor' },
    body: { patientId: 'patient-1' },
  });
  assert.equal(invalidCreate.status, 400);

  const invalidPatch = await api({
    method: 'PATCH',
    path: '/api/patient-allergies/allergy-1',
    headers: { 'x-user-role': 'doctor' },
    body: {},
  });
  assert.equal(invalidPatch.status, 400);
});

test('patient condition APIs work and enforce roles', async () => {
  const api = createEmrApi(
    makeDeps({
      async listPatientConditions(input) {
        assert.equal(input.patientId, 'patient-1');
        assert.equal(input.clinicalStatus, 'active');
        return [{ id: 'condition-1' }];
      },
      async getPatientConditionById(input) {
        assert.equal(input.conditionId, 'condition-1');
        return { id: 'condition-1' };
      },
      async createPatientCondition(input) {
        assert.equal(input.patientId, 'patient-1');
        assert.equal(input.conditionName, 'Asthma');
        return { id: 'condition-1' };
      },
      async updatePatientCondition(input) {
        assert.equal(input.conditionId, 'condition-1');
        assert.equal(input.clinicalStatus, 'resolved');
        return { id: 'condition-1' };
      },
    })
  );

  const list = await api({
    method: 'GET',
    path: '/api/patients/patient-1/conditions',
    headers: { 'x-user-role': 'doctor' },
    query: { clinicalStatus: 'active' },
  });
  assert.equal(list.status, 200);

  const getOne = await api({
    method: 'GET',
    path: '/api/patient-conditions/condition-1',
    headers: { 'x-user-role': 'nurse' },
  });
  assert.equal(getOne.status, 200);

  const create = await api({
    method: 'POST',
    path: '/api/patient-conditions',
    headers: { 'x-user-role': 'nurse', 'x-user-id': 'user-1' },
    body: { patientId: 'patient-1', conditionName: 'Asthma', clinicalStatus: 'active' },
  });
  assert.equal(create.status, 201);

  const update = await api({
    method: 'PATCH',
    path: '/api/patient-conditions/condition-1',
    headers: { 'x-user-role': 'doctor', 'x-user-id': 'user-1' },
    body: { clinicalStatus: 'resolved' },
  });
  assert.equal(update.status, 200);

  const remove = await api({
    method: 'DELETE',
    path: '/api/patient-conditions/condition-1',
    headers: { 'x-user-role': 'doctor', 'x-user-id': 'user-1' },
  });
  assert.equal(remove.status, 200);
});

test('patient condition APIs validate bad payloads and filters', async () => {
  const api = createEmrApi(makeDeps());

  const invalidListStatus = await api({
    method: 'GET',
    path: '/api/patients/patient-1/conditions',
    headers: { 'x-user-role': 'doctor' },
    query: { clinicalStatus: 'pending' },
  });
  assert.equal(invalidListStatus.status, 400);

  const invalidCreate = await api({
    method: 'POST',
    path: '/api/patient-conditions',
    headers: { 'x-user-role': 'doctor' },
    body: { patientId: 'patient-1' },
  });
  assert.equal(invalidCreate.status, 400);

  const invalidPatch = await api({
    method: 'PATCH',
    path: '/api/patient-conditions/condition-1',
    headers: { 'x-user-role': 'doctor' },
    body: {},
  });
  assert.equal(invalidPatch.status, 400);
});

test('PATCH update routes honor role permissions', async () => {
  const api = createEmrApi(makeDeps());

  const soap = await api({
    method: 'PATCH',
    path: '/api/clinical-notes/clinical-note-1/soap',
    headers: { 'x-user-role': 'doctor' },
    body: { plan: 'updated' },
  });
  assert.equal(soap.status, 200);

  const diagnosisDenied = await api({
    method: 'PATCH',
    path: '/api/diagnoses/diagnosis-1',
    headers: { 'x-user-role': 'nurse' },
    body: { diagnosisName: 'Updated' },
  });
  assert.equal(diagnosisDenied.status, 403);
});

test('POST diagnosis and vital sign routes create entities and honor roles', async () => {
  const api = createEmrApi(
    makeDeps({
      async createDiagnosis(input) {
        assert.equal(input.encounterId, 'encounter-1');
        assert.equal(input.diagnosisName, 'Influenza');
        return { id: 'diagnosis-1' };
      },
      async createVitalSign(input) {
        assert.equal(input.encounterId, 'encounter-1');
        assert.equal(input.heartRateBpm, 88);
        return { id: 'vital-sign-1' };
      },
    })
  );

  const diagnosis = await api({
    method: 'POST',
    path: '/api/diagnoses',
    headers: { 'x-user-role': 'doctor' },
    body: { encounterId: 'encounter-1', diagnosisName: 'Influenza', status: 'active' },
  });
  assert.equal(diagnosis.status, 201);

  const diagnosisDenied = await api({
    method: 'POST',
    path: '/api/diagnoses',
    headers: { 'x-user-role': 'nurse' },
    body: { encounterId: 'encounter-1', diagnosisName: 'Influenza' },
  });
  assert.equal(diagnosisDenied.status, 403);

  const vitalSign = await api({
    method: 'POST',
    path: '/api/vital-signs',
    headers: { 'x-user-role': 'nurse' },
    body: { encounterId: 'encounter-1', heartRateBpm: 88 },
  });
  assert.equal(vitalSign.status, 201);
});

test('POST diagnosis and vital sign routes validate bad payloads', async () => {
  const api = createEmrApi(makeDeps());

  const diagnosisMissingName = await api({
    method: 'POST',
    path: '/api/diagnoses',
    headers: { 'x-user-role': 'doctor' },
    body: { encounterId: 'encounter-1' },
  });
  assert.equal(diagnosisMissingName.status, 400);

  const diagnosisCodePairInvalid = await api({
    method: 'POST',
    path: '/api/diagnoses',
    headers: { 'x-user-role': 'doctor' },
    body: {
      encounterId: 'encounter-1',
      diagnosisName: 'Influenza',
      diagnosisCode: 'J11',
    },
  });
  assert.equal(diagnosisCodePairInvalid.status, 400);

  const vitalSignNoMeasurement = await api({
    method: 'POST',
    path: '/api/vital-signs',
    headers: { 'x-user-role': 'nurse' },
    body: { encounterId: 'encounter-1' },
  });
  assert.equal(vitalSignNoMeasurement.status, 400);
});

test('GET and DELETE entity routes return data and enforce roles', async () => {
  const api = createEmrApi(makeDeps());

  const getSoap = await api({
    method: 'GET',
    path: '/api/clinical-notes/clinical-note-1/soap',
    headers: { 'x-user-role': 'doctor' },
  });
  assert.equal(getSoap.status, 200);

  const getDiagnosis = await api({
    method: 'GET',
    path: '/api/diagnoses/diagnosis-1',
    headers: { 'x-user-role': 'nurse' },
  });
  assert.equal(getDiagnosis.status, 200);

  const getVitalSign = await api({
    method: 'GET',
    path: '/api/vital-signs/vital-sign-1',
    headers: { 'x-user-role': 'doctor' },
  });
  assert.equal(getVitalSign.status, 200);

  const getPrescription = await api({
    method: 'GET',
    path: '/api/prescriptions/prescription-1',
    headers: { 'x-user-role': 'doctor' },
  });
  assert.equal(getPrescription.status, 200);

  const deleteSoap = await api({
    method: 'DELETE',
    path: '/api/clinical-notes/clinical-note-1/soap',
    headers: { 'x-user-role': 'doctor' },
  });
  assert.equal(deleteSoap.status, 200);

  const deleteDiagnosisDenied = await api({
    method: 'DELETE',
    path: '/api/diagnoses/diagnosis-1',
    headers: { 'x-user-role': 'nurse' },
  });
  assert.equal(deleteDiagnosisDenied.status, 403);

  const deleteVitalSign = await api({
    method: 'DELETE',
    path: '/api/vital-signs/vital-sign-1',
    headers: { 'x-user-role': 'nurse' },
  });
  assert.equal(deleteVitalSign.status, 200);

  const deletePrescription = await api({
    method: 'DELETE',
    path: '/api/prescriptions/prescription-1',
    headers: { 'x-user-role': 'doctor' },
  });
  assert.equal(deletePrescription.status, 200);
});

test('encounter diagnosis and vital sign list routes return data', async () => {
  const api = createEmrApi(
    makeDeps({
      async listDiagnosesByEncounter(input) {
        assert.equal(input.encounterId, 'encounter-1');
        assert.equal(input.clinicalNoteId, 'clinical-note-1');
        assert.equal(input.status, 'active');
        assert.equal(input.limit, 10);
        assert.equal(input.offset, 20);
        return {
          rows: [{ id: 'diagnosis-1' }],
          meta: { limit: 10, offset: 20, hasMore: true, nextOffset: 30 },
        };
      },
      async listVitalSignsByEncounter(input) {
        assert.equal(input.encounterId, 'encounter-1');
        assert.equal(input.clinicalNoteId, 'clinical-note-1');
        assert.equal(input.limit, 5);
        assert.equal(input.offset, 0);
        return {
          rows: [{ id: 'vital-sign-1' }],
          meta: { limit: 5, offset: 0, hasMore: false, nextOffset: null },
        };
      },
      async listPrescriptionsByEncounter(input) {
        assert.equal(input.encounterId, 'encounter-1');
        assert.equal(input.clinicalNoteId, 'clinical-note-1');
        assert.equal(input.status, 'active');
        assert.equal(input.limit, 20);
        assert.equal(input.offset, 40);
        return {
          rows: [{ id: 'prescription-1' }],
          meta: { limit: 20, offset: 40, hasMore: true, nextOffset: 60 },
        };
      },
    })
  );

  const diagnoses = await api({
    method: 'GET',
    path: '/api/encounters/encounter-1/diagnoses',
    headers: { 'x-user-role': 'doctor' },
    query: { clinicalNoteId: 'clinical-note-1', status: 'active', limit: '10', offset: '20' },
  });
  assert.equal(diagnoses.status, 200);
  assert.deepEqual(diagnoses.body, {
    data: [{ id: 'diagnosis-1' }],
    meta: { limit: 10, offset: 20, hasMore: true, nextOffset: 30 },
  });

  const vitalSigns = await api({
    method: 'GET',
    path: '/api/encounters/encounter-1/vital-signs',
    headers: { 'x-user-role': 'nurse' },
    query: { clinicalNoteId: 'clinical-note-1', limit: '5', offset: '0' },
  });
  assert.equal(vitalSigns.status, 200);
  assert.deepEqual(vitalSigns.body, {
    data: [{ id: 'vital-sign-1' }],
    meta: { limit: 5, offset: 0, hasMore: false, nextOffset: null },
  });

  const prescriptions = await api({
    method: 'GET',
    path: '/api/encounters/encounter-1/prescriptions',
    headers: { 'x-user-role': 'doctor' },
    query: { clinicalNoteId: 'clinical-note-1', status: 'active', limit: '20', offset: '40' },
  });
  assert.equal(prescriptions.status, 200);
  assert.deepEqual(prescriptions.body, {
    data: [{ id: 'prescription-1' }],
    meta: { limit: 20, offset: 40, hasMore: true, nextOffset: 60 },
  });
});

test('encounter list routes validate invalid filters', async () => {
  const api = createEmrApi(makeDeps());

  const invalidDiagnosisStatus = await api({
    method: 'GET',
    path: '/api/encounters/encounter-1/diagnoses',
    headers: { 'x-user-role': 'doctor' },
    query: { status: 'draft' },
  });
  assert.equal(invalidDiagnosisStatus.status, 400);

  const invalidVitalLimit = await api({
    method: 'GET',
    path: '/api/encounters/encounter-1/vital-signs',
    headers: { 'x-user-role': 'doctor' },
    query: { limit: '0' },
  });
  assert.equal(invalidVitalLimit.status, 400);

  const invalidDiagnosisOffset = await api({
    method: 'GET',
    path: '/api/encounters/encounter-1/diagnoses',
    headers: { 'x-user-role': 'doctor' },
    query: { offset: '-1' },
  });
  assert.equal(invalidDiagnosisOffset.status, 400);

  const invalidPrescriptionClinicalNoteId = await api({
    method: 'GET',
    path: '/api/encounters/encounter-1/prescriptions',
    headers: { 'x-user-role': 'doctor' },
    query: { clinicalNoteId: '   ' },
  });
  assert.equal(invalidPrescriptionClinicalNoteId.status, 400);
});

test('health, audit log, and patient timeline routes return data', async () => {
  const api = createEmrApi(
    makeDeps({
      async getAuditLogsByEntity() {
        return [{ id: 'audit-1' }];
      },
      async getPatientTimeline() {
        return [{ id: 'audit-2' }];
      },
    })
  );

  const health = await api({ method: 'GET', path: '/health' });
  assert.equal(health.status, 200);

  const audit = await api({
    method: 'GET',
    path: '/api/audit-logs',
    headers: { 'x-user-role': 'doctor' },
    query: { entityType: 'clinical_note', entityId: 'clinical-note-1' },
  });
  assert.equal(audit.status, 200);

  const timeline = await api({
    method: 'GET',
    path: '/api/patients/patient-1/timeline',
    headers: { 'x-user-role': 'nurse' },
  });
  assert.equal(timeline.status, 200);
});

test('API can resolve role and practitioner context from user id', async () => {
  const api = createEmrApi(
    makeDeps({
      async getPatientWithEncountersAndSOAP() {
        return {
          id: 'patient-1',
          clinic_id: 'clinic-1',
          medical_record_number: 'MRN-001',
          national_id: null,
          first_name: 'Jane',
          middle_name: null,
          last_name: 'Doe',
          preferred_name: null,
          date_of_birth: null,
          sex_at_birth: 'female',
          phone_number: null,
          email: null,
          blood_type: null,
          notes: null,
          created_at: '2026-01-01T00:00:00.000Z',
          updated_at: '2026-01-01T00:00:00.000Z',
          encounters: [],
        };
      },
      async resolveActor() {
        return {
          user_id: 'user-1',
          role: 'doctor',
          practitioner_id: 'practitioner-1',
          clinic_id: 'clinic-1',
          display_name: 'Dr Jane',
        };
      },
    })
  );

  const response = await api({
    method: 'GET',
    path: '/api/patients/detail',
    headers: { 'x-user-id': 'user-1' },
    query: { clinicId: 'clinic-1', medicalRecordNumber: 'MRN-001' },
  });

  assert.equal(response.status, 200);
});

test('API rejects unresolved actor context when resolver is configured', async () => {
  const api = createEmrApi(
    makeDeps({
      async resolveActor() {
        return null;
      },
    })
  );

  const missingUserId = await api({
    method: 'GET',
    path: '/api/patients/detail',
    headers: { 'x-user-role': 'admin' },
    query: { clinicId: 'clinic-1', medicalRecordNumber: 'MRN-001' },
  });
  assert.equal(missingUserId.status, 403);
  assert.deepEqual(missingUserId.body, { error: 'x-user-id header is required' });

  const unresolvedActor = await api({
    method: 'GET',
    path: '/api/patients/detail',
    headers: { 'x-user-id': 'missing-user', 'x-user-role': 'admin' },
    query: { clinicId: 'clinic-1', medicalRecordNumber: 'MRN-001' },
  });
  assert.equal(unresolvedActor.status, 403);
  assert.deepEqual(unresolvedActor.body, { error: 'Actor could not be resolved' });
});

test('users, practitioners, and prescriptions APIs work and enforce roles', async () => {
  const api = createEmrApi(
    makeDeps({
      async listUsers(input) {
        assert.equal(input.clinicId, 'clinic-1');
        return [{ id: 'user-1' }];
      },
      async createUser(input) {
        assert.equal(input.role, 'doctor');
        return { id: 'user-1' };
      },
      async listPractitioners() {
        return [{ id: 'practitioner-1' }];
      },
      async createPractitioner() {
        return { id: 'practitioner-1' };
      },
      async listPrescriptionsByEncounter() {
        return {
          rows: [{ id: 'prescription-1' }],
          meta: { limit: 50, offset: 0, hasMore: false, nextOffset: null },
        };
      },
      async createPrescription(input) {
        assert.equal(input.medicationName, 'Paracetamol');
        return { id: 'prescription-1' };
      },
    })
  );

  const listUsers = await api({
    method: 'GET',
    path: '/api/users',
    headers: { 'x-user-role': 'admin' },
    query: { clinicId: 'clinic-1' },
  });
  assert.equal(listUsers.status, 200);

  const createUser = await api({
    method: 'POST',
    path: '/api/users',
    headers: { 'x-user-role': 'admin', 'x-user-id': 'admin-1' },
    body: { clinicId: 'clinic-1', username: 'doc1', displayName: 'Doc 1', role: 'doctor' },
  });
  assert.equal(createUser.status, 201);

  const listPractitioners = await api({
    method: 'GET',
    path: '/api/practitioners',
    headers: { 'x-user-role': 'doctor' },
    query: { clinicId: 'clinic-1' },
  });
  assert.equal(listPractitioners.status, 200);

  const createPrescription = await api({
    method: 'POST',
    path: '/api/prescriptions',
    headers: { 'x-user-role': 'doctor', 'x-practitioner-id': 'practitioner-1' },
    body: { encounterId: 'encounter-1', medicationName: 'Paracetamol' },
  });
  assert.equal(createPrescription.status, 201);

  const readDenied = await api({
    method: 'GET',
    path: '/api/users',
    headers: { 'x-user-role': 'doctor' },
    query: { clinicId: 'clinic-1' },
  });
  assert.equal(readDenied.status, 403);
});

test('entity validators reject empty or invalid patch bodies', async () => {
  const api = createEmrApi(makeDeps());

  const emptyUserPatch = await api({
    method: 'PATCH',
    path: '/api/users/user-1',
    headers: { 'x-user-role': 'admin' },
    body: {},
  });
  assert.equal(emptyUserPatch.status, 400);

  const invalidPractitionerPatch = await api({
    method: 'PATCH',
    path: '/api/practitioners/practitioner-1',
    headers: { 'x-user-role': 'admin' },
    body: { isActive: 'yes' },
  });
  assert.equal(invalidPractitionerPatch.status, 400);

  const invalidPrescriptionPatch = await api({
    method: 'PATCH',
    path: '/api/prescriptions/prescription-1',
    headers: { 'x-user-role': 'doctor' },
    body: { status: 'paused' },
  });
  assert.equal(invalidPrescriptionPatch.status, 400);

  const emptyVitalPatch = await api({
    method: 'PATCH',
    path: '/api/vital-signs/vital-sign-1',
    headers: { 'x-user-role': 'nurse' },
    body: {},
  });
  assert.equal(emptyVitalPatch.status, 400);
});

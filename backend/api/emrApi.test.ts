import test from 'node:test';
import assert from 'node:assert/strict';

import { createEmrApi } from './emrApi.ts';
import type { Dependencies } from './types.ts';

function makeDeps(overrides: Partial<Dependencies> = {}): Dependencies {
  const base: Dependencies = {
    async getPatientWithEncountersAndSOAP() {
      return null;
    },
    async getSoapNoteByClinicalNoteId() {
      return { clinical_note_id: 'clinical-note-1' };
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

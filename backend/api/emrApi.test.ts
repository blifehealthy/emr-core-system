import test from 'node:test';
import assert from 'node:assert/strict';

import { createEmrApi } from './emrApi.ts';
import { createSessionToken } from '../services/sessionToken.ts';
import { createOidcTestToken } from '../services/oidcToken.ts';
import type { Dependencies } from './types.ts';

type AuditLogInput = Parameters<Dependencies['createAuditLog']>[0];

function makeDeps(overrides: Partial<Dependencies> = {}): Dependencies {
  const base: Dependencies = {
    async getPatientWithEncountersAndSOAP() {
      return null;
    },
    async createPatient() {
      return { id: 'patient-1' };
    },
    async getConsentRecordById() {
      return { id: 'consent-1' };
    },
    async getFileAssetById() {
      return { id: 'file-1' };
    },
    async listFileAssets() {
      return { rows: [], meta: { limit: 50, offset: 0, hasMore: false, nextOffset: null } };
    },
    async getPatientAllergyById() {
      return { id: 'allergy-1' };
    },
    async getPatientConditionById() {
      return { id: 'condition-1' };
    },
    async getPatientMedicationById() {
      return { id: 'medication-1' };
    },
    async getPatientFlagById() {
      return { id: 'flag-1' };
    },
    async getSoapNoteByClinicalNoteId() {
      return { clinical_note_id: 'clinical-note-1' };
    },
    async getAppointmentById() {
      return { id: 'appointment-1', status: 'confirmed' };
    },
    async getEncounterById() {
      return { id: 'encounter-1', status: 'in_progress' };
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
    async listClinicQueue() {
      return [];
    },
    async createClinicVisit() {
      return { id: 'visit-1' };
    },
    async updateClinicVisit() {
      return { id: 'visit-1' };
    },
    async listClinicalNoteTemplates() {
      return [];
    },
    async createClinicalNoteTemplate() {
      return { id: 'template-1' };
    },
    async updateClinicalNoteTemplate() {
      return { id: 'template-1' };
    },
    async getClinicSettings() {
      return { clinic_id: 'clinic-1', display_name: 'Clinic' };
    },
    async upsertClinicSettings() {
      return { clinic_id: 'clinic-1', display_name: 'Clinic' };
    },
    async getDailyOperationsReport() {
      return { start_date: '2026-05-24', end_date: '2026-05-24', visits_total: 0 };
    },
    async getPharmacyOverrideReport() {
      return { start_date: '2026-05-24', end_date: '2026-05-24', override_total: 0 };
    },
    async listAttachmentsByTarget() {
      return [];
    },
    async createFileAsset() {
      return { id: 'file-1' };
    },
    async uploadFileAsset() {
      return { id: 'file-1' };
    },
    async downloadFileAssetContent() {
      return { content: Buffer.from('file-bytes'), mimeType: 'application/octet-stream' };
    },
    getFileAssetStoragePolicy() {
      return {
        driver: 'local',
        maxUploadBytes: 1024,
        allowedMimeTypes: ['image/png'],
      };
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
    async listPatientMedications() {
      return [];
    },
    async listPatientFlags() {
      return [];
    },
    async createPatientMedication() {
      return { id: 'medication-1' };
    },
    async createPatientFlag() {
      return { id: 'flag-1' };
    },
    async updatePatientMedication() {
      return { id: 'medication-1' };
    },
    async updatePatientFlag() {
      return { id: 'flag-1' };
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
    async updateEncounter() {
      return { id: 'encounter-1' };
    },
    async listVitalSignsByEncounter() {
      return {
        rows: [],
        meta: { limit: 50, offset: 0, hasMore: false, nextOffset: null },
      };
    },
    async listUsers() {
      return {
        rows: [],
        meta: { limit: 50, offset: 0, hasMore: false, nextOffset: null },
      };
    },
    async createUser() {
      return { id: 'user-1' };
    },
    async updateUser() {
      return { id: 'user-1' };
    },
    async listPractitioners() {
      return {
        rows: [],
        meta: { limit: 50, offset: 0, hasMore: false, nextOffset: null },
      };
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
    async listInvoices() {
      return { rows: [], meta: { limit: 50, offset: 0, hasMore: false, nextOffset: null } };
    },
    async getInvoiceById() {
      return { id: 'invoice-1', line_items: [], payments: [] };
    },
    async createInvoice() {
      return { id: 'invoice-1', invoice_number: 'INV-001', line_items: [], payments: [] };
    },
    async recordInvoicePayment() {
      return { id: 'invoice-1', status: 'paid', line_items: [], payments: [] };
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
    async softDeletePatientMedication() {
      return { id: 'medication-1', deleted_at: '2026-01-01T00:00:00.000Z' };
    },
    async softDeletePatientFlag() {
      return { id: 'flag-1', deleted_at: '2026-01-01T00:00:00.000Z' };
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
    async createAuthSession() {
      return {
        accessToken: 'emr1.test.signature',
        tokenType: 'Bearer',
        expiresAt: '2026-05-25T10:30:00.000Z',
        user: {
          id: 'user-1',
          clinic_id: 'clinic-1',
          username: 'doctor.one',
          display_name: 'Dr One',
          role: 'doctor',
          practitioner_id: 'practitioner-1',
        },
      };
    },
    async healthCheck() {},
  };

  return {
    ...base,
    ...overrides,
  };
}

test('POST /api/auth/sessions returns a session token and writes audit log', async () => {
  let auditMetadata: Record<string, unknown> | undefined;
  const api = createEmrApi(
    makeDeps({
      async createAuthSession(input) {
        assert.deepEqual(input, {
          clinicId: 'clinic-1',
          username: 'doctor.one',
          loginCode: 'pilot-code',
        });
        return {
          accessToken: 'emr1.payload.signature',
          tokenType: 'Bearer',
          expiresAt: '2026-05-25T10:30:00.000Z',
          user: {
            id: 'user-1',
            clinic_id: 'clinic-1',
            username: 'doctor.one',
            display_name: 'Dr One',
            role: 'doctor',
            practitioner_id: 'practitioner-1',
          },
        };
      },
      async createAuditLog(input) {
        assert.equal(input.entityType, 'user');
        assert.equal(input.entityId, 'user-1');
        assert.equal(input.action, 'session_created');
        assert.equal(input.actorUserId, 'user-1');
        auditMetadata = input.metadata;
        return { id: 'audit-1' };
      },
    })
  );

  const response = await api({
    method: 'POST',
    path: '/api/auth/sessions',
    body: { clinicId: 'clinic-1', username: 'doctor.one', loginCode: 'pilot-code' },
  });

  assert.equal(response.status, 201);
  assert.deepEqual(auditMetadata, {
    clinicId: 'clinic-1',
    username: 'doctor.one',
    expiresAt: '2026-05-25T10:30:00.000Z',
  });
});

test('POST /api/auth/sessions audits failed login for known users', async () => {
  let auditAction = '';
  let auditMetadata: Record<string, unknown> | undefined;
  const api = createEmrApi(
    makeDeps({
      async createAuthSession() {
        return {
          failed: true,
          reason: 'invalid_login_code',
          lockedUntil: '2026-05-25T10:15:00.000Z',
          user: {
            id: 'user-1',
            clinic_id: 'clinic-1',
            username: 'doctor.one',
            display_name: 'Dr One',
            role: 'doctor',
            practitioner_id: 'practitioner-1',
          },
        };
      },
      async createAuditLog(input) {
        auditAction = input.action;
        auditMetadata = input.metadata;
        return { id: 'audit-1' };
      },
    })
  );

  const response = await api({
    method: 'POST',
    path: '/api/auth/sessions',
    body: { clinicId: 'clinic-1', username: 'doctor.one', loginCode: 'wrong-code' },
  });

  assert.equal(response.status, 401);
  assert.equal(auditAction, 'session_login_failed');
  assert.deepEqual(auditMetadata, {
    clinicId: 'clinic-1',
    username: 'doctor.one',
    reason: 'invalid_login_code',
    lockedUntil: '2026-05-25T10:15:00.000Z',
  });
});

test('audits bearer authentication failures as security events', async () => {
  const auditInputs: AuditLogInput[] = [];
  const api = createEmrApi(
    makeDeps({
      apiToken: 'expected-token',
      async createAuditLog(input) {
        auditInputs.push(input);
        return { id: 'audit-1' };
      },
    })
  );

  const response = await api({
    method: 'GET',
    path: '/api/patients/detail',
    query: { clinicId: 'clinic-1', medicalRecordNumber: 'MRN-001' },
  });

  assert.equal(response.status, 401);
  assert.equal(auditInputs.length, 1);
  const auditInput = auditInputs[0];
  assert.equal(auditInput.entityType, 'security_event');
  assert.equal(auditInput.entityId, 'GET /api/patients/detail');
  assert.equal(auditInput.action, 'auth_failed');
  assert.deepEqual(auditInput.metadata, {
    method: 'GET',
    path: '/api/patients/detail',
    status: 401,
    error: 'Authorization header is required',
    oidcSubject: null,
    role: undefined,
  });
});

test('audits role authorization failures as security events', async () => {
  const auditInputs: AuditLogInput[] = [];
  const api = createEmrApi(
    makeDeps({
      apiToken: 'expected-token',
      async createAuditLog(input) {
        auditInputs.push(input);
        return { id: 'audit-1' };
      },
    })
  );

  const response = await api({
    method: 'GET',
    path: '/api/users',
    headers: {
      authorization: 'Bearer expected-token',
      'x-user-id': 'user-1',
      'x-practitioner-id': 'practitioner-1',
      'x-user-role': 'nurse',
    },
    query: { clinicId: 'clinic-1' },
  });

  assert.equal(response.status, 403);
  assert.equal(auditInputs.length, 1);
  const auditInput = auditInputs[0];
  assert.equal(auditInput.entityType, 'security_event');
  assert.equal(auditInput.entityId, 'GET /api/users');
  assert.equal(auditInput.action, 'authorization_failed');
  assert.equal(auditInput.actorUserId, 'user-1');
  assert.equal(auditInput.actorPractitionerId, 'practitioner-1');
  assert.deepEqual(auditInput.metadata, {
    method: 'GET',
    path: '/api/users',
    status: 403,
    error: 'Role nurse is not allowed for user_read',
    oidcSubject: null,
    role: 'nurse',
  });
});

test('POST /api/invoices creates invoice and writes audit log', async () => {
  let invoiceInput: unknown;
  const auditInputs: AuditLogInput[] = [];
  const api = createEmrApi(
    makeDeps({
      apiToken: 'expected-token',
      async createInvoice(input) {
        invoiceInput = input;
        return {
          id: 'invoice-1',
          clinic_id: input.clinicId,
          patient_id: input.patientId,
          invoice_number: input.invoiceNumber,
          total_amount: '850.00',
          line_items: [{ id: 'line-1', description: input.lineItems[0].description }],
          payments: [],
        };
      },
      async createAuditLog(input) {
        auditInputs.push(input);
        return { id: 'audit-1' };
      },
    })
  );

  const response = await api({
    method: 'POST',
    path: '/api/invoices',
    headers: {
      authorization: 'Bearer expected-token',
      'x-user-id': 'admin-1',
      'x-user-role': 'admin',
    },
    body: {
      clinicId: 'clinic-1',
      patientId: 'patient-1',
      invoiceNumber: 'INV-001',
      lineItems: [
        {
          itemType: 'visit',
          description: 'Doctor visit',
          quantity: 1,
          unitPriceAmount: 800,
          discountAmount: 0,
          taxAmount: 50,
        },
      ],
    },
  });

  assert.equal(response.status, 201);
  assert.deepEqual(invoiceInput, {
    clinicId: 'clinic-1',
    patientId: 'patient-1',
    appointmentId: undefined,
    visitId: undefined,
    encounterId: undefined,
    invoiceNumber: 'INV-001',
    status: undefined,
    currency: undefined,
    issuedAt: undefined,
    dueAt: undefined,
    notes: undefined,
    lineItems: [
      {
        itemType: 'visit',
        description: 'Doctor visit',
        referenceType: undefined,
        referenceId: undefined,
        quantity: 1,
        unitPriceAmount: 800,
        discountAmount: 0,
        taxAmount: 50,
      },
    ],
  });
  assert.equal(auditInputs[0].entityType, 'invoice');
  assert.equal(auditInputs[0].action, 'created');
});

test('POST /api/invoices/:id/payments records payment and writes audit log', async () => {
  let paymentInput: unknown;
  const auditInputs: AuditLogInput[] = [];
  const api = createEmrApi(
    makeDeps({
      apiToken: 'expected-token',
      async recordInvoicePayment(input) {
        paymentInput = input;
        return {
          id: input.invoiceId,
          status: 'partially_paid',
          paid_amount: input.amount,
          balance_amount: '600.00',
          line_items: [],
          payments: [{ id: 'payment-1', payment_number: input.paymentNumber }],
        };
      },
      async createAuditLog(input) {
        auditInputs.push(input);
        return { id: 'audit-1' };
      },
    })
  );

  const response = await api({
    method: 'POST',
    path: '/api/invoices/invoice-1/payments',
    headers: {
      authorization: 'Bearer expected-token',
      'x-user-id': 'admin-1',
      'x-user-role': 'admin',
    },
    body: {
      paymentNumber: 'PAY-001',
      method: 'cash',
      amount: 400,
    },
  });

  assert.equal(response.status, 200);
  assert.deepEqual(paymentInput, {
    invoiceId: 'invoice-1',
    paymentNumber: 'PAY-001',
    method: 'cash',
    amount: 400,
    paidAt: undefined,
    receivedByUserId: undefined,
    referenceNumber: undefined,
    notes: undefined,
  });
  assert.equal(auditInputs[0].entityType, 'invoice');
  assert.equal(auditInputs[0].action, 'payment_recorded');
});

test('session bearer token resolves actor without role headers', async () => {
  const sessionSecret = '0123456789abcdef0123456789abcdef';
  const accessToken = createSessionToken(
    {
      userId: 'user-1',
      issuedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 60_000).toISOString(),
    },
    sessionSecret
  );

  const api = createEmrApi(
    makeDeps({
      sessionAuthSecret: sessionSecret,
      async resolveActor(input) {
        assert.deepEqual(input, { userId: 'user-1' });
        return {
          user_id: 'user-1',
          role: 'doctor',
          practitioner_id: 'practitioner-1',
          clinic_id: 'clinic-1',
          display_name: 'Dr One',
        };
      },
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
          created_at: '2026-05-25T10:00:00.000Z',
          updated_at: '2026-05-25T10:00:00.000Z',
          flags: [],
          encounters: [],
        };
      },
    })
  );

  const response = await api({
    method: 'GET',
    path: '/api/patients/detail',
    headers: { authorization: `Bearer ${accessToken}` },
    query: { clinicId: 'clinic-1', medicalRecordNumber: 'MRN-001' },
  });

  assert.equal(response.status, 200);
});

test('OIDC bearer token resolves actor by subject without role headers', async () => {
  const oidcAuth = {
    issuer: 'https://id.example.test',
    audience: 'emr-core',
    hs256Secret: '0123456789abcdef0123456789abcdef',
  };
  const accessToken = createOidcTestToken(
    {
      iss: oidcAuth.issuer,
      aud: oidcAuth.audience,
      sub: 'oidc-user-1',
      exp: Math.floor(Date.now() / 1000) + 60,
    },
    oidcAuth.hs256Secret
  );

  const api = createEmrApi(
    makeDeps({
      oidcAuth,
      async resolveOidcActor(input) {
        assert.deepEqual(input, { oidcSubject: 'oidc-user-1' });
        return {
          user_id: 'user-1',
          role: 'doctor',
          practitioner_id: 'practitioner-1',
          clinic_id: 'clinic-1',
          display_name: 'Dr OIDC',
        };
      },
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
          created_at: '2026-05-25T10:00:00.000Z',
          updated_at: '2026-05-25T10:00:00.000Z',
          flags: [],
          encounters: [],
        };
      },
    })
  );

  const response = await api({
    method: 'GET',
    path: '/api/patients/detail',
    headers: { authorization: `Bearer ${accessToken}` },
    query: { clinicId: 'clinic-1', medicalRecordNumber: 'MRN-001' },
  });

  assert.equal(response.status, 200);
});

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
          flags: [],
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

test('POST /api/patients registers a new patient', async () => {
  const api = createEmrApi(
    makeDeps({
      async createPatient(input) {
        assert.equal(input.clinicId, 'clinic-1');
        assert.equal(input.medicalRecordNumber, 'MRN-002');
        assert.equal(input.firstName, 'John');
        assert.equal(input.lastName, 'Doe');
        assert.equal(input.sexAtBirth, 'male');
        return {
          id: 'patient-2',
          clinic_id: input.clinicId,
          medical_record_number: input.medicalRecordNumber,
          first_name: input.firstName,
          last_name: input.lastName,
          sex_at_birth: input.sexAtBirth,
        };
      },
    })
  );

  const response = await api({
    method: 'POST',
    path: '/api/patients',
    headers: { 'x-user-role': 'nurse', 'x-user-id': 'user-1' },
    body: {
      clinicId: 'clinic-1',
      medicalRecordNumber: 'MRN-002',
      firstName: 'John',
      lastName: 'Doe',
      sexAtBirth: 'male',
    },
  });

  assert.equal(response.status, 201);
  assert.deepEqual(response.body, {
    data: {
      id: 'patient-2',
      clinic_id: 'clinic-1',
      medical_record_number: 'MRN-002',
      first_name: 'John',
      last_name: 'Doe',
      sex_at_birth: 'male',
    },
  });
});

test('POST /api/patients validates required registration fields', async () => {
  const api = createEmrApi(makeDeps());

  const missingName = await api({
    method: 'POST',
    path: '/api/patients',
    headers: { 'x-user-role': 'nurse' },
    body: { clinicId: 'clinic-1', medicalRecordNumber: 'MRN-002', firstName: 'John' },
  });
  assert.equal(missingName.status, 400);

  const invalidSex = await api({
    method: 'POST',
    path: '/api/patients',
    headers: { 'x-user-role': 'nurse' },
    body: {
      clinicId: 'clinic-1',
      medicalRecordNumber: 'MRN-002',
      firstName: 'John',
      lastName: 'Doe',
      sexAtBirth: 'other',
    },
  });
  assert.equal(invalidSex.status, 400);
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
        return { id: 'appointment-1', status: 'confirmed' };
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

test('clinic visit queue APIs create, list, and update visit lifecycle', async () => {
  const api = createEmrApi(
    makeDeps({
      async listClinicQueue(input) {
        assert.equal(input.clinicId, 'clinic-1');
        assert.equal(input.status, 'waiting');
        assert.equal(input.practitionerId, 'practitioner-1');
        assert.equal(input.roomName, 'Room 1');
        assert.equal(input.limit, 10);
        return [{ id: 'visit-1', status: 'waiting' }];
      },
      async createClinicVisit(input) {
        assert.equal(input.visitNumber, 'VIS-001');
        assert.equal(input.status, 'waiting');
        return { id: 'visit-1', status: 'waiting' };
      },
      async updateClinicVisit(input) {
        assert.equal(input.visitId, 'visit-1');
        assert.equal(input.status, 'with_doctor');
        assert.equal(input.encounterId, 'encounter-1');
        return { id: 'visit-1', status: 'with_doctor', encounter_id: 'encounter-1' };
      },
    })
  );

  const list = await api({
    method: 'GET',
    path: '/api/queue',
    headers: { 'x-user-role': 'nurse' },
    query: {
      clinicId: 'clinic-1',
      status: 'waiting',
      practitionerId: 'practitioner-1',
      roomName: 'Room 1',
      limit: '10',
    },
  });
  assert.equal(list.status, 200);
  assert.deepEqual(list.body, { data: [{ id: 'visit-1', status: 'waiting' }] });

  const created = await api({
    method: 'POST',
    path: '/api/visits',
    headers: { 'x-user-role': 'nurse', 'x-user-id': 'nurse-1' },
    body: {
      clinicId: 'clinic-1',
      patientId: 'patient-1',
      appointmentId: 'appointment-1',
      visitNumber: 'VIS-001',
      status: 'waiting',
    },
  });
  assert.equal(created.status, 201);

  const updated = await api({
    method: 'PATCH',
    path: '/api/visits/visit-1',
    headers: { 'x-user-role': 'doctor', 'x-user-id': 'doctor-1' },
    body: { encounterId: 'encounter-1', status: 'with_doctor' },
  });
  assert.equal(updated.status, 200);
});

test('clinical note template APIs list, create, and update clinic templates', async () => {
  const api = createEmrApi(
    makeDeps({
      async listClinicalNoteTemplates(input) {
        assert.equal(input.clinicId, 'clinic-1');
        assert.equal(input.active, true);
        return [{ id: 'template-1', title: 'URI', is_active: true }];
      },
      async createClinicalNoteTemplate(input) {
        assert.equal(input.clinicId, 'clinic-1');
        assert.equal(input.templateKey, 'uri');
        return { id: 'template-1', template_key: 'uri', title: input.title };
      },
      async updateClinicalNoteTemplate(input) {
        assert.equal(input.templateId, 'template-1');
        assert.equal(input.isActive, false);
        return { id: 'template-1', title: 'URI', is_active: false };
      },
    })
  );

  const list = await api({
    method: 'GET',
    path: '/api/clinical-note-templates',
    headers: { 'x-user-role': 'doctor' },
    query: { clinicId: 'clinic-1', active: 'true' },
  });
  assert.equal(list.status, 200);
  assert.deepEqual(list.body, {
    data: [{ id: 'template-1', title: 'URI', is_active: true }],
  });

  const created = await api({
    method: 'POST',
    path: '/api/clinical-note-templates',
    headers: { 'x-user-role': 'doctor', 'x-user-id': 'doctor-1' },
    body: {
      clinicId: 'clinic-1',
      templateKey: 'uri',
      title: 'URI',
      subjective: 'Cough',
    },
  });
  assert.equal(created.status, 201);

  const updated = await api({
    method: 'PATCH',
    path: '/api/clinical-note-templates/template-1',
    headers: { 'x-user-role': 'doctor', 'x-user-id': 'doctor-1' },
    body: { isActive: false },
  });
  assert.equal(updated.status, 200);
});

test('clinic settings and daily operations report APIs work', async () => {
  const api = createEmrApi(
    makeDeps({
      async getClinicSettings(input) {
        assert.equal(input.clinicId, 'clinic-1');
        return { clinic_id: 'clinic-1', display_name: 'Clinic' };
      },
      async upsertClinicSettings(input) {
        assert.equal(input.clinicId, 'clinic-1');
        assert.equal(input.displayName, 'Clinic Updated');
        assert.equal(input.logoFileAssetId, 'file-1');
        return { clinic_id: 'clinic-1', display_name: 'Clinic Updated', logo_file_asset_id: 'file-1' };
      },
      async getDailyOperationsReport(input) {
        assert.equal(input.clinicId, 'clinic-1');
        assert.equal(input.startDate, '2026-05-24');
        assert.equal(input.endDate, '2026-05-31');
        return {
          start_date: input.startDate,
          end_date: input.endDate,
          visits_total: 7,
          by_room: [{ room_name: 'Room A', visits: 2 }],
          by_prescriber: [{ prescribed_by_practitioner_id: 'doctor-1', prescriptions: 3 }],
        };
      },
      async getPharmacyOverrideReport(input) {
        assert.equal(input.clinicId, 'clinic-1');
        assert.equal(input.startDate, '2026-05-24');
        assert.equal(input.endDate, '2026-05-31');
        return {
          start_date: input.startDate,
          end_date: input.endDate,
          override_total: 2,
          by_event_type: [{ event_type: 'dispense', count: 1 }],
          by_item: [{ inventory_item_display_name: 'Amoxicillin', count: 2 }],
        };
      },
    })
  );

  const settings = await api({
    method: 'GET',
    path: '/api/clinics/clinic-1/settings',
    headers: { 'x-user-role': 'doctor' },
  });
  assert.equal(settings.status, 200);
  assert.deepEqual(settings.body, { data: { clinic_id: 'clinic-1', display_name: 'Clinic' } });

  const updated = await api({
    method: 'PATCH',
    path: '/api/clinics/clinic-1/settings',
    headers: { 'x-user-role': 'admin', 'x-user-id': 'admin-1' },
    body: { displayName: 'Clinic Updated', phoneNumber: '02', logoFileAssetId: 'file-1' },
  });
  assert.equal(updated.status, 200);

  const report = await api({
    method: 'GET',
    path: '/api/reports/daily-operations',
    headers: { 'x-user-role': 'admin' },
    query: { clinicId: 'clinic-1', startDate: '2026-05-24', endDate: '2026-05-31' },
  });
  assert.equal(report.status, 200);
  assert.deepEqual(report.body, {
    data: {
      start_date: '2026-05-24',
      end_date: '2026-05-31',
      visits_total: 7,
      by_room: [{ room_name: 'Room A', visits: 2 }],
      by_prescriber: [{ prescribed_by_practitioner_id: 'doctor-1', prescriptions: 3 }],
    },
  });

  const csv = await api({
    method: 'GET',
    path: '/api/reports/daily-operations.csv',
    headers: { 'x-user-role': 'admin' },
    query: { clinicId: 'clinic-1', startDate: '2026-05-24', endDate: '2026-05-31' },
  });
  assert.equal(csv.status, 200);
  assert.match(csv.body as string, /visits_total,7/);
  assert.match(csv.body as string, /by_room:Room A,2/);
  assert.match(csv.body as string, /by_prescriber:doctor-1,3/);

  const overrideReport = await api({
    method: 'GET',
    path: '/api/reports/pharmacy-overrides',
    headers: { 'x-user-role': 'admin' },
    query: { clinicId: 'clinic-1', startDate: '2026-05-24', endDate: '2026-05-31' },
  });
  assert.equal(overrideReport.status, 200);
  assert.deepEqual(overrideReport.body, {
    data: {
      start_date: '2026-05-24',
      end_date: '2026-05-31',
      override_total: 2,
      by_event_type: [{ event_type: 'dispense', count: 1 }],
      by_item: [{ inventory_item_display_name: 'Amoxicillin', count: 2 }],
    },
  });

  const overrideCsv = await api({
    method: 'GET',
    path: '/api/reports/pharmacy-overrides.csv',
    headers: { 'x-user-role': 'admin' },
    query: { clinicId: 'clinic-1', startDate: '2026-05-24', endDate: '2026-05-31' },
  });
  assert.equal(overrideCsv.status, 200);
  assert.match(overrideCsv.body as string, /override_total,2/);
  assert.match(overrideCsv.body as string, /by_event_type:dispense,1/);
  assert.match(overrideCsv.body as string, /by_item:Amoxicillin,2/);
});

test('appointments API rejects unsupported status transitions', async () => {
  let updateCalled = false;
  const api = createEmrApi(
    makeDeps({
      async getAppointmentById(input) {
        assert.equal(input.appointmentId, 'appointment-1');
        return { id: 'appointment-1', status: 'pending' };
      },
      async updateAppointment() {
        updateCalled = true;
        return { id: 'appointment-1' };
      },
    })
  );

  const response = await api({
    method: 'PATCH',
    path: '/api/appointments/appointment-1',
    headers: { 'x-user-role': 'doctor', 'x-user-id': 'user-1' },
    body: { status: 'checked_in' },
  });

  assert.equal(response.status, 409);
  assert.equal(updateCalled, false);
});

test('encounter APIs read, update, and reject unsupported status transitions', async () => {
  let updateCalled = false;
  const api = createEmrApi(
    makeDeps({
      async getEncounterById(input) {
        assert.equal(input.encounterId, 'encounter-1');
        return { id: 'encounter-1', status: 'in_progress' };
      },
      async updateEncounter(input) {
        updateCalled = true;
        assert.equal(input.encounterId, 'encounter-1');
        assert.equal(input.status, 'completed');
        return { id: 'encounter-1', status: 'completed' };
      },
    })
  );

  const read = await api({
    method: 'GET',
    path: '/api/encounters/encounter-1',
    headers: { 'x-user-role': 'doctor' },
  });
  assert.equal(read.status, 200);

  const update = await api({
    method: 'PATCH',
    path: '/api/encounters/encounter-1',
    headers: { 'x-user-role': 'doctor', 'x-user-id': 'user-1' },
    body: { status: 'completed' },
  });
  assert.equal(update.status, 200);
  assert.equal(updateCalled, true);

  updateCalled = false;
  const invalid = await api({
    method: 'PATCH',
    path: '/api/encounters/encounter-1',
    headers: { 'x-user-role': 'doctor', 'x-user-id': 'user-1' },
    body: { status: 'signed' },
  });
  assert.equal(invalid.status, 409);
  assert.equal(updateCalled, false);
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
      async listFileAssets(input) {
        assert.equal(input.clinicId, 'clinic-1');
        assert.equal(input.search, 'logo');
        assert.equal(input.limit, 1);
        assert.equal(input.offset, 0);
        return {
          rows: [{ id: 'file-1', clinic_id: input.clinicId, original_filename: 'logo.png' }],
          meta: { limit: 1, offset: 0, hasMore: false, nextOffset: null },
        };
      },
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
      async uploadFileAsset(input) {
        assert.equal(input.storageKey, 'uploads/logo.png');
        assert.equal(input.contentBase64, Buffer.from('logo').toString('base64'));
        return { id: 'file-2', storage_key: input.storageKey, byte_size: 4 };
      },
      async downloadFileAssetContent(input) {
        assert.equal(input.fileAssetId, 'file-2');
        return { content: Buffer.from('logo'), mimeType: 'image/png' };
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

  const fileAssets = await api({
    method: 'GET',
    path: '/api/file-assets',
    headers: { 'x-user-role': 'doctor' },
    query: { clinicId: 'clinic-1', search: 'logo', limit: '1', offset: '0' },
  });
  assert.equal(fileAssets.status, 200);
  assert.deepEqual(fileAssets.body, {
    data: [{ id: 'file-1', clinic_id: 'clinic-1', original_filename: 'logo.png' }],
    meta: { limit: 1, offset: 0, hasMore: false, nextOffset: null },
  });

  const storagePolicy = await api({
    method: 'GET',
    path: '/api/file-assets/storage-policy',
    headers: { 'x-user-role': 'doctor' },
  });
  assert.equal(storagePolicy.status, 200);
  assert.deepEqual(storagePolicy.body, {
    data: { driver: 'local', maxUploadBytes: 1024, allowedMimeTypes: ['image/png'] },
  });

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

  const uploadedFile = await api({
    method: 'POST',
    path: '/api/file-assets/upload',
    headers: { 'x-user-role': 'admin', 'x-user-id': 'user-1' },
    body: {
      clinicId: 'clinic-1',
      storageKey: 'uploads/logo.png',
      originalFilename: 'logo.png',
      mimeType: 'image/png',
      byteSize: 4,
      contentBase64: Buffer.from('logo').toString('base64'),
    },
  });
  assert.equal(uploadedFile.status, 201);

  const downloadedFile = await api({
    method: 'GET',
    path: '/api/file-assets/file-2/download',
    headers: { 'x-user-role': 'doctor' },
  });
  assert.equal(downloadedFile.status, 200);
  assert.equal((downloadedFile.body as Buffer).toString('utf8'), 'logo');
  assert.equal(downloadedFile.headers?.['content-type'], 'image/png');

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

  const missingClinic = await api({
    method: 'GET',
    path: '/api/file-assets',
    headers: { 'x-user-role': 'doctor' },
  });
  assert.equal(missingClinic.status, 400);

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

test('patient medication APIs work and enforce roles', async () => {
  const api = createEmrApi(
    makeDeps({
      async listPatientMedications(input) {
        assert.equal(input.patientId, 'patient-1');
        assert.equal(input.status, 'active');
        return [{ id: 'medication-1' }];
      },
      async getPatientMedicationById(input) {
        assert.equal(input.medicationId, 'medication-1');
        return { id: 'medication-1' };
      },
      async createPatientMedication(input) {
        assert.equal(input.patientId, 'patient-1');
        assert.equal(input.medicationName, 'Metformin');
        return { id: 'medication-1' };
      },
      async updatePatientMedication(input) {
        assert.equal(input.medicationId, 'medication-1');
        assert.equal(input.status, 'completed');
        return { id: 'medication-1' };
      },
    })
  );

  const list = await api({
    method: 'GET',
    path: '/api/patients/patient-1/medications',
    headers: { 'x-user-role': 'doctor' },
    query: { status: 'active' },
  });
  assert.equal(list.status, 200);

  const getOne = await api({
    method: 'GET',
    path: '/api/patient-medications/medication-1',
    headers: { 'x-user-role': 'nurse' },
  });
  assert.equal(getOne.status, 200);

  const create = await api({
    method: 'POST',
    path: '/api/patient-medications',
    headers: { 'x-user-role': 'nurse', 'x-user-id': 'user-1' },
    body: { patientId: 'patient-1', medicationName: 'Metformin', status: 'active' },
  });
  assert.equal(create.status, 201);

  const update = await api({
    method: 'PATCH',
    path: '/api/patient-medications/medication-1',
    headers: { 'x-user-role': 'doctor', 'x-user-id': 'user-1' },
    body: { status: 'completed' },
  });
  assert.equal(update.status, 200);

  const remove = await api({
    method: 'DELETE',
    path: '/api/patient-medications/medication-1',
    headers: { 'x-user-role': 'doctor', 'x-user-id': 'user-1' },
  });
  assert.equal(remove.status, 200);
});

test('patient medication APIs validate bad payloads and filters', async () => {
  const api = createEmrApi(makeDeps());

  const invalidListStatus = await api({
    method: 'GET',
    path: '/api/patients/patient-1/medications',
    headers: { 'x-user-role': 'doctor' },
    query: { status: 'paused' },
  });
  assert.equal(invalidListStatus.status, 400);

  const invalidCreate = await api({
    method: 'POST',
    path: '/api/patient-medications',
    headers: { 'x-user-role': 'doctor' },
    body: { patientId: 'patient-1' },
  });
  assert.equal(invalidCreate.status, 400);

  const invalidPatch = await api({
    method: 'PATCH',
    path: '/api/patient-medications/medication-1',
    headers: { 'x-user-role': 'doctor' },
    body: {},
  });
  assert.equal(invalidPatch.status, 400);
});

test('patient flag APIs work and enforce roles', async () => {
  const api = createEmrApi(
    makeDeps({
      async listPatientFlags(input) {
        assert.equal(input.patientId, 'patient-1');
        assert.equal(input.status, 'active');
        assert.equal(input.severity, 'critical');
        return [{ id: 'flag-1', label: 'Fall risk' }];
      },
      async getPatientFlagById(input) {
        assert.equal(input.flagId, 'flag-1');
        return { id: 'flag-1', label: 'Fall risk' };
      },
      async createPatientFlag(input) {
        assert.equal(input.patientId, 'patient-1');
        assert.equal(input.flagType, 'fall_risk');
        assert.equal(input.label, 'Fall risk');
        assert.equal(input.createdByUserId, 'user-1');
        return { id: 'flag-1', label: 'Fall risk' };
      },
      async updatePatientFlag(input) {
        assert.equal(input.flagId, 'flag-1');
        assert.equal(input.status, 'resolved');
        return { id: 'flag-1', status: 'resolved' };
      },
    })
  );

  const list = await api({
    method: 'GET',
    path: '/api/patients/patient-1/flags',
    headers: { 'x-user-role': 'doctor' },
    query: { status: 'active', severity: 'critical' },
  });
  assert.equal(list.status, 200);

  const getOne = await api({
    method: 'GET',
    path: '/api/patient-flags/flag-1',
    headers: { 'x-user-role': 'nurse' },
  });
  assert.equal(getOne.status, 200);

  const create = await api({
    method: 'POST',
    path: '/api/patient-flags',
    headers: { 'x-user-role': 'nurse', 'x-user-id': 'user-1' },
    body: {
      patientId: 'patient-1',
      flagType: 'fall_risk',
      label: 'Fall risk',
      severity: 'critical',
    },
  });
  assert.equal(create.status, 201);

  const update = await api({
    method: 'PATCH',
    path: '/api/patient-flags/flag-1',
    headers: { 'x-user-role': 'doctor', 'x-user-id': 'user-1' },
    body: { status: 'resolved' },
  });
  assert.equal(update.status, 200);

  const remove = await api({
    method: 'DELETE',
    path: '/api/patient-flags/flag-1',
    headers: { 'x-user-role': 'admin', 'x-user-id': 'user-1' },
  });
  assert.equal(remove.status, 200);
});

test('patient flag APIs validate bad payloads and filters', async () => {
  const api = createEmrApi(makeDeps());

  const invalidListStatus = await api({
    method: 'GET',
    path: '/api/patients/patient-1/flags',
    headers: { 'x-user-role': 'doctor' },
    query: { status: 'pending' },
  });
  assert.equal(invalidListStatus.status, 400);

  const invalidListSeverity = await api({
    method: 'GET',
    path: '/api/patients/patient-1/flags',
    headers: { 'x-user-role': 'doctor' },
    query: { severity: 'emergency' },
  });
  assert.equal(invalidListSeverity.status, 400);

  const invalidCreate = await api({
    method: 'POST',
    path: '/api/patient-flags',
    headers: { 'x-user-role': 'doctor' },
    body: { patientId: 'patient-1', label: 'Missing type' },
  });
  assert.equal(invalidCreate.status, 400);

  const invalidPatch = await api({
    method: 'PATCH',
    path: '/api/patient-flags/flag-1',
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

test('pharmacy FEFO and expiry overrides require admin override permission', async () => {
  let dispenseCalls = 0;
  const api = createEmrApi(
    makeDeps({
      async dispensePrescription(input) {
        dispenseCalls += 1;
        return {
          id: `dispense-${dispenseCalls}`,
          prescription_id: input.prescriptionId,
          inventory_item_id: input.inventoryItemId,
          inventory_lot_id: input.inventoryLotId ?? null,
          quantity: input.quantity,
          fefo_override_reason: input.fefoOverrideReason ?? null,
          expiry_override_reason: input.expiryOverrideReason ?? null,
        };
      },
    })
  );

  const normalDoctorDispense = await api({
    method: 'POST',
    path: '/api/prescriptions/prescription-1/dispenses',
    headers: { 'x-user-role': 'doctor' },
    body: { inventoryItemId: 'inventory-item-1', quantity: 1 },
  });
  assert.equal(normalDoctorDispense.status, 201);
  assert.equal(dispenseCalls, 1);

  const overrideDoctorDispense = await api({
    method: 'POST',
    path: '/api/prescriptions/prescription-1/dispenses',
    headers: { 'x-user-role': 'doctor' },
    body: {
      inventoryItemId: 'inventory-item-1',
      quantity: 1,
      fefoOverrideReason: 'Doctor tried to bypass FEFO',
    },
  });
  assert.equal(overrideDoctorDispense.status, 403);
  assert.deepEqual(overrideDoctorDispense.body, {
    error: 'Role doctor is not allowed for pharmacy_override_write',
  });
  assert.equal(dispenseCalls, 1);

  const overrideAdminDispense = await api({
    method: 'POST',
    path: '/api/prescriptions/prescription-1/dispenses',
    headers: { 'x-user-role': 'admin' },
    body: {
      inventoryItemId: 'inventory-item-1',
      quantity: 1,
      expiryOverrideReason: 'Admin approved expired stock use',
    },
  });
  assert.equal(overrideAdminDispense.status, 201);
  assert.equal(dispenseCalls, 2);
});

test('inventory transfer actions use separated approve receive and cancel permissions', async () => {
  const api = createEmrApi(
    makeDeps({
      async approveInventoryTransfer(input) {
        assert.equal(input.transferId, 'transfer-1');
        return { id: 'transfer-1', status: 'in_transit', approved_by_user_id: input.approvedByUserId };
      },
      async receiveInventoryTransfer(input) {
        assert.equal(input.transferId, 'transfer-1');
        return { id: 'transfer-1', status: 'completed', received_by_user_id: input.receivedByUserId };
      },
      async cancelInventoryTransfer(input) {
        assert.equal(input.transferId, 'transfer-1');
        return {
          id: 'transfer-1',
          status: 'cancelled',
          cancelled_by_user_id: input.cancelledByUserId,
          cancellation_reason: input.cancellationReason,
        };
      },
    })
  );

  const nurseApprove = await api({
    method: 'POST',
    path: '/api/inventory-transfers/transfer-1/approve',
    headers: { 'x-user-role': 'nurse' },
    body: { approvedByUserId: 'user-1' },
  });
  assert.equal(nurseApprove.status, 403);
  assert.deepEqual(nurseApprove.body, {
    error: 'Role nurse is not allowed for inventory_transfer_approve',
  });

  const adminApprove = await api({
    method: 'POST',
    path: '/api/inventory-transfers/transfer-1/approve',
    headers: { 'x-user-role': 'admin' },
    body: { approvedByUserId: 'user-1' },
  });
  assert.equal(adminApprove.status, 200);

  const nurseReceive = await api({
    method: 'POST',
    path: '/api/inventory-transfers/transfer-1/receive',
    headers: { 'x-user-role': 'nurse' },
    body: { receivedByUserId: 'user-2' },
  });
  assert.equal(nurseReceive.status, 200);

  const nurseCancel = await api({
    method: 'POST',
    path: '/api/inventory-transfers/transfer-1/cancel',
    headers: { 'x-user-role': 'nurse' },
    body: { cancelledByUserId: 'user-2', cancellationReason: 'Wrong destination' },
  });
  assert.equal(nurseCancel.status, 403);
  assert.deepEqual(nurseCancel.body, {
    error: 'Role nurse is not allowed for inventory_transfer_cancel',
  });

  const adminCancel = await api({
    method: 'POST',
    path: '/api/inventory-transfers/transfer-1/cancel',
    headers: { 'x-user-role': 'admin' },
    body: { cancelledByUserId: 'user-1', cancellationReason: 'Wrong destination' },
  });
  assert.equal(adminCancel.status, 200);
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
      async getAuditLogsByEntity(input) {
        assert.equal(input.limit, 5);
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
    query: { entityType: 'clinical_note', entityId: 'clinical-note-1', limit: '5' },
  });
  assert.equal(audit.status, 200);

  const timeline = await api({
    method: 'GET',
    path: '/api/patients/patient-1/timeline',
    headers: { 'x-user-role': 'nurse' },
  });
  assert.equal(timeline.status, 200);
});

test('user and practitioner write routes map duplicate database errors to conflict responses', async () => {
  const duplicate = Object.assign(new Error('duplicate key value violates unique constraint'), {
    code: '23505',
    detail: 'Key (clinic_id, username)=(clinic-1, doc1) already exists.',
  });
  const api = createEmrApi(
    makeDeps({
      async createUser() {
        throw duplicate;
      },
      async createPractitioner() {
        throw duplicate;
      },
    })
  );

  const user = await api({
    method: 'POST',
    path: '/api/users',
    headers: { 'x-user-role': 'admin', 'x-user-id': 'admin-1' },
    body: { clinicId: 'clinic-1', username: 'doc1', displayName: 'Doc 1', role: 'doctor' },
  });
  assert.equal(user.status, 409);
  assert.deepEqual(user.body, {
    error: 'Duplicate record',
    detail: 'Key (clinic_id, username)=(clinic-1, doc1) already exists.',
  });

  const practitioner = await api({
    method: 'POST',
    path: '/api/practitioners',
    headers: { 'x-user-role': 'admin', 'x-user-id': 'admin-1' },
    body: {
      clinicId: 'clinic-1',
      practitionerCode: 'DOC1',
      firstName: 'Doc',
      lastName: 'One',
    },
  });
  assert.equal(practitioner.status, 409);
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
          flags: [],
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
        assert.equal(input.search, 'doc');
        assert.equal(input.active, 'active');
        assert.equal(input.limit, 10);
        assert.equal(input.offset, 5);
        return {
          rows: [{ id: 'user-1' }],
          meta: { limit: 10, offset: 5, hasMore: false, nextOffset: null },
        };
      },
      async createUser(input) {
        assert.equal(input.role, 'doctor');
        return { id: 'user-1' };
      },
      async listPractitioners() {
        return {
          rows: [{ id: 'practitioner-1' }],
          meta: { limit: 50, offset: 0, hasMore: false, nextOffset: null },
        };
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
    query: { clinicId: 'clinic-1', search: 'doc', active: 'active', limit: '10', offset: '5' },
  });
  assert.equal(listUsers.status, 200);
  assert.deepEqual(listUsers.body, {
    data: [{ id: 'user-1' }],
    meta: { limit: 10, offset: 5, hasMore: false, nextOffset: null },
  });

  const createUser = await api({
    method: 'POST',
    path: '/api/users',
    headers: { 'x-user-role': 'admin', 'x-user-id': 'admin-1' },
    body: {
      clinicId: 'clinic-1',
      username: 'doc1',
      displayName: 'Doc 1',
      role: 'doctor',
      oidcSubject: 'oidc:doc1',
    },
  });
  assert.equal(createUser.status, 201);

  const listPractitioners = await api({
    method: 'GET',
    path: '/api/practitioners',
    headers: { 'x-user-role': 'doctor' },
    query: { clinicId: 'clinic-1' },
  });
  assert.equal(listPractitioners.status, 200);
  assert.deepEqual(listPractitioners.body, {
    data: [{ id: 'practitioner-1' }],
    meta: { limit: 50, offset: 0, hasMore: false, nextOffset: null },
  });

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

test('PATCH /api/users preserves omitted role field', async () => {
  const api = createEmrApi(
    makeDeps({
      async updateUser(input) {
        assert.equal(input.userId, 'user-1');
        assert.equal(input.displayName, 'Updated User');
        assert.equal(input.isActive, false);
        assert.equal(input.oidcSubject, 'oidc:updated');
        assert.equal(Object.hasOwn(input, 'role'), false);
        return {
          id: 'user-1',
          display_name: 'Updated User',
          oidc_subject: 'oidc:updated',
          is_active: false,
        };
      },
    })
  );

  const response = await api({
    method: 'PATCH',
    path: '/api/users/user-1',
    headers: { 'x-user-role': 'admin', 'x-user-id': 'user-1' },
    body: { displayName: 'Updated User', isActive: false, oidcSubject: 'oidc:updated' },
  });

  assert.equal(response.status, 200);
});

test('drug catalog and prescription safety APIs enforce safety workflow', async () => {
  const api = createEmrApi(
    makeDeps({
      async listDrugCatalog(input) {
        assert.equal(input.clinicId, 'clinic-1');
        assert.equal(input.search, 'amox');
        return {
          rows: [{ id: 'drug-1', medication_name: 'Amoxicillin' }],
          meta: { limit: 50, offset: 0, hasMore: false, nextOffset: null },
        };
      },
      async createDrugCatalogItem(input) {
        assert.deepEqual(input.allergenTags, ['penicillin']);
        return { id: 'drug-1', medication_name: input.medicationName };
      },
      async updateDrugCatalogItem(input) {
        assert.equal(input.drugCatalogId, 'drug-1');
        assert.equal(input.isActive, false);
        return { id: 'drug-1', is_active: false };
      },
      async listDrugInteractionRules(input) {
        assert.equal(input.clinicId, 'clinic-1');
        return {
          rows: [{ id: 'rule-1', severity: 'critical' }],
          meta: { limit: 50, offset: 0, hasMore: false, nextOffset: null },
        };
      },
      async createDrugInteractionRule(input) {
        assert.equal(input.primaryRxnormCode, 'RX-WARFARIN');
        assert.equal(input.interactingMedicationName, 'Ibuprofen');
        return { id: 'rule-1', severity: input.severity };
      },
      async updateDrugInteractionRule(input) {
        assert.equal(input.interactionRuleId, 'rule-1');
        assert.equal(input.isActive, false);
        return { id: 'rule-1', is_active: false };
      },
      async assessPrescriptionSafety(input) {
        assert.equal(input.patientId, 'patient-1');
        assert.equal(input.medicationName, 'Amoxicillin');
        return {
          checkedAt: '2026-05-25T00:00:00.000Z',
          drugCatalogId: input.drugCatalogId ?? 'drug-1',
          warnings: [
            {
              type: 'allergy',
              severity: 'critical',
              message: 'Patient has active allergy to Penicillin',
              allergyId: 'allergy-1',
              allergenName: 'Penicillin',
              medicationName: 'Amoxicillin',
              matchedOn: 'penicillin',
            },
          ],
        };
      },
      async getEncounterById() {
        return { id: 'encounter-1', patient_id: 'patient-1' };
      },
      async createPrescription(input) {
        assert.equal(input.drugCatalogId, 'drug-1');
        assert.equal(input.safetyWarnings?.length, 1);
        assert.equal(input.safetyOverrideReason, 'Known allergy reviewed');
        assert.ok(input.safetyOverriddenAt);
        return {
          id: 'prescription-1',
          drug_catalog_id: input.drugCatalogId,
          safety_warnings: input.safetyWarnings,
          safety_override_reason: input.safetyOverrideReason,
        };
      },
    })
  );

  const listCatalog = await api({
    method: 'GET',
    path: '/api/drug-catalog',
    headers: { 'x-user-role': 'doctor' },
    query: { clinicId: 'clinic-1', search: 'amox' },
  });
  assert.equal(listCatalog.status, 200);

  const createCatalog = await api({
    method: 'POST',
    path: '/api/drug-catalog',
    headers: { 'x-user-role': 'admin', 'x-user-id': 'admin-1' },
    body: {
      clinicId: 'clinic-1',
      medicationName: 'Amoxicillin',
      allergenTags: ['penicillin'],
    },
  });
  assert.equal(createCatalog.status, 201);

  const updateCatalog = await api({
    method: 'PATCH',
    path: '/api/drug-catalog/drug-1',
    headers: { 'x-user-role': 'admin', 'x-user-id': 'admin-1' },
    body: { isActive: false },
  });
  assert.equal(updateCatalog.status, 200);

  const listRules = await api({
    method: 'GET',
    path: '/api/drug-interaction-rules',
    headers: { 'x-user-role': 'doctor' },
    query: { clinicId: 'clinic-1' },
  });
  assert.equal(listRules.status, 200);

  const createRule = await api({
    method: 'POST',
    path: '/api/drug-interaction-rules',
    headers: { 'x-user-role': 'admin', 'x-user-id': 'admin-1' },
    body: {
      clinicId: 'clinic-1',
      primaryRxnormCode: 'RX-WARFARIN',
      interactingMedicationName: 'Ibuprofen',
      severity: 'critical',
      description: 'Bleeding risk',
    },
  });
  assert.equal(createRule.status, 201);

  const updateRule = await api({
    method: 'PATCH',
    path: '/api/drug-interaction-rules/rule-1',
    headers: { 'x-user-role': 'admin', 'x-user-id': 'admin-1' },
    body: { isActive: false },
  });
  assert.equal(updateRule.status, 200);

  const check = await api({
    method: 'POST',
    path: '/api/prescription-safety-checks',
    headers: { 'x-user-role': 'doctor' },
    body: { patientId: 'patient-1', medicationName: 'Amoxicillin', drugCatalogId: 'drug-1' },
  });
  assert.equal(check.status, 200);
  assert.equal((check.body as { data: { warnings: unknown[] } }).data.warnings.length, 1);

  const createPrescription = await api({
    method: 'POST',
    path: '/api/prescriptions',
    headers: { 'x-user-role': 'doctor', 'x-practitioner-id': 'practitioner-1' },
    body: {
      encounterId: 'encounter-1',
      medicationName: 'Amoxicillin',
      drugCatalogId: 'drug-1',
      safetyOverrideReason: 'Known allergy reviewed',
    },
  });
  assert.equal(createPrescription.status, 201);
  assert.equal(
    (createPrescription.body as { data: { safety_warnings: unknown[] } }).data.safety_warnings
      .length,
    1
  );

  const missingOverride = await api({
    method: 'POST',
    path: '/api/prescriptions',
    headers: { 'x-user-role': 'doctor', 'x-practitioner-id': 'practitioner-1' },
    body: { encounterId: 'encounter-1', medicationName: 'Amoxicillin', drugCatalogId: 'drug-1' },
  });
  assert.equal(missingOverride.status, 409);
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

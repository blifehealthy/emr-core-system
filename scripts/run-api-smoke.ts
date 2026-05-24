import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { request as httpRequest } from 'node:http';
import assert from 'node:assert/strict';

const ROOT_DIR = process.cwd();
const MIGRATIONS_DIR = join(ROOT_DIR, 'database', 'migrations');
const SEED_SQL = join(ROOT_DIR, 'database', 'tests', 'api_smoke_seed.sql');
const PORT = Number(process.env.API_PORT ?? '3105');
const FRONTEND_PORT = Number(process.env.FRONTEND_PORT ?? '5175');
const API_TOKEN = process.env.API_TOKEN ?? 'dev-smoke-token';

const POSTGRES_CONTAINER = process.env.POSTGRES_CONTAINER ?? 'poolproject-postgres';
const POSTGRES_USER = process.env.POSTGRES_USER ?? 'postgres';
const POSTGRES_PASSWORD = process.env.POSTGRES_PASSWORD ?? 'postgres';
const POSTGRES_HOST = process.env.POSTGRES_HOST ?? '127.0.0.1';
const POSTGRES_PORT = process.env.POSTGRES_PORT ?? '5432';
const TEMP_DB = process.env.POSTGRES_DB ?? `emr_core_api_smoke_${randomUUID().replace(/-/g, '')}`;

const migrations = [
  '0000_organization_clinic_foundation.up.sql',
  '0001_emr_core_foundation.up.sql',
  '0002_add_organization_clinic_foreign_keys.up.sql',
  '0003_add_diagnoses_and_vital_signs.up.sql',
  '0004_add_audit_logs.up.sql',
  '0005_add_users_and_practitioners.up.sql',
  '0006_add_prescriptions.up.sql',
  '0007_add_appointments.up.sql',
  '0008_add_consent_records.up.sql',
  '0009_add_file_attachments.up.sql',
  '0010_add_patient_conditions.up.sql',
  '0011_add_patient_medications.up.sql',
  '0012_add_patient_flags.up.sql',
  '0013_add_clinic_visits.up.sql',
  '0014_add_clinical_note_templates.up.sql',
  '0015_add_clinic_settings.up.sql',
  '0016_add_clinic_logo_asset.up.sql',
].map((filename) => join(MIGRATIONS_DIR, filename));

async function main() {
  const databaseUrl = buildDatabaseUrl(TEMP_DB);
  let serverProcess: ReturnType<typeof spawn> | null = null;
  let frontendProcess: ReturnType<typeof spawn> | null = null;

  try {
    dockerExec(['createdb', '-U', POSTGRES_USER, TEMP_DB]);

    for (const migration of migrations) {
      runSqlFile(migration);
    }

    runSqlFile(SEED_SQL);

    serverProcess = spawn(
      process.execPath,
      ['--loader', 'ts-node/esm', 'scripts/start-api.ts'],
      {
        cwd: ROOT_DIR,
        env: {
          ...process.env,
          DATABASE_URL: databaseUrl,
          API_TOKEN,
          PORT: String(PORT),
        },
        stdio: ['ignore', 'pipe', 'pipe'],
      }
    );

    const output: string[] = [];
    for (const stream of [serverProcess.stdout, serverProcess.stderr]) {
      stream?.on('data', (chunk) => {
        output.push(String(chunk));
      });
    }

    await waitForHealth();

    frontendProcess = spawn(
      process.execPath,
      ['--loader', 'ts-node/esm', 'scripts/start-frontend.ts'],
      {
        cwd: ROOT_DIR,
        env: {
          ...process.env,
          API_BASE_URL: `http://127.0.0.1:${PORT}`,
          FRONTEND_PORT: String(FRONTEND_PORT),
        },
        stdio: ['ignore', 'pipe', 'pipe'],
      }
    );

    for (const stream of [frontendProcess.stdout, frontendProcess.stderr]) {
      stream?.on('data', (chunk) => {
        output.push(String(chunk));
      });
    }

    await waitForFrontendHealth();

    const authHeaders = {
      Authorization: `Bearer ${API_TOKEN}`,
      'x-user-id': '10000000-0000-0000-0000-000000000201',
    };
    const adminHeaders = {
      Authorization: `Bearer ${API_TOKEN}`,
      'x-user-id': '10000000-0000-0000-0000-000000000202',
    };

    const registeredPatient = await requestJson<{
      id: string;
      clinic_id: string;
      medical_record_number: string;
      first_name: string;
      last_name: string;
      sex_at_birth: string;
    }>(
      '/api/patients',
      authHeaders,
      'POST',
      201,
      {
        clinicId: '10000000-0000-0000-0000-000000000101',
        medicalRecordNumber: 'MRN-SMOKE-002',
        firstName: 'John',
        lastName: 'Register',
        sexAtBirth: 'male',
        phoneNumber: '+66123456789',
      }
    );
    assert.equal(registeredPatient.data.clinic_id, '10000000-0000-0000-0000-000000000101');
    assert.equal(registeredPatient.data.medical_record_number, 'MRN-SMOKE-002');
    assert.equal(registeredPatient.data.first_name, 'John');
    assert.equal(registeredPatient.data.sex_at_birth, 'male');

    const patientDetail = await requestJson<{
      id: string;
      flags: Array<{ id: string; severity: string; status: string }>;
      encounters: Array<{
        prescriptions: Array<{ id: string }>;
      }>;
    }>(
      `/api/patients/detail?clinicId=10000000-0000-0000-0000-000000000101&medicalRecordNumber=MRN-SMOKE-001`,
      authHeaders
    );
    assert.equal(patientDetail.data.id, '10000000-0000-0000-0000-000000001001');
    assert.equal(patientDetail.data.flags.length, 1);
    assert.equal(patientDetail.data.flags[0].id, '10000000-0000-0000-0000-000000012001');
    assert.equal(patientDetail.data.flags[0].severity, 'critical');
    assert.equal(patientDetail.data.encounters[0].prescriptions.length, 3);
    assert.equal(patientDetail.data.encounters[0].prescriptions[0].id, '10000000-0000-0000-0000-000000006003');

    const diagnoses = await requestJson<Array<{ id: string }>>(
      '/api/encounters/10000000-0000-0000-0000-000000002001/diagnoses?clinicalNoteId=10000000-0000-0000-0000-000000003001&status=active&limit=1&offset=1',
      authHeaders
    );
    assert.deepEqual(diagnoses.meta, {
      limit: 1,
      offset: 1,
      hasMore: false,
      nextOffset: null,
    });
    assert.equal(diagnoses.data.length, 1);
    assert.equal(diagnoses.data[0].id, '10000000-0000-0000-0000-000000004003');

    const vitalSigns = await requestJson<Array<{ id: string }>>(
      '/api/encounters/10000000-0000-0000-0000-000000002001/vital-signs?clinicalNoteId=10000000-0000-0000-0000-000000003001&limit=1&offset=0',
      authHeaders
    );
    assert.deepEqual(vitalSigns.meta, {
      limit: 1,
      offset: 0,
      hasMore: true,
      nextOffset: 1,
    });
    assert.equal(vitalSigns.data[0].id, '10000000-0000-0000-0000-000000005003');

    const prescriptions = await requestJson<Array<{ id: string }>>(
      '/api/encounters/10000000-0000-0000-0000-000000002001/prescriptions?clinicalNoteId=10000000-0000-0000-0000-000000003001&status=active&limit=1&offset=0',
      authHeaders
    );
    assert.deepEqual(prescriptions.meta, {
      limit: 1,
      offset: 0,
      hasMore: true,
      nextOffset: 1,
    });
    assert.equal(prescriptions.data[0].id, '10000000-0000-0000-0000-000000006003');

    const updatedDiagnosis = await requestJson<{
      id: string;
      status: string;
      resolution_note: string | null;
    }>(
      '/api/diagnoses/10000000-0000-0000-0000-000000004003',
      authHeaders,
      'PATCH',
      200,
      {
        status: 'resolved',
        resolutionNote: 'Symptoms improved',
      }
    );
    assert.equal(updatedDiagnosis.data.id, '10000000-0000-0000-0000-000000004003');
    assert.equal(updatedDiagnosis.data.status, 'resolved');
    assert.equal(updatedDiagnosis.data.resolution_note, 'Symptoms improved');

    const createdDiagnosis = await requestJson<{
      id: string;
      diagnosis_name: string;
      status: string;
      sequence_number: number | null;
    }>(
      '/api/diagnoses',
      authHeaders,
      'POST',
      201,
      {
        encounterId: '10000000-0000-0000-0000-000000002001',
        clinicalNoteId: '10000000-0000-0000-0000-000000003001',
        diagnosisName: 'Allergic rhinitis',
        diagnosisType: 'working',
        status: 'active',
        sequenceNumber: 4,
      }
    );
    assert.equal(createdDiagnosis.data.diagnosis_name, 'Allergic rhinitis');
    assert.equal(createdDiagnosis.data.status, 'active');

    const updatedVitalSign = await requestJson<{
      id: string;
      heart_rate_bpm: number;
      notes: string | null;
    }>(
      '/api/vital-signs/10000000-0000-0000-0000-000000005003',
      authHeaders,
      'PATCH',
      200,
      {
        heartRateBpm: 88,
        notes: 'Heart rate settling',
      }
    );
    assert.equal(updatedVitalSign.data.id, '10000000-0000-0000-0000-000000005003');
    assert.equal(updatedVitalSign.data.heart_rate_bpm, 88);
    assert.equal(updatedVitalSign.data.notes, 'Heart rate settling');

    const createdVitalSign = await requestJson<{
      id: string;
      heart_rate_bpm: number | null;
      clinical_note_id: string | null;
    }>(
      '/api/vital-signs',
      authHeaders,
      'POST',
      201,
      {
        encounterId: '10000000-0000-0000-0000-000000002001',
        clinicalNoteId: '10000000-0000-0000-0000-000000003001',
        heartRateBpm: 86,
        oxygenSaturationPct: 99,
        notes: 'Post-treatment check',
      }
    );
    assert.equal(createdVitalSign.data.heart_rate_bpm, 86);
    assert.equal(createdVitalSign.data.clinical_note_id, '10000000-0000-0000-0000-000000003001');

    const updatedSoap = await requestJson<{
      clinical_note_id: string;
      plan: string | null;
    }>(
      '/api/clinical-notes/10000000-0000-0000-0000-000000003001/soap',
      authHeaders,
      'PATCH',
      200,
      {
        plan: 'Rest, hydration, and follow-up',
      }
    );
    assert.equal(updatedSoap.data.clinical_note_id, '10000000-0000-0000-0000-000000003001');
    assert.equal(updatedSoap.data.plan, 'Rest, hydration, and follow-up');

    const finalizedNote = await requestJson<{
      id: string;
      status: string;
      finalized_at: string | null;
    }>(
      '/api/clinical-notes/10000000-0000-0000-0000-000000003001/finalize',
      authHeaders,
      'PATCH',
      200,
      {}
    );
    assert.equal(finalizedNote.data.id, '10000000-0000-0000-0000-000000003001');
    assert.equal(finalizedNote.data.status, 'final');
    assert.ok(finalizedNote.data.finalized_at);

    const signedNote = await requestJson<{
      id: string;
      status: string;
      signed_at: string | null;
      authored_by_practitioner_id: string | null;
    }>(
      '/api/clinical-notes/10000000-0000-0000-0000-000000003001/sign',
      authHeaders,
      'PATCH',
      200,
      {}
    );
    assert.equal(signedNote.data.id, '10000000-0000-0000-0000-000000003001');
    assert.equal(signedNote.data.status, 'final');
    assert.ok(signedNote.data.signed_at);
    assert.equal(signedNote.data.authored_by_practitioner_id, '10000000-0000-0000-0000-000000000301');

    const createdUser = await requestJson<{
      id: string;
      username: string;
      display_name: string;
      role: string;
    }>(
      '/api/users',
      adminHeaders,
      'POST',
      201,
      {
        clinicId: '10000000-0000-0000-0000-000000000101',
        username: 'nurse.smoke',
        displayName: 'Nurse Smoke',
        role: 'nurse',
      }
    );
    assert.equal(createdUser.data.username, 'nurse.smoke');
    assert.equal(createdUser.data.role, 'nurse');

    const duplicateUser = await requestJson<{ error: string; detail?: string }>(
      '/api/users',
      adminHeaders,
      'POST',
      409,
      {
        clinicId: '10000000-0000-0000-0000-000000000101',
        username: 'nurse.smoke',
        displayName: 'Nurse Smoke Duplicate',
        role: 'nurse',
      }
    );
    assert.equal((duplicateUser as unknown as { error: string }).error, 'Duplicate record');

    const updatedUser = await requestJson<{
      id: string;
      display_name: string;
      is_active: boolean;
    }>(
      `/api/users/${createdUser.data.id}`,
      adminHeaders,
      'PATCH',
      200,
      {
        displayName: 'Nurse Smoke Updated',
        isActive: false,
      }
    );
    assert.equal(updatedUser.data.display_name, 'Nurse Smoke Updated');
    assert.equal(updatedUser.data.is_active, false);

    const createdPractitioner = await requestJson<{
      id: string;
      practitioner_code: string;
      user_id: string | null;
      specialty: string | null;
    }>(
      '/api/practitioners',
      adminHeaders,
      'POST',
      201,
      {
        clinicId: '10000000-0000-0000-0000-000000000101',
        userId: createdUser.data.id,
        practitionerCode: 'NP-SMOKE',
        firstName: 'Nurse',
        lastName: 'Smoke',
        specialty: 'Triage',
      }
    );
    assert.equal(createdPractitioner.data.practitioner_code, 'NP-SMOKE');
    assert.equal(createdPractitioner.data.user_id, createdUser.data.id);

    const updatedPractitioner = await requestJson<{
      id: string;
      specialty: string | null;
      is_active: boolean;
    }>(
      `/api/practitioners/${createdPractitioner.data.id}`,
      adminHeaders,
      'PATCH',
      200,
      {
        specialty: 'Primary Care',
        isActive: false,
      }
    );
    assert.equal(updatedPractitioner.data.specialty, 'Primary Care');
    assert.equal(updatedPractitioner.data.is_active, false);

    const userAuditLogs = await requestJson<Array<{ action: string; entity_type: string }>>(
      `/api/audit-logs?entityType=user&entityId=${createdUser.data.id}&limit=5`,
      adminHeaders
    );
    assert.ok(userAuditLogs.data.some((log) => log.action === 'created' && log.entity_type === 'user'));
    assert.ok(userAuditLogs.data.some((log) => log.action === 'updated' && log.entity_type === 'user'));

    const users = await requestJson<Array<{ id: string; username: string }>>(
      '/api/users?clinicId=10000000-0000-0000-0000-000000000101&search=nurse&active=inactive&limit=1&offset=0',
      adminHeaders
    );
    assert.deepEqual(users.meta, {
      limit: 1,
      offset: 0,
      hasMore: false,
      nextOffset: null,
    });
    assert.ok(users.data.some((user) => user.id === createdUser.data.id));

    const practitioners = await requestJson<Array<{ id: string; practitioner_code: string }>>(
      '/api/practitioners?clinicId=10000000-0000-0000-0000-000000000101&search=primary&active=inactive&limit=1&offset=0',
      authHeaders
    );
    assert.deepEqual(practitioners.meta, {
      limit: 1,
      offset: 0,
      hasMore: false,
      nextOffset: null,
    });
    assert.ok(practitioners.data.some((practitioner) => practitioner.id === createdPractitioner.data.id));

    const createdAppointment = await requestJson<{
      id: string;
      status: string;
      scheduled_start_at: string;
      practitioner_id: string | null;
    }>(
      '/api/appointments',
      authHeaders,
      'POST',
      201,
      {
        clinicId: '10000000-0000-0000-0000-000000000101',
        patientId: '10000000-0000-0000-0000-000000001001',
        practitionerId: '10000000-0000-0000-0000-000000000301',
        appointmentNumber: 'APT-SMOKE-RESCHEDULE',
        scheduledStartAt: '2026-01-05T09:00:00.000Z',
        scheduledEndAt: '2026-01-05T09:30:00.000Z',
        reason: 'Smoke follow-up',
      }
    );
    assert.equal(createdAppointment.data.status, 'pending');

    const rescheduledAppointment = await requestJson<{
      id: string;
      scheduled_start_at: string;
      practitioner_id: string | null;
      notes: string | null;
    }>(
      `/api/appointments/${createdAppointment.data.id}`,
      authHeaders,
      'PATCH',
      200,
      {
        practitionerId: createdPractitioner.data.id,
        scheduledStartAt: '2026-01-05T10:00:00.000Z',
        scheduledEndAt: '2026-01-05T10:30:00.000Z',
        notes: 'Rescheduled in smoke test',
      }
    );
    assert.equal(rescheduledAppointment.data.practitioner_id, createdPractitioner.data.id);
    assert.equal(rescheduledAppointment.data.notes, 'Rescheduled in smoke test');

    const visit = await requestJson<{
      id: string;
      status: string;
      queue_label: string | null;
    }>(
      '/api/visits',
      authHeaders,
      'POST',
      201,
      {
        clinicId: '10000000-0000-0000-0000-000000000101',
        patientId: '10000000-0000-0000-0000-000000001001',
        appointmentId: createdAppointment.data.id,
        practitionerId: createdPractitioner.data.id,
        visitNumber: 'VIS-SMOKE-001',
        queueLabel: 'Q-SMOKE',
      }
    );
    assert.equal(visit.data.status, 'waiting');

    const queue = await requestJson<Array<{ id: string; status: string; patient_first_name: string }>>(
      '/api/queue?clinicId=10000000-0000-0000-0000-000000000101&status=waiting&limit=10',
      authHeaders
    );
    assert.ok(queue.data.some((item) => item.id === visit.data.id));

    const visitWithDoctor = await requestJson<{
      id: string;
      status: string;
      encounter_id: string | null;
      room_name: string | null;
    }>(
      `/api/visits/${visit.data.id}`,
      authHeaders,
      'PATCH',
      200,
      {
        encounterId: '10000000-0000-0000-0000-000000002001',
        status: 'with_doctor',
        roomName: 'Room Smoke',
      }
    );
    assert.equal(visitWithDoctor.data.encounter_id, '10000000-0000-0000-0000-000000002001');
    assert.equal(visitWithDoctor.data.status, 'with_doctor');
    assert.equal(visitWithDoctor.data.room_name, 'Room Smoke');

    const ownedRoomQueue = await requestJson<Array<{ id: string }>>(
      `/api/queue?clinicId=10000000-0000-0000-0000-000000000101&status=with_doctor&practitionerId=${createdPractitioner.data.id}&roomName=Room%20Smoke&limit=10`,
      authHeaders
    );
    assert.ok(ownedRoomQueue.data.some((item) => item.id === visit.data.id));

    const template = await requestJson<{ id: string; template_key: string; is_active: boolean }>(
      '/api/clinical-note-templates',
      authHeaders,
      'POST',
      201,
      {
        clinicId: '10000000-0000-0000-0000-000000000101',
        templateKey: 'smoke_uri',
        title: 'Smoke URI',
        subjective: 'Cough from smoke template',
        objective: 'Stable',
        assessment: 'URI',
        plan: 'Supportive care',
      }
    );
    assert.equal(template.data.template_key, 'smoke_uri');

    const templates = await requestJson<Array<{ id: string }>>(
      '/api/clinical-note-templates?clinicId=10000000-0000-0000-0000-000000000101&active=true',
      authHeaders
    );
    assert.ok(templates.data.some((item) => item.id === template.data.id));

    const inactiveTemplate = await requestJson<{ id: string; is_active: boolean }>(
      `/api/clinical-note-templates/${template.data.id}`,
      authHeaders,
      'PATCH',
      200,
      { isActive: false }
    );
    assert.equal(inactiveTemplate.data.is_active, false);

    const logoAsset = await requestJson<{ id: string; original_filename: string }>(
      '/api/file-assets',
      adminHeaders,
      'POST',
      201,
      {
        clinicId: '10000000-0000-0000-0000-000000000101',
        storageKey: `clinic-logo-${randomUUID()}.png`,
        originalFilename: 'clinic-logo.png',
        mimeType: 'image/png',
        byteSize: 128,
        uploadedByUserId: '10000000-0000-0000-0000-000000000202',
      }
    );
    assert.equal(logoAsset.data.original_filename, 'clinic-logo.png');

    const clinicSettings = await requestJson<{
      clinic_id: string;
      display_name: string;
      logo_file_asset_id: string;
    }>(
      '/api/clinics/10000000-0000-0000-0000-000000000101/settings',
      adminHeaders,
      'PATCH',
      200,
      {
        displayName: 'Smoke Clinic',
        phoneNumber: '02-000-0000',
        logoFileAssetId: logoAsset.data.id,
        prescriptionFooter: 'Smoke verified signature',
      }
    );
    assert.equal(clinicSettings.data.display_name, 'Smoke Clinic');
    assert.equal(clinicSettings.data.logo_file_asset_id, logoAsset.data.id);

    const readClinicSettings = await requestJson<{ display_name: string; logo_file_asset_id: string }>(
      '/api/clinics/10000000-0000-0000-0000-000000000101/settings',
      authHeaders
    );
    assert.equal(readClinicSettings.data.display_name, 'Smoke Clinic');
    assert.equal(readClinicSettings.data.logo_file_asset_id, logoAsset.data.id);

    const smokeReportDate = new Date().toISOString().slice(0, 10);
    const dailyReport = await requestJson<{
      start_date: string;
      end_date: string;
      visits_total: number;
      by_room: unknown[];
      by_prescriber: unknown[];
    }>(
      `/api/reports/daily-operations?clinicId=10000000-0000-0000-0000-000000000101&startDate=${smokeReportDate}&endDate=${smokeReportDate}`,
      adminHeaders
    );
    assert.equal(dailyReport.data.start_date, smokeReportDate);
    assert.equal(dailyReport.data.end_date, smokeReportDate);
    assert.ok(dailyReport.data.visits_total >= 1);
    assert.ok(Array.isArray(dailyReport.data.by_room));
    assert.ok(Array.isArray(dailyReport.data.by_prescriber));
    const dailyReportCsv = await requestText(
      `/api/reports/daily-operations.csv?clinicId=10000000-0000-0000-0000-000000000101&startDate=${smokeReportDate}&endDate=${smokeReportDate}`,
      adminHeaders
    );
    assert.equal(dailyReportCsv.statusCode, 200);
    assert.match(dailyReportCsv.body, /visits_total,/);

    const updatedEncounter = await requestJson<{
      id: string;
      status: string;
      encounter_class: string;
      attending_practitioner_id: string | null;
      chief_complaint: string | null;
      triage_summary: string | null;
    }>(
      '/api/encounters/10000000-0000-0000-0000-000000002001',
      authHeaders,
      'PATCH',
      200,
      {
        status: 'completed',
        encounterClass: 'outpatient',
        attendingPractitionerId: '10000000-0000-0000-0000-000000000301',
        chiefComplaint: 'Improving cough',
        triageSummary: 'Stable for discharge',
        endedAt: '2026-01-02T09:00:00.000Z',
      }
    );
    assert.equal(updatedEncounter.data.status, 'completed');
    assert.equal(updatedEncounter.data.chief_complaint, 'Improving cough');
    assert.equal(updatedEncounter.data.triage_summary, 'Stable for discharge');

    await assertFrontendProxySmoke({
      adminHeaders,
      authHeaders,
      createdUserId: createdUser.data.id,
      createdPractitionerId: createdPractitioner.data.id,
      createdAppointmentId: createdAppointment.data.id,
      createdVisitId: visit.data.id,
    });

    const createdPrescription = await requestJson<{
      id: string;
      medication_name: string;
      status: string;
    }>(
      '/api/prescriptions',
      authHeaders,
      'POST',
      201,
      {
        encounterId: '10000000-0000-0000-0000-000000002001',
        clinicalNoteId: '10000000-0000-0000-0000-000000003001',
        medicationName: 'Cetirizine',
        dosage: '10 mg',
        route: 'oral',
        frequency: 'daily',
        durationText: '7 days',
        instructions: 'after dinner',
        status: 'active',
        startDate: '2026-01-04',
        endDate: '2026-01-10',
      }
    );
    assert.equal(createdPrescription.data.medication_name, 'Cetirizine');
    assert.equal(createdPrescription.data.status, 'active');

    const updatedPrescription = await requestJson<{
      id: string;
      status: string;
      instructions: string | null;
    }>(
      `/api/prescriptions/${createdPrescription.data.id}`,
      authHeaders,
      'PATCH',
      200,
      {
        status: 'completed',
        instructions: 'completed course',
      }
    );
    assert.equal(updatedPrescription.data.id, createdPrescription.data.id);
    assert.equal(updatedPrescription.data.status, 'completed');
    assert.equal(updatedPrescription.data.instructions, 'completed course');

    const deletedPrescription = await requestJson<{
      id: string;
      deleted_at: string | null;
    }>(
      `/api/prescriptions/${createdPrescription.data.id}`,
      authHeaders,
      'DELETE',
      200
    );
    assert.equal(deletedPrescription.data.id, createdPrescription.data.id);
    assert.ok(deletedPrescription.data.deleted_at);

    const diagnosesAfterCreate = await requestJson<Array<{ id: string }>>(
      '/api/encounters/10000000-0000-0000-0000-000000002001/diagnoses?clinicalNoteId=10000000-0000-0000-0000-000000003001&status=active&limit=10&offset=0',
      authHeaders
    );
    assert.deepEqual(
      diagnosesAfterCreate.data.map((item) => item.id),
      [
        '10000000-0000-0000-0000-000000004001',
        createdDiagnosis.data.id,
      ]
    );

    const vitalSignsAfterCreate = await requestJson<Array<{ id: string }>>(
      '/api/encounters/10000000-0000-0000-0000-000000002001/vital-signs?clinicalNoteId=10000000-0000-0000-0000-000000003001&limit=10&offset=0',
      authHeaders
    );
    assert.equal(vitalSignsAfterCreate.data[0].id, createdVitalSign.data.id);

    const prescriptionsAfterDelete = await requestJson<Array<{ id: string }>>(
      '/api/encounters/10000000-0000-0000-0000-000000002001/prescriptions?clinicalNoteId=10000000-0000-0000-0000-000000003001&status=active&limit=10&offset=0',
      authHeaders
    );
    assert.deepEqual(
      prescriptionsAfterDelete.data.map((item) => item.id),
      [
        '10000000-0000-0000-0000-000000006003',
        '10000000-0000-0000-0000-000000006001',
      ]
    );

    const createdFlag = await requestJson<{
      id: string;
      patient_id: string;
      flag_type: string;
      label: string;
      severity: string;
      status: string;
    }>(
      '/api/patient-flags',
      authHeaders,
      'POST',
      201,
      {
        patientId: '10000000-0000-0000-0000-000000001001',
        flagType: 'fall_risk',
        label: 'Fall risk',
        severity: 'critical',
        notes: 'Needs assistance when walking',
      }
    );
    assert.equal(createdFlag.data.patient_id, '10000000-0000-0000-0000-000000001001');
    assert.equal(createdFlag.data.flag_type, 'fall_risk');
    assert.equal(createdFlag.data.severity, 'critical');
    assert.equal(createdFlag.data.status, 'active');

    const flags = await requestJson<Array<{ id: string }>>(
      '/api/patients/10000000-0000-0000-0000-000000001001/flags?status=active&severity=critical',
      authHeaders
    );
    assert.ok(flags.data.some((flag) => flag.id === createdFlag.data.id));

    const updatedFlag = await requestJson<{
      id: string;
      status: string;
      notes: string | null;
    }>(
      `/api/patient-flags/${createdFlag.data.id}`,
      authHeaders,
      'PATCH',
      200,
      {
        status: 'resolved',
        notes: 'Risk resolved after reassessment',
      }
    );
    assert.equal(updatedFlag.data.id, createdFlag.data.id);
    assert.equal(updatedFlag.data.status, 'resolved');
    assert.equal(updatedFlag.data.notes, 'Risk resolved after reassessment');

    const deletedFlag = await requestJson<{
      id: string;
      deleted_at: string | null;
    }>(
      `/api/patient-flags/${createdFlag.data.id}`,
      authHeaders,
      'DELETE',
      200
    );
    assert.equal(deletedFlag.data.id, createdFlag.data.id);
    assert.ok(deletedFlag.data.deleted_at);

    console.log('API/frontend smoke test passed');
  } finally {
    if (frontendProcess) {
      frontendProcess.kill('SIGTERM');
      await onceExit(frontendProcess);
    }

    if (serverProcess) {
      serverProcess.kill('SIGTERM');
      await onceExit(serverProcess);
    }

    try {
      dockerExec(['dropdb', '-U', POSTGRES_USER, TEMP_DB]);
    } catch (error) {
      console.error(`failed to drop temp db ${TEMP_DB}:`, error);
    }
  }
}

function buildDatabaseUrl(databaseName: string) {
  return `postgres://${encodeURIComponent(POSTGRES_USER)}:${encodeURIComponent(
    POSTGRES_PASSWORD
  )}@${POSTGRES_HOST}:${POSTGRES_PORT}/${databaseName}`;
}

function dockerExec(args: string[], input?: string) {
  const result = spawnSync('docker', ['exec', ...(input ? ['-i'] : []), POSTGRES_CONTAINER!, ...args], {
    cwd: ROOT_DIR,
    encoding: 'utf8',
    input,
  });

  if (result.status !== 0) {
    throw new Error(result.stderr || result.stdout || `docker exec failed: ${args.join(' ')}`);
  }
}

function runSqlFile(filename: string) {
  dockerExec(
    ['psql', '-v', 'ON_ERROR_STOP=1', '-U', POSTGRES_USER, '-d', TEMP_DB],
    readFileSync(filename, 'utf8')
  );
}

async function waitForHealth() {
  const deadline = Date.now() + 20_000;
  let lastError: unknown = null;

  while (Date.now() < deadline) {
    try {
      const response = await httpJson<{ status: string }>('/health');
      if (response.statusCode === 200 && response.body.status === 'ok') {
        return;
      }
      lastError = new Error(`health check returned ${response.statusCode}`);
    } catch (error) {
      lastError = error;
    }

    await sleep(250);
  }

  throw lastError ?? new Error('health check timed out');
}

async function waitForFrontendHealth() {
  const deadline = Date.now() + 20_000;
  let lastError: unknown = null;

  while (Date.now() < deadline) {
    try {
      const response = await httpJson<{ status: string }>('/health', {}, 'GET', undefined, FRONTEND_PORT);
      if (response.statusCode === 200 && response.body.status === 'ok') {
        return;
      }
      lastError = new Error(`frontend health check returned ${response.statusCode}`);
    } catch (error) {
      lastError = error;
    }

    await sleep(250);
  }

  throw lastError ?? new Error('frontend health check timed out');
}

async function assertFrontendProxySmoke(input: {
  adminHeaders: Record<string, string>;
  authHeaders: Record<string, string>;
  createdUserId: string;
  createdPractitionerId: string;
  createdAppointmentId: string;
  createdVisitId: string;
}) {
  const html = await httpText('/', FRONTEND_PORT);
  assert.equal(html.statusCode, 200);
  assert.match(html.body, /admin-workspace/);
  assert.match(html.body, /app\.js/);

  const app = await httpText('/app.js', FRONTEND_PORT);
  assert.equal(app.statusCode, 200);
  assert.match(app.body, /createAdminPagination/);
  assert.match(app.body, /createAuditSection/);
  assert.match(app.body, /friendlyAdminError/);

  const styles = await httpText('/styles.css', FRONTEND_PORT);
  assert.equal(styles.statusCode, 200);
  assert.match(styles.body, /\.admin-pagination/);
  assert.match(app.body, /renderQueueBoard/);
  assert.match(app.body, /startEncounterFromVisit/);
  assert.match(app.body, /createClaimVisitButton/);
  assert.match(app.body, /queueRoomName/);
  assert.match(app.body, /createTemplateAdminSection/);
  assert.match(app.body, /getAvailableNoteTemplates/);
  assert.match(app.body, /syncVisitStatusForEncounter/);
  assert.match(app.body, /createClinicSettingsSection/);
  assert.match(app.body, /fetchDailyOperationsReport/);
  assert.match(app.body, /exportDailyOperationsCsv/);
  assert.match(app.body, /queueReportStartDate/);
  assert.match(app.body, /logoFileAssetId/);
  assert.match(app.body, /currentClinicSettings/);

  const users = await requestFrontendJson<Array<{ id: string }>>(
    '/api/users?clinicId=10000000-0000-0000-0000-000000000101&search=nurse&active=inactive&limit=1&offset=0',
    input.adminHeaders
  );
  assert.deepEqual(users.meta, { limit: 1, offset: 0, hasMore: false, nextOffset: null });
  assert.equal(users.data[0].id, input.createdUserId);

  const userAuditLogs = await requestFrontendJson<Array<{ action: string }>>(
    `/api/audit-logs?entityType=user&entityId=${input.createdUserId}&limit=5`,
    input.adminHeaders
  );
  assert.ok(userAuditLogs.data.some((log) => log.action === 'created'));

  const practitioners = await requestFrontendJson<Array<{ id: string }>>(
    '/api/practitioners?clinicId=10000000-0000-0000-0000-000000000101&search=primary&active=inactive&limit=1&offset=0',
    input.authHeaders
  );
  assert.deepEqual(practitioners.meta, { limit: 1, offset: 0, hasMore: false, nextOffset: null });
  assert.equal(practitioners.data[0].id, input.createdPractitionerId);

  const appointment = await requestFrontendJson<{ id: string; notes: string | null }>(
    `/api/appointments/${input.createdAppointmentId}`,
    input.authHeaders,
    'PATCH',
    200,
    { notes: 'Updated through frontend proxy smoke' }
  );
  assert.equal(appointment.data.notes, 'Updated through frontend proxy smoke');

  const queue = await requestFrontendJson<Array<{ id: string }>>(
    `/api/queue?clinicId=10000000-0000-0000-0000-000000000101&practitionerId=${input.createdPractitionerId}&roomName=Room%20Smoke&limit=10`,
    input.authHeaders
  );
  assert.ok(queue.data.some((item) => item.id === input.createdVisitId));

  const encounter = await requestFrontendJson<{ id: string; triage_summary: string | null }>(
    '/api/encounters/10000000-0000-0000-0000-000000002001',
    input.authHeaders,
    'PATCH',
    200,
    { triageSummary: 'Frontend proxy smoke reviewed' }
  );
  assert.equal(encounter.data.triage_summary, 'Frontend proxy smoke reviewed');
}

async function requestJson<TData>(
  path: string,
  headers: Record<string, string>,
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE' = 'GET',
  expectedStatus = 200,
  requestBody?: unknown
) {
  const response = await httpJson<TData>(path, headers, method, requestBody);
  const responseBody = response.body;
  assert.equal(response.statusCode, expectedStatus, JSON.stringify(responseBody));
  return responseBody as {
    data: TData;
    meta?: { limit: number; offset: number; hasMore: boolean; nextOffset: number | null };
  };
}

async function requestText(
  path: string,
  headers: Record<string, string>,
  expectedStatus = 200
) {
  const response = await httpText(path, PORT, headers);
  assert.equal(response.statusCode, expectedStatus, response.body);
  return response;
}

async function requestFrontendJson<TData>(
  path: string,
  headers: Record<string, string>,
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE' = 'GET',
  expectedStatus = 200,
  requestBody?: unknown
) {
  const response = await httpJson<TData>(path, headers, method, requestBody, FRONTEND_PORT);
  const responseBody = response.body;
  assert.equal(response.statusCode, expectedStatus, JSON.stringify(responseBody));
  return responseBody as {
    data: TData;
    meta?: { limit: number; offset: number; hasMore: boolean; nextOffset: number | null };
  };
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function onceExit(child: ReturnType<typeof spawn>) {
  return new Promise<void>((resolve) => {
    if (child.exitCode !== null) {
      resolve();
      return;
    }

    child.once('exit', () => resolve());
  });
}

function httpJson<TData>(
  path: string,
  headers: Record<string, string> = {},
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE' = 'GET',
  body?: unknown,
  port = PORT
) {
  return new Promise<{ statusCode: number; body: TData }>((resolve, reject) => {
    const rawBody = body === undefined ? undefined : JSON.stringify(body);
    const req = httpRequest(
      {
        host: '127.0.0.1',
        port,
        path,
        method,
        headers: {
          ...headers,
          ...(rawBody
            ? {
                'content-type': 'application/json',
                'content-length': String(Buffer.byteLength(rawBody)),
              }
            : {}),
        },
      },
      (res) => {
        const chunks: Buffer[] = [];

        res.on('data', (chunk) => {
          chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        });

        res.on('end', () => {
          try {
            const rawBody = Buffer.concat(chunks).toString('utf8');
            const body = rawBody.length > 0 ? (JSON.parse(rawBody) as TData) : ({} as TData);

            resolve({
              statusCode: res.statusCode ?? 0,
              body,
            });
          } catch (error) {
            reject(error);
          }
        });
      }
    );

    req.on('error', reject);
    if (rawBody) {
      req.write(rawBody);
    }
    req.end();
  });
}

function httpText(path: string, port: number, headers: Record<string, string> = {}) {
  return new Promise<{ statusCode: number; body: string }>((resolve, reject) => {
    const req = httpRequest(
      {
        host: '127.0.0.1',
        port,
        path,
        method: 'GET',
        headers,
      },
      (res) => {
        const chunks: Buffer[] = [];

        res.on('data', (chunk) => {
          chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        });

        res.on('end', () => {
          resolve({
            statusCode: res.statusCode ?? 0,
            body: Buffer.concat(chunks).toString('utf8'),
          });
        });
      }
    );

    req.on('error', reject);
    req.end();
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

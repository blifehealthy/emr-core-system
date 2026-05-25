import { randomUUID } from 'node:crypto';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { request as httpRequest } from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawn, spawnSync, type ChildProcess } from 'node:child_process';
import { once } from 'node:events';

const ROOT_DIR = process.cwd();
const MIGRATIONS_DIR = join(ROOT_DIR, 'database', 'migrations');
const SEED_SQL = join(ROOT_DIR, 'database', 'tests', 'api_smoke_seed.sql');
const API_PORT = Number(process.env.BROWSER_API_SMOKE_API_PORT ?? '3115');
const FRONTEND_PORT = Number(process.env.BROWSER_API_SMOKE_FRONTEND_PORT ?? '5186');
const DEBUG_PORT = Number(process.env.BROWSER_API_SMOKE_DEBUG_PORT ?? '9226');
const API_TOKEN = process.env.API_TOKEN ?? 'browser-api-smoke-token';
const AUTH_LOGIN_CODE = process.env.AUTH_LOGIN_CODE ?? 'browser-api-smoke-login-code-0001';
const AUTH_SESSION_SECRET =
  process.env.AUTH_SESSION_SECRET ?? 'abcdef0123456789abcdef0123456789';
const CHROME_BIN = process.env.CHROME_BIN ?? '/usr/bin/google-chrome';

const POSTGRES_CONTAINER = process.env.POSTGRES_CONTAINER ?? 'poolproject-postgres';
const POSTGRES_USER = process.env.POSTGRES_USER ?? 'postgres';
const POSTGRES_PASSWORD = process.env.POSTGRES_PASSWORD ?? 'postgres';
const POSTGRES_HOST = process.env.POSTGRES_HOST ?? '127.0.0.1';
const POSTGRES_PORT = process.env.POSTGRES_PORT ?? '5432';
const TEMP_DB = process.env.POSTGRES_DB ?? `emr_core_browser_api_smoke_${randomUUID().replace(/-/g, '')}`;
const FILE_STORAGE_DIR = process.env.FILE_STORAGE_DIR ?? join('/tmp', `${TEMP_DB}_files`);

const CLINIC_ID = '10000000-0000-0000-0000-000000000101';
const PATIENT_ID = '10000000-0000-0000-0000-000000001001';
const PRACTITIONER_ID = '10000000-0000-0000-0000-000000000301';
const USER_ID = '10000000-0000-0000-0000-000000000201';
const RUN_ID = Date.now();

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
  '0017_add_drug_catalog_and_safety_warnings.up.sql',
  '0018_add_prescription_safety_override.up.sql',
  '0019_add_drug_interaction_rules.up.sql',
  '0020_add_user_login_security.up.sql',
  '0021_add_user_oidc_subject.up.sql',
  '0022_add_billing_foundation.up.sql',
  '0023_add_billing_refunds_and_charge_templates.up.sql',
  '0024_add_phase_3a_completion_billing.up.sql',
  '0025_add_phase_3b_billing_operations.up.sql',
  '0026_add_phase_3c_pharmacy_inventory.up.sql',
].map((filename) => join(MIGRATIONS_DIR, filename));

async function main() {
  const databaseUrl = buildDatabaseUrl(TEMP_DB);
  let apiProcess: ChildProcess | null = null;
  let frontendProcess: ChildProcess | null = null;
  let chromeProcess: ChildProcess | null = null;
  const userDataDir = mkdtempSync(join(tmpdir(), 'emr-browser-api-smoke-'));

  try {
    dockerExec(['createdb', '-U', POSTGRES_USER, TEMP_DB]);
    for (const migration of migrations) runSqlFile(migration);
    runSqlFile(SEED_SQL);

    apiProcess = spawn(process.execPath, ['--loader', 'ts-node/esm', 'scripts/start-api.ts'], {
      cwd: ROOT_DIR,
      env: {
        ...process.env,
        DATABASE_URL: databaseUrl,
        API_TOKEN,
        AUTH_LOGIN_CODE,
        AUTH_SESSION_SECRET,
        PORT: String(API_PORT),
        FILE_STORAGE_DIR,
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    collectChildOutput(apiProcess);
    await waitForHttpHealth(API_PORT);

    const headers = {
      Authorization: `Bearer ${API_TOKEN}`,
      'x-user-id': USER_ID,
      'x-practitioner-id': PRACTITIONER_ID,
    };
    const adminHeaders = {
      Authorization: `Bearer ${API_TOKEN}`,
      'x-user-id': '10000000-0000-0000-0000-000000000202',
    };
    const settings = await requestJson<{ display_name: string }>(
      API_PORT,
      `/api/clinics/${CLINIC_ID}/settings`,
      adminHeaders,
      'PATCH',
      200,
      {
        displayName: 'Browser API Clinic',
        phoneNumber: '02-999-0000',
        prescriptionFooter: 'Browser API smoke signature',
      }
    );
    assert.equal(settings.data.display_name, 'Browser API Clinic');

    const appointment = await requestJson<{ id: string; status: string; appointment_number: string }>(
      API_PORT,
      '/api/appointments',
      headers,
      'POST',
      201,
      {
        clinicId: CLINIC_ID,
        patientId: PATIENT_ID,
        practitionerId: PRACTITIONER_ID,
        appointmentNumber: `APT-BROWSER-API-${Date.now()}`,
        status: 'confirmed',
        scheduledStartAt: '2026-05-25T04:00:00.000Z',
        scheduledEndAt: '2026-05-25T04:30:00.000Z',
        reason: 'Browser API check-in smoke',
      }
    );
    assert.equal(appointment.data.status, 'confirmed');

    const visit = await requestJson<{ id: string; status: string; queue_label: string | null }>(
      API_PORT,
      '/api/visits',
      headers,
      'POST',
      201,
      {
        clinicId: CLINIC_ID,
        patientId: PATIENT_ID,
        visitNumber: `VIS-BROWSER-API-${Date.now()}`,
        queueLabel: 'Q-BROWSER-API',
        notes: 'Browser API smoke visit',
      }
    );
    assert.equal(visit.data.status, 'waiting');

    frontendProcess = spawn(process.execPath, ['--loader', 'ts-node/esm', 'scripts/start-frontend.ts'], {
      cwd: ROOT_DIR,
      env: {
        ...process.env,
        API_BASE_URL: `http://127.0.0.1:${API_PORT}`,
        FRONTEND_PORT: String(FRONTEND_PORT),
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    collectChildOutput(frontendProcess);
    await waitForHttpHealth(FRONTEND_PORT);

    chromeProcess = spawn(CHROME_BIN, [
      '--headless=new',
      '--disable-gpu',
      '--no-sandbox',
      `--remote-debugging-port=${DEBUG_PORT}`,
      `--user-data-dir=${userDataDir}`,
      `http://127.0.0.1:${FRONTEND_PORT}/`,
    ], { stdio: ['ignore', 'ignore', 'pipe'] });

    const cdp = await DevToolsClient.connect(await waitForPageWebSocketUrl());
    await cdp.send('Page.enable');
    await cdp.send('Runtime.enable');
    await cdp.send('Page.navigate', { url: `http://127.0.0.1:${FRONTEND_PORT}/` });
    await cdp.waitForEvent('Page.loadEventFired');

    await evaluate(cdp, `
      document.querySelector('#loginClinicId').value = '${CLINIC_ID}';
      document.querySelector('#loginUsername').value = 'doctor.smoke';
      document.querySelector('#authLoginCode').value = '${AUTH_LOGIN_CODE}';
      document.querySelector('#auth-form').requestSubmit();
      return true;
    `);
    await waitFor(cdp, `document.querySelector('#service-status')?.textContent.includes('เข้าสู่ระบบแล้ว')`);

    await evaluate(cdp, `
      document.querySelector('[data-view="queue"]').click();
      document.querySelector('#queueClinicId').value = '${CLINIC_ID}';
      document.querySelector('#queueLimit').value = '25';
      document.querySelector('#queue-form').requestSubmit();
      return true;
    `);
    await waitFor(cdp, `document.body.textContent.includes('Q-BROWSER-API') && document.querySelectorAll('.bar-chart').length >= 4`);

    await evaluate(cdp, `return clickButtonByText('รับเคส');`);
    await waitFor(cdp, `document.querySelector('#service-status')?.textContent.includes('รับเคสแล้ว')`);

    const claimedVisit = await requestJson<Array<{ id: string; practitioner_id: string | null }>>(
      API_PORT,
      `/api/queue?clinicId=${CLINIC_ID}&limit=25`,
      headers
    );
    assert.ok(
      claimedVisit.data.some(
        (item) => item.id === visit.data.id && item.practitioner_id === PRACTITIONER_ID
      )
    );

    await evaluate(cdp, `return clickButtonByText('เริ่มตรวจ');`);
    await waitFor(cdp, `document.querySelector('#service-status')?.textContent.includes('เริ่มตรวจและผูก encounter แล้ว')`);
    await waitFor(cdp, `document.body.textContent.includes('Jane Smoke') && document.body.textContent.includes('Prescriptions')`);

    const linkedQueue = await requestJson<Array<{ id: string; status: string; encounter_id: string | null }>>(
      API_PORT,
      `/api/queue?clinicId=${CLINIC_ID}&limit=25`,
      headers
    );
    const linkedVisit = linkedQueue.data.find((item) => item.id === visit.data.id);
    assert.equal(linkedVisit?.status, 'with_doctor');
    assert.ok(linkedVisit?.encounter_id);

    await evaluate(cdp, `
      window.__lastPrintHtml = '';
      window.open = () => ({
        document: {
          write(html) { window.__lastPrintHtml = html; },
          close() {},
        },
        focus() {},
        print() { window.__printCalled = true; },
      });
      clickButtonByText('Prescriptions');
      clickButtonByText('พิมพ์ใบสั่งยา');
      return true;
    `);
    await waitFor(cdp, `window.__printCalled === true && window.__lastPrintHtml.includes('ใบสั่งยา / Prescription')`);
    const printHtml = await evaluate<string>(cdp, `return window.__lastPrintHtml;`);
    assert.match(printHtml, /Browser API Clinic/);
    assert.match(printHtml, /Oseltamivir|Paracetamol/);
    assert.match(printHtml, /Jane Smoke/);

    await evaluate(cdp, `
      const prescriptionForm = document.querySelector('.prescription-entry-form');
      prescriptionForm.querySelector('select[name="encounterId"]').value = '${linkedVisit?.encounter_id}';
      const catalog = prescriptionForm.querySelector('select[name="drugCatalogId"]');
      catalog.value = '10000000-0000-0000-0000-000000020001';
      catalog.dispatchEvent(new Event('change', { bubbles: true }));
      prescriptionForm.querySelector('textarea[name="safetyOverrideReason"]').value = 'Browser smoke validates visible warning';
      clickButtonByText('เช็ก safety');
      return true;
    `);
    await waitFor(cdp, `document.body.textContent.includes('Patient has active allergy to Penicillin')`);
    await evaluate(cdp, `
      const prescriptionForm = document.querySelector('.prescription-entry-form');
      prescriptionForm.requestSubmit();
      return true;
    `);
    await waitFor(cdp, `document.querySelector('#service-status')?.textContent.includes('เพิ่ม prescription แล้ว')`);
    const safetyPrescriptions = await requestJson<Array<{ medication_name: string; safety_warnings: Array<{ type: string }> }>>(
      API_PORT,
      `/api/encounters/${linkedVisit?.encounter_id}/prescriptions?limit=25&offset=0`,
      headers
    );
    const warningPrescription = safetyPrescriptions.data.find((item) => item.medication_name === 'Amoxicillin');
    assert.equal(warningPrescription?.safety_warnings?.[0]?.type, 'allergy');

    await evaluate(cdp, `
      clickButtonByText('Appointments');
      clickButtonByText('เช็กอิน');
      return true;
    `);
    await waitFor(cdp, `document.querySelector('#service-status')?.textContent.includes('เช็กอินและเข้าคิวแล้ว')`);
    const checkedInAppointment = await requestJson<{ id: string; status: string }>(
      API_PORT,
      `/api/appointments/${appointment.data.id}`,
      headers
    );
    assert.equal(checkedInAppointment.data.status, 'checked_in');
    const appointmentQueue = await requestJson<Array<{ id: string; appointment_id: string | null; status: string }>>(
      API_PORT,
      `/api/queue?clinicId=${CLINIC_ID}&limit=50`,
      headers
    );
    assert.ok(
      appointmentQueue.data.some(
        (item) => item.appointment_id === appointment.data.id && item.status === 'waiting'
      )
    );

    await evaluate(cdp, `
      clickButtonByText('Notes');
      clickButtonByText('เปิด SOAP');
      return true;
    `);
    await waitFor(cdp, `document.querySelector('#service-status')?.textContent.includes('เปิด SOAP แล้ว') && document.querySelector('.soap-editor-form textarea[name="subjective"]')`);
    const editedClinicalNoteId = await evaluate<string>(
      cdp,
      `return document.querySelector('.soap-editor-form .inline-form-heading span')?.textContent?.trim() ?? '';`
    );
    assert.ok(editedClinicalNoteId);
    await evaluate(cdp, `
      document.querySelector('.soap-editor-form textarea[name="subjective"]').value = 'Browser API updated subjective';
      document.querySelector('.soap-editor-form textarea[name="objective"]').value = 'Browser API updated objective';
      document.querySelector('.soap-editor-form textarea[name="assessment"]').value = 'Browser API updated assessment';
      document.querySelector('.soap-editor-form textarea[name="plan"]').value = 'Browser API updated plan';
      document.querySelector('.soap-editor-form').requestSubmit();
      return true;
    `);
    await waitFor(cdp, `document.querySelector('#service-status')?.textContent.includes('บันทึก SOAP แล้ว')`);
    const soap = await requestJson<{
      subjective: string;
      objective: string;
      assessment: string;
      plan: string;
    }>(
      API_PORT,
      `/api/clinical-notes/${editedClinicalNoteId}/soap`,
      headers
    );
    assert.equal(soap.data.subjective, 'Browser API updated subjective');
    assert.equal(soap.data.objective, 'Browser API updated objective');
    assert.equal(soap.data.assessment, 'Browser API updated assessment');
    assert.equal(soap.data.plan, 'Browser API updated plan');

    await evaluate(cdp, `
      document.querySelector('[data-view="queue"]').click();
      window.__downloadedCsv = '';
      window.__downloadName = '';
      URL.createObjectURL = (blob) => {
        blob.text().then((text) => { window.__downloadedCsv = text; });
        return 'blob:browser-api-smoke';
      };
      URL.revokeObjectURL = () => {};
      HTMLAnchorElement.prototype.click = function click() {
        window.__downloadName = this.download;
      };
      clickButtonByText('Export CSV');
      return true;
    `);
    await waitFor(cdp, `document.querySelector('#service-status')?.textContent.includes('export report แล้ว') && window.__downloadedCsv.includes('visits_total')`);
    const exportedCsv = await evaluate<string>(cdp, `return window.__downloadedCsv;`);
    const exportedName = await evaluate<string>(cdp, `return window.__downloadName;`);
    assert.match(exportedCsv, /visits_total/);
    assert.match(exportedName, /^daily-operations-/);

    await evaluate(cdp, `
      document.querySelector('#loginClinicId').value = '${CLINIC_ID}';
      document.querySelector('#loginUsername').value = 'admin.smoke';
      document.querySelector('#authLoginCode').value = '${AUTH_LOGIN_CODE}';
      document.querySelector('#auth-form').requestSubmit();
      return true;
    `);
    await waitFor(cdp, `document.querySelector('#service-status')?.textContent.includes('เข้าสู่ระบบแล้ว: Admin Smoke')`);

    await evaluate(cdp, `
      document.querySelector('[data-view="admin"]').click();
      document.querySelector('#adminClinicId').value = '${CLINIC_ID}';
      document.querySelector('#admin-form').requestSubmit();
      return true;
    `);
    try {
      await waitFor(cdp, `document.querySelector('#service-status')?.textContent.includes('โหลดทีมแล้ว') && document.querySelector('[data-workflow="clinic-logo-asset-picker"]')`);
    } catch (error) {
      const adminStatus = await evaluate<string>(cdp, `return document.querySelector('#service-status')?.textContent ?? '';`);
      const adminText = await evaluate<string>(cdp, `return document.body.textContent.slice(0, 2000);`);
      throw new Error(`Admin branding workspace did not load. Status: ${adminStatus}. Body: ${adminText}`, { cause: error });
    }
    await evaluate(cdp, `
      const panel = document.querySelector('[data-workflow="clinic-logo-asset-picker"]');
      const file = new File(['browser api logo bytes'], 'browser-api-logo.png', { type: 'image/png' });
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      const input = panel.querySelector('input[name="logoAssetFile"]');
      input.files = dataTransfer.files;
      input.dispatchEvent(new Event('change', { bubbles: true }));
      clickButtonByText('สร้าง logo asset');
      return true;
    `);
    await waitFor(cdp, `document.querySelector('[data-workflow="clinic-logo-asset-status"]')?.textContent.includes('upload logo asset แล้ว')`);
    const uploadedAssetId = await evaluate<string>(
      cdp,
      `return document.querySelector('select[name="logoFileAssetId"]')?.value ?? '';`
    );
    assert.ok(uploadedAssetId);
    await evaluate(cdp, `
      const brandingForm = document.querySelector('textarea[name="prescriptionFooter"]').closest('form');
      brandingForm.querySelector('input[name="displayName"]').value = 'Browser API Logo Clinic';
      brandingForm.querySelector('textarea[name="prescriptionFooter"]').value = 'Browser API logo signature';
      brandingForm.requestSubmit();
      return true;
    `);
    try {
      await waitFor(cdp, `document.querySelector('#service-status')?.textContent.includes('บันทึก branding แล้ว')`);
    } catch (error) {
      const brandingStatus = await evaluate<string>(cdp, `return document.querySelector('#service-status')?.textContent ?? '';`);
      const brandingFormText = await evaluate<string>(cdp, `return document.querySelector('textarea[name="prescriptionFooter"]')?.closest('form')?.textContent ?? '';`);
      throw new Error(`Clinic branding save did not complete. Status: ${brandingStatus}. Form: ${brandingFormText}`, { cause: error });
    }
    const branding = await requestJson<{ display_name: string; logo_file_asset_id: string | null; prescription_footer: string | null }>(
      API_PORT,
      `/api/clinics/${CLINIC_ID}/settings`,
      headers
    );
    assert.equal(branding.data.display_name, 'Browser API Logo Clinic');
    assert.equal(branding.data.logo_file_asset_id, uploadedAssetId);
    assert.equal(branding.data.prescription_footer, 'Browser API logo signature');

    const uploadedLogo = await requestJson<{ id: string; original_filename: string; mime_type: string }>(
      API_PORT,
      `/api/file-assets/${uploadedAssetId}`,
      headers
    );
    assert.equal(uploadedLogo.data.original_filename, 'browser-api-logo.png');
    assert.equal(uploadedLogo.data.mime_type, 'image/png');

    const browserUsername = `browser.admin.${RUN_ID}`;
    const browserPractitionerCode = `PR-BROWSER-${RUN_ID}`;
    await evaluate(cdp, `
      const userForm = findFormByButtonText('เพิ่ม user');
      userForm.querySelector('input[name="username"]').value = '${browserUsername}';
      userForm.querySelector('input[name="displayName"]').value = 'Browser Admin User';
      userForm.querySelector('select[name="role"]').value = 'nurse';
      userForm.querySelector('input[name="oidcSubject"]').value = 'oidc:${browserUsername}';
      userForm.requestSubmit();
      return true;
    `);
    await waitFor(cdp, `document.querySelector('#service-status')?.textContent.includes('เพิ่ม user แล้ว')`);
    const createdUsers = await requestJson<Array<{ id: string; username: string; display_name: string; oidc_subject: string | null; is_active: boolean }>>(
      API_PORT,
      `/api/users?clinicId=${CLINIC_ID}&search=${encodeURIComponent(browserUsername)}&active=active&limit=5&offset=0`,
      adminHeaders
    );
    const createdUser = createdUsers.data.find((item) => item.username === browserUsername);
    assert.ok(createdUser);
    assert.equal(createdUser.display_name, 'Browser Admin User');
    assert.equal(createdUser.oidc_subject, `oidc:${browserUsername}`);

    await evaluate(cdp, `
      clickButtonInCard('${browserUsername}', 'แก้ไข');
      const editForm = findCardByText('${browserUsername}').querySelector('.inline-profile-form');
      editForm.querySelector('input[name="displayName"]').value = 'Browser Admin User Edited';
      editForm.querySelector('select[name="role"]').value = 'admin';
      editForm.querySelector('input[name="oidcSubject"]').value = 'oidc:${browserUsername}:edited';
      editForm.requestSubmit();
      return true;
    `);
    await waitFor(cdp, `document.querySelector('#service-status')?.textContent.includes('แก้ user แล้ว')`);
    const editedUsers = await requestJson<Array<{ id: string; display_name: string; role: string; oidc_subject: string | null; is_active: boolean }>>(
      API_PORT,
      `/api/users?clinicId=${CLINIC_ID}&search=${encodeURIComponent(browserUsername)}&active=all&limit=5&offset=0`,
      adminHeaders
    );
    const editedUser = editedUsers.data.find((item) => item.id === createdUser.id);
    assert.equal(editedUser?.display_name, 'Browser Admin User Edited');
    assert.equal(editedUser?.role, 'admin');
    assert.equal(editedUser?.oidc_subject, `oidc:${browserUsername}:edited`);

    await evaluate(cdp, `
      clickButtonInCard('${browserUsername}', 'ปิดใช้งาน');
      return true;
    `);
    await waitFor(cdp, `document.querySelector('#service-status')?.textContent.includes('ปิดใช้งานแล้ว')`);
    const inactiveUsers = await requestJson<Array<{ id: string; is_active: boolean }>>(
      API_PORT,
      `/api/users?clinicId=${CLINIC_ID}&search=${encodeURIComponent(browserUsername)}&active=inactive&limit=5&offset=0`,
      adminHeaders
    );
    assert.equal(inactiveUsers.data.find((item) => item.id === createdUser.id)?.is_active, false);

    await evaluate(cdp, `
      document.querySelector('[data-view="admin"]').click();
      document.querySelector('#admin-form').requestSubmit();
      return true;
    `);
    await waitFor(cdp, `document.querySelector('#service-status')?.textContent.includes('โหลดทีมแล้ว')`);
    await evaluate(cdp, `
      const practitionerForm = findFormByButtonText('เพิ่ม practitioner');
      practitionerForm.querySelector('input[name="practitionerCode"]').value = '${browserPractitionerCode}';
      practitionerForm.querySelector('input[name="firstName"]').value = 'Browser';
      practitionerForm.querySelector('input[name="lastName"]').value = 'Practitioner';
      practitionerForm.querySelector('input[name="licenseNumber"]').value = 'LIC-${RUN_ID}';
      practitionerForm.querySelector('input[name="specialty"]').value = 'Automation';
      practitionerForm.requestSubmit();
      return true;
    `);
    await waitFor(cdp, `document.querySelector('#service-status')?.textContent.includes('เพิ่ม practitioner แล้ว')`);
    const createdPractitioners = await requestJson<Array<{ id: string; practitioner_code: string; specialty: string; is_active: boolean }>>(
      API_PORT,
      `/api/practitioners?clinicId=${CLINIC_ID}&search=${encodeURIComponent(browserPractitionerCode)}&active=active&limit=5&offset=0`,
      adminHeaders
    );
    const createdPractitioner = createdPractitioners.data.find((item) => item.practitioner_code === browserPractitionerCode);
    assert.ok(createdPractitioner);
    assert.equal(createdPractitioner.specialty, 'Automation');

    await evaluate(cdp, `
      clickButtonInCard('${browserPractitionerCode}', 'แก้ไข');
      const editForm = findCardByText('${browserPractitionerCode}').querySelector('.inline-profile-form');
      editForm.querySelector('input[name="specialty"]').value = 'Automation Edited';
      editForm.requestSubmit();
      return true;
    `);
    await waitFor(cdp, `document.querySelector('#service-status')?.textContent.includes('แก้ practitioner แล้ว')`);
    const editedPractitioners = await requestJson<Array<{ id: string; specialty: string }>>(
      API_PORT,
      `/api/practitioners?clinicId=${CLINIC_ID}&search=${encodeURIComponent(browserPractitionerCode)}&active=all&limit=5&offset=0`,
      adminHeaders
    );
    assert.equal(editedPractitioners.data.find((item) => item.id === createdPractitioner.id)?.specialty, 'Automation Edited');

    await evaluate(cdp, `
      clickButtonInCard('${browserPractitionerCode}', 'ปิดใช้งาน');
      return true;
    `);
    await waitFor(cdp, `document.querySelector('#service-status')?.textContent.includes('ปิดใช้งานแล้ว')`);
    const inactivePractitioners = await requestJson<Array<{ id: string; is_active: boolean }>>(
      API_PORT,
      `/api/practitioners?clinicId=${CLINIC_ID}&search=${encodeURIComponent(browserPractitionerCode)}&active=inactive&limit=5&offset=0`,
      adminHeaders
    );
    assert.equal(inactivePractitioners.data.find((item) => item.id === createdPractitioner.id)?.is_active, false);

    await evaluate(cdp, `
      const auditForm = Array.from(document.querySelectorAll('form.audit-form'))[0];
      auditForm.querySelector('select[name="entityType"]').value = 'user';
      auditForm.querySelector('input[name="entityId"]').value = '${createdUser.id}';
      auditForm.querySelector('input[name="limit"]').value = '10';
      auditForm.requestSubmit();
      return true;
    `);
    await waitFor(cdp, `document.querySelector('#service-status')?.textContent.includes('โหลด audit แล้ว') && document.body.textContent.includes('${createdUser.id}')`);
    const userAudit = await requestJson<Array<{ action: string }>>(
      API_PORT,
      `/api/audit-logs?entityType=user&entityId=${createdUser.id}&limit=10`,
      adminHeaders
    );
    assert.ok(userAudit.data.some((item) => item.action === 'created'));
    assert.ok(userAudit.data.some((item) => item.action === 'updated'));

    await cdp.close();
    console.log('Browser API workflow smoke passed');
  } finally {
    if (chromeProcess && !chromeProcess.killed) {
      chromeProcess.kill('SIGTERM');
      await onceExit(chromeProcess);
    }
    if (frontendProcess) {
      frontendProcess.kill('SIGTERM');
      await onceExit(frontendProcess);
    }
    if (apiProcess) {
      apiProcess.kill('SIGTERM');
      await onceExit(apiProcess);
    }
    try {
      dockerExec(['dropdb', '-U', POSTGRES_USER, TEMP_DB]);
    } catch (error) {
      console.error(`failed to drop temp db ${TEMP_DB}:`, error);
    }
    rmSync(FILE_STORAGE_DIR, { recursive: true, force: true });
    rmSync(userDataDir, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
  }
}

function buildDatabaseUrl(databaseName: string) {
  return `postgres://${encodeURIComponent(POSTGRES_USER)}:${encodeURIComponent(
    POSTGRES_PASSWORD
  )}@${POSTGRES_HOST}:${POSTGRES_PORT}/${databaseName}`;
}

function dockerExec(args: string[], input?: string) {
  const result = spawnSync('docker', ['exec', ...(input ? ['-i'] : []), POSTGRES_CONTAINER, ...args], {
    cwd: ROOT_DIR,
    encoding: 'utf8',
    input,
  });
  if (result.status !== 0) throw new Error(result.stderr || result.stdout || `docker exec failed: ${args.join(' ')}`);
}

function runSqlFile(filename: string) {
  dockerExec(['psql', '-v', 'ON_ERROR_STOP=1', '-U', POSTGRES_USER, '-d', TEMP_DB], readFileSync(filename, 'utf8'));
}

function collectChildOutput(child: ChildProcess) {
  for (const stream of [child.stdout, child.stderr]) {
    stream?.on('data', (chunk) => {
      if (process.env.BROWSER_API_SMOKE_VERBOSE) process.stderr.write(String(chunk));
    });
  }
}

async function waitForHttpHealth(port: number) {
  const deadline = Date.now() + 20_000;
  let lastError: unknown = null;
  while (Date.now() < deadline) {
    try {
      const response = await httpJson<{ status: string }>(port, '/health', {}, 'GET');
      if (response.statusCode === 200 && (response.body as { status?: string }).status === 'ok') return;
      lastError = new Error(`health check returned ${response.statusCode}`);
    } catch (error) {
      lastError = error;
    }
    await delay(250);
  }
  throw lastError ?? new Error(`health check timed out on port ${port}`);
}

async function requestJson<TData>(
  port: number,
  path: string,
  headers: Record<string, string>,
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE' = 'GET',
  expectedStatus = 200,
  requestBody?: unknown
) {
  const response = await httpJson<TData>(port, path, headers, method, requestBody);
  assert.equal(response.statusCode, expectedStatus, JSON.stringify(response.body));
  return response.body as { data: TData };
}

function httpJson<TData>(
  port: number,
  path: string,
  headers: Record<string, string>,
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
  requestBody?: unknown
): Promise<{ statusCode: number; body: TData | { data: TData } | { error: string; detail?: string } }> {
  const body = requestBody === undefined ? undefined : JSON.stringify(requestBody);
  return new Promise((resolve, reject) => {
    const req = httpRequest(
      {
        host: '127.0.0.1',
        port,
        path,
        method,
        headers: {
          accept: 'application/json',
          ...(body ? { 'content-type': 'application/json', 'content-length': Buffer.byteLength(body) } : {}),
          ...headers,
        },
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on('data', (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
        res.on('end', () => {
          const raw = Buffer.concat(chunks).toString('utf8');
          resolve({ statusCode: res.statusCode ?? 0, body: raw ? JSON.parse(raw) : {} });
        });
      }
    );
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

async function waitForPageWebSocketUrl() {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/list`);
      const pages = await response.json() as Array<{ type: string; webSocketDebuggerUrl: string }>;
      const page = pages.find((item) => item.type === 'page');
      if (page?.webSocketDebuggerUrl) return page.webSocketDebuggerUrl;
    } catch {
      // Chrome is still starting.
    }
    await delay(100);
  }
  throw new Error('Timed out waiting for Chrome DevTools endpoint');
}

async function evaluate<T = unknown>(cdp: DevToolsClient, expression: string) {
  const result = await cdp.send('Runtime.evaluate', {
    expression: `
      (() => {
        window.clickButtonByText = window.clickButtonByText || ((text) => {
          const button = Array.from(document.querySelectorAll('button'))
            .find((item) => item.textContent.trim().includes(text));
          if (!button) throw new Error('Button not found: ' + text);
          button.click();
          return true;
        });
        window.findFormByButtonText = window.findFormByButtonText || ((text) => {
          const form = Array.from(document.querySelectorAll('form'))
            .find((item) => Array.from(item.querySelectorAll('button')).some((button) => button.textContent.trim().includes(text)));
          if (!form) throw new Error('Form not found for button: ' + text);
          return form;
        });
        window.findCardByText = window.findCardByText || ((text) => {
          const card = Array.from(document.querySelectorAll('.record-card'))
            .find((item) => item.textContent.includes(text));
          if (!card) throw new Error('Card not found: ' + text);
          return card;
        });
        window.clickButtonInCard = window.clickButtonInCard || ((cardText, buttonText) => {
          const card = window.findCardByText(cardText);
          const button = Array.from(card.querySelectorAll('button'))
            .find((item) => item.textContent.trim().includes(buttonText));
          if (!button) throw new Error('Button not found in card: ' + buttonText);
          button.click();
          return true;
        });
        return (async () => {
          ${expression}
        })();
      })()
    `,
    awaitPromise: true,
    returnByValue: true,
  }) as { result?: { value?: T }; exceptionDetails?: unknown };
  if (result.exceptionDetails) throw new Error(`Browser evaluation failed: ${JSON.stringify(result.exceptionDetails)}`);
  return result.result?.value as T;
}

async function waitFor(cdp: DevToolsClient, expression: string) {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    const ok = await evaluate<boolean>(cdp, `return Boolean(${expression});`).catch(() => false);
    if (ok) return;
    await delay(100);
  }
  throw new Error(`Timed out waiting for browser condition: ${expression}`);
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function onceExit(child: ChildProcess) {
  if (child.exitCode !== null || child.signalCode !== null) return;
  await once(child, 'exit');
}

class DevToolsClient {
  private nextId = 1;
  private pending = new Map<number, { resolve: (value: unknown) => void; reject: (error: Error) => void }>();
  private eventWaiters = new Map<string, Array<(params: unknown) => void>>();

  private constructor(private socket: WebSocket) {
    socket.addEventListener('message', (event) => this.handleMessage(String(event.data)));
  }

  static async connect(url: string) {
    const socket = new WebSocket(url);
    await new Promise<void>((resolve, reject) => {
      socket.addEventListener('open', () => resolve(), { once: true });
      socket.addEventListener('error', () => reject(new Error('Failed to open DevTools WebSocket')), { once: true });
    });
    return new DevToolsClient(socket);
  }

  send(method: string, params: Record<string, unknown> = {}) {
    const id = this.nextId;
    this.nextId += 1;
    this.socket.send(JSON.stringify({ id, method, params }));
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
    });
  }

  waitForEvent(method: string) {
    return new Promise((resolve) => {
      const waiters = this.eventWaiters.get(method) ?? [];
      waiters.push(resolve);
      this.eventWaiters.set(method, waiters);
    });
  }

  async close() {
    this.socket.close();
  }

  private handleMessage(message: string) {
    const payload = JSON.parse(message);
    if (payload.id) {
      const pending = this.pending.get(payload.id);
      if (!pending) return;
      this.pending.delete(payload.id);
      if (payload.error) pending.reject(new Error(payload.error.message ?? 'DevTools command failed'));
      else pending.resolve(payload.result);
      return;
    }
    if (payload.method) {
      const waiters = this.eventWaiters.get(payload.method) ?? [];
      this.eventWaiters.delete(payload.method);
      for (const waiter of waiters) waiter(payload.params);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

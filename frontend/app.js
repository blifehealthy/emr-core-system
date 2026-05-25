const registrationForm = document.querySelector('#registration-form');
const authForm = document.querySelector('#auth-form');
const searchForm = document.querySelector('#patient-search-form');
const adminForm = document.querySelector('#admin-form');
const queueForm = document.querySelector('#queue-form');
const billingForm = document.querySelector('#billing-form');
const submitButton = document.querySelector('#submit-button');
const searchButton = document.querySelector('#search-button');
const adminLoadButton = document.querySelector('#admin-load-button');
const queueLoadButton = document.querySelector('#queue-load-button');
const queueExportButton = document.querySelector('#queue-export-button');
const billingLoadButton = document.querySelector('#billing-load-button');
const logoutButton = document.querySelector('#logout-button');
const serviceStatus = document.querySelector('#service-status');
const resultTitle = document.querySelector('#result-title');
const resultList = document.querySelector('#result-list');
const payloadPreview = document.querySelector('#payload-preview');
const patientDetailPanel = document.querySelector('#patient-detail-panel');
const patientDetail = document.querySelector('#patient-detail');
const adminWorkspace = document.querySelector('#admin-workspace');
const queueBoard = document.querySelector('#queue-board');
const billingWorkspace = document.querySelector('#billing-workspace');
const tabButtons = Array.from(document.querySelectorAll('[data-view]'));
const viewPanels = Array.from(document.querySelectorAll('[data-view-panel]'));

let activeView = 'registration';
let currentPatient = null;
let currentProfile = null;
let currentApiToken = '';
let currentProfileSection = 'Flags';
let currentAdmin = { users: [], practitioners: [] };
let currentAuditLogs = [];
let currentQueue = [];
let currentBilling = {
  invoices: [],
  chargeTemplates: [],
  insuranceClaims: [],
  numberSequences: [],
  reconciliations: [],
  billingSummary: {},
};
let currentClinicalNoteTemplates = [];
let currentClinicSettings = null;
let currentLogoAssets = [];
let currentFileAssetStoragePolicy = null;
let currentDrugCatalog = [];
const logoAssetDataUrls = new Map();
let currentDailyReport = null;
let currentAdminFilters = {
  usersSearch: '',
  usersActive: 'active',
  practitionersSearch: '',
  practitionersActive: 'active',
};
let currentAdminPagination = {
  usersLimit: 10,
  usersOffset: 0,
  practitionersLimit: 10,
  practitionersOffset: 0,
};
let currentAdminMeta = {
  users: { limit: 10, offset: 0, hasMore: false, nextOffset: null },
  practitioners: { limit: 10, offset: 0, hasMore: false, nextOffset: null },
};
const fallbackNoteTemplates = {
  general_follow_up: {
    subjective: 'มาติดตามอาการ อาการโดยรวมเปลี่ยนแปลงตามที่แจ้ง',
    objective: 'สัญญาณชีพและการตรวจร่างกายตามบันทึก',
    assessment: 'อาการอยู่ระหว่างติดตาม',
    plan: 'ให้คำแนะนำ ติดตามอาการ และนัดตามความเหมาะสม',
  },
  uri: {
    subjective: 'ไอ เจ็บคอ/มีน้ำมูก ไม่มีสัญญาณอันตรายที่ชัดเจน',
    objective: 'ตรวจร่างกายทั่วไป stable',
    assessment: 'Upper respiratory tract infection',
    plan: 'รักษาตามอาการ ดื่มน้ำ พักผ่อน และกลับมาตรวจหากอาการแย่ลง',
  },
  chronic_follow_up: {
    subjective: 'มาติดตามโรคเรื้อรัง รับประทานยาตามแผนเดิม',
    objective: 'ทบทวน vital signs และผลตรวจที่เกี่ยวข้อง',
    assessment: 'โรคเรื้อรังอยู่ระหว่างควบคุมและติดตาม',
    plan: 'ต่อยา/ปรับยาเมื่อจำเป็น นัดติดตาม และให้คำแนะนำพฤติกรรมสุขภาพ',
  },
};

const createProfileConfigs = {
  Flags: {
    endpoint: '/api/patient-flags',
    submitText: 'เพิ่ม flag',
    updateText: 'บันทึก flag',
    fields: [
      { name: 'flagType', label: 'Flag type', required: true },
      { name: 'label', label: 'Label', required: true },
      { name: 'severity', label: 'Severity', type: 'select', options: ['info', 'caution', 'critical'] },
      { name: 'notes', label: 'Notes' },
    ],
  },
  Allergies: {
    endpoint: '/api/patient-allergies',
    submitText: 'เพิ่ม allergy',
    updateText: 'บันทึก allergy',
    fields: [
      { name: 'allergenName', label: 'Allergen', required: true },
      { name: 'reaction', label: 'Reaction' },
      { name: 'severity', label: 'Severity', type: 'select', options: ['unknown', 'mild', 'moderate', 'severe'] },
      { name: 'notes', label: 'Notes' },
    ],
  },
  Conditions: {
    endpoint: '/api/patient-conditions',
    submitText: 'เพิ่ม condition',
    updateText: 'บันทึก condition',
    fields: [
      { name: 'conditionName', label: 'Condition', required: true },
      { name: 'conditionCode', label: 'Code' },
      { name: 'clinicalStatus', label: 'Status', type: 'select', options: ['active', 'resolved', 'inactive', 'entered_in_error'] },
      { name: 'notes', label: 'Notes' },
    ],
  },
  Medications: {
    endpoint: '/api/patient-medications',
    submitText: 'เพิ่ม medication',
    updateText: 'บันทึก medication',
    fields: [
      { name: 'medicationName', label: 'Medication', required: true },
      { name: 'dosage', label: 'Dosage' },
      { name: 'frequency', label: 'Frequency' },
      { name: 'status', label: 'Status', type: 'select', options: ['active', 'completed', 'stopped', 'on_hold', 'entered_in_error'] },
      { name: 'notes', label: 'Notes' },
    ],
  },
};

const defaults = {
  clinicId: '10000000-0000-0000-0000-000000000101',
  searchClinicId: '10000000-0000-0000-0000-000000000101',
  adminClinicId: '10000000-0000-0000-0000-000000000101',
  queueClinicId: '10000000-0000-0000-0000-000000000101',
  billingClinicId: '10000000-0000-0000-0000-000000000101',
  queueReportStartDate: new Date().toISOString().slice(0, 10),
  queueReportEndDate: new Date().toISOString().slice(0, 10),
  loginClinicId: '10000000-0000-0000-0000-000000000101',
  loginUsername: 'doctor.smoke',
  userId: '10000000-0000-0000-0000-000000000201',
  userRole: 'nurse',
  apiToken: localStorage.getItem('emr.apiToken') ?? '',
};

for (const [field, value] of Object.entries(defaults)) {
  const input = document.querySelector(`#${field}`);
  if (input) input.value = value;
}

for (const button of tabButtons) {
  button.addEventListener('click', () => setActiveView(button.dataset.view));
}

document.addEventListener('input', () => {
  renderRequestPreview();
});

authForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  setStatus('กำลังเข้าสู่ระบบ', '');

  try {
    const session = await createAuthSession({
      clinicId: readValue('loginClinicId'),
      username: readValue('loginUsername'),
      loginCode: readValue('authLoginCode'),
    });

    document.querySelector('#apiToken').value = session.accessToken;
    document.querySelector('#userId').value = session.user.id;
    document.querySelector('#userRole').value = session.user.role;
    document.querySelector('#actorPractitionerId').value = session.user.practitioner_id ?? '';
    currentApiToken = session.accessToken;
    localStorage.setItem('emr.apiToken', session.accessToken);
    localStorage.setItem('emr.sessionExpiresAt', session.expiresAt);
    setStatus(`เข้าสู่ระบบแล้ว: ${session.user.display_name}`, 'success');
    renderRequestPreview();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'เข้าสู่ระบบไม่สำเร็จ';
    setStatus(message, 'error');
  }
});

logoutButton.addEventListener('click', () => {
  document.querySelector('#apiToken').value = '';
  document.querySelector('#authLoginCode').value = '';
  currentApiToken = '';
  localStorage.removeItem('emr.apiToken');
  localStorage.removeItem('emr.sessionExpiresAt');
  setStatus('ออกจากระบบแล้ว', '');
  renderRequestPreview();
});

registrationForm.addEventListener('reset', () => {
  window.setTimeout(() => {
    resultTitle.textContent = 'ยังไม่มีรายการใหม่';
    resultList.replaceChildren();
    clearPatientDetail();
    serviceStatus.textContent = 'พร้อมกรอกข้อมูล';
    serviceStatus.className = 'status-pill';
    renderRequestPreview();
  });
});

searchForm.addEventListener('reset', () => {
  window.setTimeout(() => {
    clearPatientDetail();
    resultTitle.textContent = 'ยังไม่ได้เปิดเวชระเบียน';
    resultList.replaceChildren();
    setStatus('พร้อมค้นหา', '');
    renderRequestPreview();
  });
});

adminForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const clinicId = readValue('adminClinicId');
  const apiToken = readValue('apiToken');
  localStorage.setItem('emr.apiToken', apiToken);
  currentApiToken = apiToken;

  setAdminBusy(true);
  setStatus('กำลังโหลดทีม', '');

  try {
    currentAdmin = await fetchAdminBundle(clinicId, apiToken);
    currentClinicSettings = await fetchClinicSettings(clinicId, apiToken).catch(() => null);
    currentFileAssetStoragePolicy = await fetchFileAssetStoragePolicy(apiToken).catch(() => null);
    renderAdminWorkspace(clinicId);
    setStatus('โหลดทีมแล้ว', 'success');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'โหลดทีมไม่สำเร็จ';
    setStatus(message, 'error');
  } finally {
    setAdminBusy(false);
  }
});

queueForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const clinicId = readValue('queueClinicId');
  const apiToken = readValue('apiToken');
  localStorage.setItem('emr.apiToken', apiToken);
  currentApiToken = apiToken;

  setQueueBusy(true);
  setStatus('กำลังโหลดคิว', '');

  try {
    currentQueue = await fetchQueue(clinicId, apiToken);
    currentClinicSettings = await fetchClinicSettings(clinicId, apiToken).catch(() => null);
    currentDailyReport = await fetchDailyOperationsReport(clinicId, apiToken).catch(() => null);
    renderQueueBoard();
    setStatus('โหลดคิวแล้ว', 'success');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'โหลดคิวไม่สำเร็จ';
    setStatus(message, 'error');
  } finally {
    setQueueBusy(false);
  }
});

queueExportButton.addEventListener('click', async () => {
  await exportDailyOperationsCsv();
});

billingForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const clinicId = readValue('billingClinicId');
  const apiToken = readValue('apiToken');
  localStorage.setItem('emr.apiToken', apiToken);
  currentApiToken = apiToken;

  setBillingBusy(true);
  setStatus('กำลังโหลดรายการเงิน', '');

  try {
    currentBilling = await fetchBillingBundle(clinicId, apiToken);
    renderBillingWorkspace();
    setStatus('โหลดรายการเงินแล้ว', 'success');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'โหลดรายการเงินไม่สำเร็จ';
    setStatus(message, 'error');
  } finally {
    setBillingBusy(false);
  }
});

registrationForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const payload = buildPatientPayload();
  const apiToken = readValue('apiToken');
  localStorage.setItem('emr.apiToken', apiToken);

  setBusy(true);
  setStatus('กำลังบันทึก', '');

  try {
    const response = await fetch('/api/patients', {
      method: 'POST',
      headers: buildHeaders(apiToken),
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.detail || result.error || `HTTP ${response.status}`);
    }

    showRegisteredPatient(result.data);
    syncSearchFields(result.data);
    setStatus('บันทึกสำเร็จ', 'success');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'ไม่สามารถบันทึกข้อมูลได้';
    resultTitle.textContent = 'บันทึกไม่สำเร็จ';
    renderResultRows({ Error: message });
    setStatus('บันทึกไม่สำเร็จ', 'error');
  } finally {
    setBusy(false);
  }
});

searchForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const clinicId = readValue('searchClinicId');
  const medicalRecordNumber = readValue('searchMedicalRecordNumber');
  const apiToken = readValue('apiToken');
  localStorage.setItem('emr.apiToken', apiToken);

  setSearchBusy(true);
  setStatus('กำลังค้นหา', '');

  try {
    const patient = await fetchPatientDetail(clinicId, medicalRecordNumber, apiToken);
    const profile = await fetchPatientProfileBundle(patient, apiToken);
    currentClinicalNoteTemplates = await fetchClinicalNoteTemplates(patient.clinic_id, apiToken);
    currentDrugCatalog = await fetchDrugCatalog(patient.clinic_id, apiToken).catch(() => []);
    currentClinicSettings = await fetchClinicSettings(patient.clinic_id, apiToken).catch(() => null);
    showPatientDetail(patient, profile);
    currentApiToken = apiToken;
    setStatus('เปิดเวชระเบียนแล้ว', 'success');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'ไม่พบข้อมูลผู้ป่วย';
    resultTitle.textContent = 'เปิดเวชระเบียนไม่สำเร็จ';
    renderResultRows({ Error: message });
    clearPatientDetail();
    setStatus('ค้นหาไม่สำเร็จ', 'error');
  } finally {
    setSearchBusy(false);
  }
});

renderRequestPreview();

function buildPatientPayload() {
  return compactPayload({
    clinicId: readValue('clinicId'),
    medicalRecordNumber: readValue('medicalRecordNumber'),
    nationalId: readValue('nationalId'),
    firstName: readValue('firstName'),
    middleName: readValue('middleName'),
    lastName: readValue('lastName'),
    preferredName: readValue('preferredName'),
    dateOfBirth: readValue('dateOfBirth'),
    sexAtBirth: readValue('sexAtBirth'),
    phoneNumber: readValue('phoneNumber'),
    email: readValue('email'),
    bloodType: readValue('bloodType'),
    notes: readValue('notes'),
  });
}

function buildSearchRequest() {
  return compactPayload({
    clinicId: readValue('searchClinicId'),
    medicalRecordNumber: readValue('searchMedicalRecordNumber'),
  });
}

function buildAdminRequest() {
  return compactPayload({
    clinicId: readValue('adminClinicId'),
  });
}

function buildQueueRequest() {
  return compactPayload({
    clinicId: readValue('queueClinicId'),
    status: readValue('queueStatus'),
    practitionerId: readValue('queuePractitionerId'),
    roomName: readValue('queueRoomName'),
    reportStartDate: readValue('queueReportStartDate'),
    reportEndDate: readValue('queueReportEndDate'),
    limit: readValue('queueLimit'),
  });
}

function buildBillingRequest() {
  return compactPayload({
    clinicId: readValue('billingClinicId'),
    patientId: readValue('billingPatientId'),
    status: readValue('billingStatus'),
    limit: readValue('billingLimit'),
  });
}

function buildHeaders(apiToken) {
  const headers = {
    'content-type': 'application/json',
    'x-user-role': readValue('userRole') || 'nurse',
  };

  const userId = readValue('userId');
  const practitionerId = readValue('actorPractitionerId');
  if (userId) headers['x-user-id'] = userId;
  if (practitionerId) headers['x-practitioner-id'] = practitionerId;
  if (apiToken) headers.Authorization = `Bearer ${apiToken}`;

  return headers;
}

async function createAuthSession(payload) {
  const response = await fetch('/api/auth/sessions', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.detail || result.error || `HTTP ${response.status}`);
  }

  return result.data;
}

async function fetchPatientDetail(clinicId, medicalRecordNumber, apiToken) {
  const searchParams = new URLSearchParams({ clinicId, medicalRecordNumber });
  const response = await fetch(`/api/patients/detail?${searchParams.toString()}`, {
    headers: buildHeaders(apiToken),
  });
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.detail || result.error || `HTTP ${response.status}`);
  }

  return result.data;
}

async function fetchClinicalProfile(patientId, apiToken) {
  const endpoints = {
    allergies: `/api/patients/${patientId}/allergies`,
    conditions: `/api/patients/${patientId}/conditions`,
    medications: `/api/patients/${patientId}/medications`,
    flags: `/api/patients/${patientId}/flags`,
  };

  const entries = await Promise.all(
    Object.entries(endpoints).map(async ([key, url]) => {
      const response = await fetch(url, { headers: buildHeaders(apiToken) });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.detail || result.error || `HTTP ${response.status}`);
      }

      return [key, result.data ?? []];
    })
  );

  return Object.fromEntries(entries);
}

async function fetchPatientAppointments(patient, apiToken) {
  const searchParams = new URLSearchParams({
    clinicId: patient.clinic_id,
    patientId: patient.id,
  });
  const response = await fetch(`/api/appointments?${searchParams.toString()}`, {
    headers: buildHeaders(apiToken),
  });
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.detail || result.error || `HTTP ${response.status}`);
  }

  return result.data ?? [];
}

async function fetchPatientTimeline(patientId, apiToken) {
  const response = await fetch(`/api/patients/${patientId}/timeline?limit=20`, {
    headers: buildHeaders(apiToken),
  });
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.detail || result.error || `HTTP ${response.status}`);
  }

  return result.data ?? [];
}

async function fetchPatientProfileBundle(patient, apiToken) {
  const [profile, appointments, practitionersPage, timeline] = await Promise.all([
    fetchClinicalProfile(patient.id, apiToken),
    fetchPatientAppointments(patient, apiToken),
    fetchPractitioners(patient.clinic_id, apiToken, { active: 'active', limit: 200, offset: 0 }),
    fetchPatientTimeline(patient.id, apiToken),
  ]);

  return { ...profile, appointments, practitioners: practitionersPage.items, timeline };
}

async function fetchQueue(clinicId, apiToken) {
  const params = new URLSearchParams({ clinicId });
  if (readValue('queueStatus')) params.set('status', readValue('queueStatus'));
  if (readValue('queuePractitionerId')) params.set('practitionerId', readValue('queuePractitionerId'));
  if (readValue('queueRoomName')) params.set('roomName', readValue('queueRoomName'));
  if (readValue('queueLimit')) params.set('limit', readValue('queueLimit'));

  const response = await fetch(`/api/queue?${params.toString()}`, {
    headers: buildHeaders(apiToken),
  });
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.detail || result.error || `HTTP ${response.status}`);
  }

  return result.data ?? [];
}

async function fetchBillingBundle(clinicId, apiToken) {
  const [invoicesPage, chargeTemplatesPage, insuranceClaimsPage, numberSequencesPage, reconciliationsPage, billingSummary] = await Promise.all([
    fetchInvoices(clinicId, apiToken),
    fetchChargeTemplates(clinicId, apiToken),
    fetchInsuranceClaims(clinicId, apiToken),
    fetchBillingNumberSequences(clinicId, apiToken),
    fetchCashierReconciliations(clinicId, apiToken),
    fetchBillingSummary(clinicId, apiToken),
  ]);

  return {
    invoices: invoicesPage.items,
    chargeTemplates: chargeTemplatesPage.items,
    insuranceClaims: insuranceClaimsPage.items,
    numberSequences: numberSequencesPage.items,
    reconciliations: reconciliationsPage.items,
    billingSummary,
  };
}

async function fetchBillingSummary(clinicId, apiToken) {
  const today = new Date().toISOString().slice(0, 10);
  const params = new URLSearchParams({ clinicId, startDate: today, endDate: today });
  const response = await fetch(`/api/reports/billing-summary?${params.toString()}`, {
    headers: buildHeaders(apiToken),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.detail || result.error || `HTTP ${response.status}`);
  return result.data ?? {};
}

async function fetchInvoices(clinicId, apiToken) {
  const params = new URLSearchParams({ clinicId });
  if (readValue('billingPatientId')) params.set('patientId', readValue('billingPatientId'));
  if (readValue('billingStatus')) params.set('status', readValue('billingStatus'));
  if (readValue('billingLimit')) params.set('limit', readValue('billingLimit'));

  const response = await fetch(`/api/invoices?${params.toString()}`, {
    headers: buildHeaders(apiToken),
  });
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.detail || result.error || `HTTP ${response.status}`);
  }

  return {
    items: result.data ?? [],
    meta: result.meta ?? { limit: Number(readValue('billingLimit') || 50), offset: 0, hasMore: false },
  };
}

async function fetchInvoice(invoiceId, apiToken) {
  const response = await fetch(`/api/invoices/${invoiceId}`, {
    headers: buildHeaders(apiToken),
  });
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.detail || result.error || `HTTP ${response.status}`);
  }

  return result.data;
}

async function fetchChargeTemplates(clinicId, apiToken) {
  const params = new URLSearchParams({ clinicId, active: 'active', limit: '100' });
  const response = await fetch(`/api/charge-templates?${params.toString()}`, {
    headers: buildHeaders(apiToken),
  });
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.detail || result.error || `HTTP ${response.status}`);
  }

  return {
    items: result.data ?? [],
    meta: result.meta ?? { limit: 100, offset: 0, hasMore: false },
  };
}

async function fetchInsuranceClaims(clinicId, apiToken) {
  const params = new URLSearchParams({ clinicId, limit: '100' });
  const response = await fetch(`/api/insurance-claims?${params.toString()}`, {
    headers: buildHeaders(apiToken),
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.detail || result.error || `HTTP ${response.status}`);
  }
  return {
    items: result.data ?? [],
    meta: result.meta ?? { limit: 100, offset: 0, hasMore: false },
  };
}

async function fetchBillingNumberSequences(clinicId, apiToken) {
  const params = new URLSearchParams({ clinicId });
  const response = await fetch(`/api/billing-number-sequences?${params.toString()}`, {
    headers: buildHeaders(apiToken),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.detail || result.error || `HTTP ${response.status}`);
  return { items: result.data ?? [] };
}

async function fetchCashierReconciliations(clinicId, apiToken) {
  const params = new URLSearchParams({ clinicId, limit: '20' });
  const response = await fetch(`/api/cashier-reconciliations?${params.toString()}`, {
    headers: buildHeaders(apiToken),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.detail || result.error || `HTTP ${response.status}`);
  return {
    items: result.data ?? [],
    meta: result.meta ?? { limit: 20, offset: 0, hasMore: false },
  };
}

async function fetchPractitioners(clinicId, apiToken, filters = {}) {
  const searchParams = buildAdminSearchParams(clinicId, filters);
  const response = await fetch(`/api/practitioners?${searchParams.toString()}`, {
    headers: buildHeaders(apiToken),
  });
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.detail || result.error || `HTTP ${response.status}`);
  }

  return {
    items: result.data ?? [],
    meta: result.meta ?? { limit: filters.limit ?? 50, offset: filters.offset ?? 0, hasMore: false, nextOffset: null },
  };
}

async function fetchUsers(clinicId, apiToken, filters = {}) {
  const searchParams = buildAdminSearchParams(clinicId, filters);
  const response = await fetch(`/api/users?${searchParams.toString()}`, {
    headers: buildHeaders(apiToken),
  });
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.detail || result.error || `HTTP ${response.status}`);
  }

  return {
    items: result.data ?? [],
    meta: result.meta ?? { limit: filters.limit ?? 50, offset: filters.offset ?? 0, hasMore: false, nextOffset: null },
  };
}

function buildAdminSearchParams(clinicId, filters = {}) {
  const searchParams = new URLSearchParams({ clinicId });
  if (filters.search) searchParams.set('search', filters.search);
  if (filters.active && filters.active !== 'all') searchParams.set('active', filters.active);
  if (filters.limit !== undefined) searchParams.set('limit', String(filters.limit));
  if (filters.offset !== undefined) searchParams.set('offset', String(filters.offset));
  return searchParams;
}

async function fetchAdminBundle(clinicId, apiToken) {
  const [usersPage, practitionersPage, templates] = await Promise.all([
    fetchUsers(clinicId, apiToken, {
      search: currentAdminFilters.usersSearch.trim(),
      active: currentAdminFilters.usersActive,
      limit: currentAdminPagination.usersLimit,
      offset: currentAdminPagination.usersOffset,
    }),
    fetchPractitioners(clinicId, apiToken, {
      search: currentAdminFilters.practitionersSearch.trim(),
      active: currentAdminFilters.practitionersActive,
      limit: currentAdminPagination.practitionersLimit,
      offset: currentAdminPagination.practitionersOffset,
    }),
    fetchClinicalNoteTemplates(clinicId, apiToken, false),
  ]);
  currentAdminMeta = {
    users: usersPage.meta,
    practitioners: practitionersPage.meta,
  };

  currentClinicalNoteTemplates = templates;
  return { users: usersPage.items, practitioners: practitionersPage.items, templates };
}

async function fetchClinicalNoteTemplates(clinicId, apiToken, activeOnly = true) {
  const params = new URLSearchParams({ clinicId });
  if (activeOnly) params.set('active', 'true');

  const response = await fetch(`/api/clinical-note-templates?${params.toString()}`, {
    headers: buildHeaders(apiToken),
  });
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.detail || result.error || `HTTP ${response.status}`);
  }

  return result.data ?? [];
}

async function fetchDrugCatalog(clinicId, apiToken, search = '') {
  const params = new URLSearchParams({
    clinicId,
    active: 'active',
    limit: '200',
    offset: '0',
  });
  if (search) params.set('search', search);

  const response = await fetch(`/api/drug-catalog?${params.toString()}`, {
    headers: buildHeaders(apiToken),
  });
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.detail || result.error || `HTTP ${response.status}`);
  }

  return result.data ?? [];
}

async function fetchClinicSettings(clinicId, apiToken) {
  const response = await fetch(`/api/clinics/${clinicId}/settings`, {
    headers: buildHeaders(apiToken),
  });
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.detail || result.error || `HTTP ${response.status}`);
  }

  return result.data;
}

async function fetchDailyOperationsReport(clinicId, apiToken) {
  const params = new URLSearchParams({
    clinicId,
    startDate: readValue('queueReportStartDate') || new Date().toISOString().slice(0, 10),
    endDate: readValue('queueReportEndDate') || readValue('queueReportStartDate') || new Date().toISOString().slice(0, 10),
  });
  const response = await fetch(`/api/reports/daily-operations?${params.toString()}`, {
    headers: buildHeaders(apiToken),
  });
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.detail || result.error || `HTTP ${response.status}`);
  }

  return result.data;
}

async function fetchFileAssets(clinicId, apiToken, filters = {}) {
  const params = new URLSearchParams({ clinicId });
  if (filters.search) params.set('search', filters.search);
  params.set('limit', String(filters.limit ?? 25));
  params.set('offset', String(filters.offset ?? 0));

  const response = await fetch(`/api/file-assets?${params.toString()}`, {
    headers: buildHeaders(apiToken),
  });
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.detail || result.error || `HTTP ${response.status}`);
  }

  return result.data ?? [];
}

async function createFileAsset(payload, apiToken) {
  const response = await fetch('/api/file-assets', {
    method: 'POST',
    headers: buildHeaders(apiToken),
    body: JSON.stringify(payload),
  });
  const result = await response.json();

  if (!response.ok) throw createApiError(response, result);

  return result.data;
}

async function uploadFileAsset(payload, apiToken) {
  const response = await fetch('/api/file-assets/upload', {
    method: 'POST',
    headers: buildHeaders(apiToken),
    body: JSON.stringify(payload),
  });
  const result = await response.json();

  if (!response.ok) throw createApiError(response, result);

  return result.data;
}

async function fetchFileAssetStoragePolicy(apiToken) {
  const response = await fetch('/api/file-assets/storage-policy', {
    headers: buildHeaders(apiToken),
  });
  const result = await response.json();

  if (!response.ok) throw createApiError(response, result);

  return result.data;
}

async function fetchFileAssetDataUrl(fileAssetId, apiToken) {
  if (logoAssetDataUrls.has(fileAssetId)) return logoAssetDataUrls.get(fileAssetId);

  const response = await fetch(`/api/file-assets/${fileAssetId}/download`, {
    headers: buildHeaders(apiToken),
  });
  if (!response.ok) return '';

  const blob = await response.blob();
  const dataUrl = await blobToDataUrl(blob);
  logoAssetDataUrls.set(fileAssetId, dataUrl);
  return dataUrl;
}

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => resolve(String(reader.result ?? '')));
    reader.addEventListener('error', () => reject(reader.error ?? new Error('อ่านไฟล์ไม่สำเร็จ')));
    reader.readAsDataURL(blob);
  });
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      const result = String(reader.result ?? '');
      resolve(result.includes(',') ? result.split(',').pop() ?? '' : result);
    });
    reader.addEventListener('error', () => reject(reader.error ?? new Error('อ่านไฟล์ไม่สำเร็จ')));
    reader.readAsDataURL(file);
  });
}

async function exportDailyOperationsCsv() {
  const clinicId = readValue('queueClinicId');
  if (!clinicId) {
    setStatus('กรุณาระบุ Clinic ID ก่อน export', 'error');
    return;
  }

  const params = new URLSearchParams({
    clinicId,
    startDate: readValue('queueReportStartDate') || new Date().toISOString().slice(0, 10),
    endDate: readValue('queueReportEndDate') || readValue('queueReportStartDate') || new Date().toISOString().slice(0, 10),
  });
  queueExportButton.disabled = true;
  setStatus('กำลัง export report', '');

  try {
    const response = await fetch(`/api/reports/daily-operations.csv?${params.toString()}`, {
      headers: buildHeaders(currentApiToken || readValue('apiToken')),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `HTTP ${response.status}`);
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `daily-operations-${params.get('startDate')}-${params.get('endDate')}.csv`;
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setStatus('export report แล้ว', 'success');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'export report ไม่สำเร็จ';
    setStatus(message, 'error');
  } finally {
    queueExportButton.disabled = false;
  }
}

function compactPayload(payload) {
  return Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined && value !== '')
  );
}

function readValue(id) {
  const input = document.querySelector(`#${id}`);
  return input?.value?.trim() ?? '';
}

function setActiveView(view) {
  activeView = view || 'registration';

  for (const button of tabButtons) {
    button.classList.toggle('active', button.dataset.view === activeView);
  }

  for (const panel of viewPanels) {
    panel.classList.toggle('active', panel.dataset.viewPanel === activeView);
  }

  const statusText =
    activeView === 'search'
      ? 'พร้อมค้นหา'
      : activeView === 'queue'
        ? 'พร้อมโหลดคิว'
      : activeView === 'billing'
        ? 'พร้อมรับชำระ'
      : activeView === 'admin'
        ? 'พร้อมตั้งค่า'
        : 'พร้อมกรอกข้อมูล';
  setStatus(statusText, '');
  renderRequestPreview();
}

function setBusy(isBusy) {
  submitButton.disabled = isBusy;
  submitButton.textContent = isBusy ? 'กำลังบันทึก' : 'บันทึกผู้ป่วย';
}

function setSearchBusy(isBusy) {
  searchButton.disabled = isBusy;
  searchButton.textContent = isBusy ? 'กำลังค้นหา' : 'เปิดเวชระเบียน';
}

function setAdminBusy(isBusy) {
  adminLoadButton.disabled = isBusy;
  adminLoadButton.textContent = isBusy ? 'กำลังโหลด' : 'โหลดทีมคลินิก';
}

function setQueueBusy(isBusy) {
  queueLoadButton.disabled = isBusy;
  queueExportButton.disabled = isBusy;
  queueLoadButton.textContent = isBusy ? 'กำลังโหลด' : 'โหลดคิว';
}

function setBillingBusy(isBusy) {
  billingLoadButton.disabled = isBusy;
  billingLoadButton.textContent = isBusy ? 'กำลังโหลด' : 'โหลดรายการเงิน';
}

function setStatus(text, mode) {
  serviceStatus.textContent = text;
  serviceStatus.className = mode ? `status-pill ${mode}` : 'status-pill';
}

function createApiError(response, result) {
  const error = new Error(result.detail || result.error || `HTTP ${response.status}`);
  error.status = response.status;
  error.apiError = result.error;
  error.detail = result.detail;
  return error;
}

function friendlyAdminError(error) {
  if (error?.status === 409 && error?.apiError === 'Duplicate record') {
    const detail = String(error.detail ?? '');
    if (detail.includes('users') || detail.includes('username')) {
      return 'Username นี้มีอยู่ในคลินิกแล้ว';
    }
    if (detail.includes('practitioner_code')) {
      return 'Practitioner code นี้มีอยู่ในคลินิกแล้ว';
    }
    if (detail.includes('user_id')) {
      return 'User นี้ถูกผูกกับ practitioner อื่นแล้ว';
    }
    return 'รายการนี้ซ้ำกับข้อมูลที่มีอยู่แล้ว';
  }

  if (error?.status === 422 && error?.apiError === 'Referenced record was not found') {
    return 'ข้อมูลที่อ้างอิงไม่พบในระบบ กรุณาตรวจสอบ Clinic ID หรือ User ID';
  }

  return error instanceof Error ? error.message : 'ดำเนินการไม่สำเร็จ';
}

function showRegisteredPatient(patient) {
  resultTitle.textContent = `${patient.first_name} ${patient.last_name}`;
  renderResultRows({
    'Patient ID': patient.id,
    Clinic: patient.clinic_id,
    MRN: patient.medical_record_number,
    Sex: patient.sex_at_birth,
    Phone: patient.phone_number,
    Email: patient.email,
  });
}

function showPatientDetail(patient, profile = {}) {
  currentPatient = patient;
  currentProfile = profile;

  const encounters = patient.encounters ?? [];
  const derived = buildEncounterDerivedLists(encounters);
  const flags = profile.flags ?? patient.flags ?? [];
  const allergies = profile.allergies ?? [];
  const conditions = profile.conditions ?? [];
  const medications = profile.medications ?? [];
  const appointments = profile.appointments ?? [];
  const practitioners = profile.practitioners ?? [];
  const timeline = profile.timeline ?? [];

  resultTitle.textContent = `${patient.first_name} ${patient.last_name}`;
  renderResultRows({
    'Patient ID': patient.id,
    Clinic: patient.clinic_id,
    MRN: patient.medical_record_number,
    Sex: patient.sex_at_birth,
    Phone: patient.phone_number,
    Email: patient.email,
  });

  patientDetailPanel.hidden = false;
  patientDetail.replaceChildren(
    createAppointmentForm(patient),
    createEncounterEntryForm(patient),
    createMetricGrid([
      ['Active Flags', flags.length],
      ['Appointments', appointments.length],
      ['Encounters', encounters.length],
      ['Allergies', allergies.length],
      ['Conditions', conditions.length],
      ['Medications', medications.length],
      ['Practitioners', practitioners.length],
      ['Timeline', timeline.length],
    ]),
    createTimelinePanel(timeline),
    createProfileTabs({
      Flags: records(flags, flagSummary, ['severity', 'status', 'notes'], 'Flags'),
      Allergies: records(allergies, allergySummary, ['severity', 'status', 'reaction'], 'Allergies'),
      Conditions: records(conditions, conditionSummary, ['clinical_status', 'onset_date', 'notes'], 'Conditions'),
      Medications: records(medications, medicationSummary, ['status', 'dosage', 'frequency'], 'Medications'),
      Appointments: records(appointments, appointmentSummary, [
        'status',
        'scheduled_start_at',
        'scheduled_end_at',
        'reason',
      ], 'Appointments'),
      Encounters: records(encounters, encounterSummary, ['status', 'encounter_class', 'started_at']),
      Diagnoses: records(derived.diagnoses, diagnosisSummary, ['status', 'diagnosis_type', 'diagnosed_at']),
      Vitals: records(derived.vitalSigns, vitalSummary, [
        'body_temperature_c',
        'heart_rate_bpm',
        'oxygen_saturation_pct',
      ]),
      Prescriptions: records(derived.prescriptions, prescriptionSummary, [
        'status',
        'dosage',
        'frequency',
      ], 'Prescriptions'),
      Notes: records(derived.clinicalNotes, noteSummary, [
        'status',
        'note_type',
        'authored_at',
        'finalized_at',
        'signed_at',
      ], 'Notes'),
    }, currentProfileSection)
  );
}

function createTimelinePanel(timeline) {
  const section = document.createElement('section');
  section.className = 'timeline-panel';
  const title = document.createElement('h3');
  title.textContent = 'Timeline';
  section.append(title);

  const list = document.createElement('div');
  list.className = 'timeline-list';
  for (const item of timeline.slice(0, 8)) {
    const row = document.createElement('div');
    row.className = 'timeline-item';
    const action = document.createElement('strong');
    action.textContent = `${item.action ?? 'event'} · ${item.entity_type ?? 'record'}`;
    const time = document.createElement('span');
    time.textContent = item.created_at ? formatValue(item.created_at) : '';
    row.append(action, time);
    list.append(row);
  }

  if (timeline.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'muted-note';
    empty.textContent = 'ยังไม่มี timeline';
    list.append(empty);
  }

  section.append(list);
  return section;
}

function renderQueueBoard() {
  queueBoard.hidden = false;
  const groups = ['waiting', 'in_room', 'with_doctor', 'completed', 'discharged', 'cancelled'];
  const fragment = document.createDocumentFragment();
  fragment.append(createQueueSummary());
  fragment.append(createOperationsCharts());
  const columns = document.createElement('div');
  columns.className = 'queue-board';

  for (const status of groups) {
    const column = document.createElement('section');
    column.className = 'queue-column';
    const title = document.createElement('h3');
    const items = currentQueue.filter((visit) => visit.status === status);
    title.textContent = `${status.replaceAll('_', ' ')} (${items.length})`;
    column.append(title);

    for (const visit of items) {
      const card = createRecordCard(visit, visitSummary, [
        'queue_label',
        'medical_record_number',
        'encounter_id',
        'practitioner_id',
        'practitioner_first_name',
        'practitioner_last_name',
        'room_name',
        'checked_in_at',
      ]);
      card.append(createVisitActions(visit));
      column.append(card);
    }

    columns.append(column);
  }

  fragment.append(columns);
  queueBoard.replaceChildren(fragment);
}

function renderBillingWorkspace() {
  billingWorkspace.hidden = false;
  const invoices = currentBilling.invoices ?? [];
  const summary = currentBilling.billingSummary ?? {};
  const openTotal = invoices
    .filter((invoice) => !['paid', 'voided'].includes(invoice.status))
    .reduce((sum, invoice) => sum + Number(invoice.balance_amount ?? 0), 0);
  const paidTotal = invoices.reduce((sum, invoice) => sum + Number(invoice.paid_amount ?? 0), 0);

  const fragment = document.createDocumentFragment();
  fragment.append(createMetricGrid([
    ['Invoices', invoices.length],
    ['Open balance', formatMoney(openTotal)],
    ['Paid', formatMoney(paidTotal)],
    ['Today cash', formatMoney(summary.cash_total ?? 0)],
    ['Today net', formatMoney(summary.net_total ?? 0)],
    ['Templates', currentBilling.chargeTemplates.length],
    ['Claims', currentBilling.insuranceClaims.length],
  ]));
  fragment.append(createBillingOperationsPanel());
  fragment.append(createInvoiceCreateForm());
  fragment.append(createAutoChargeCaptureForm());
  fragment.append(createChargeTemplateForm());

  const list = document.createElement('div');
  list.className = 'record-list';
  for (const invoice of invoices) {
    list.append(createInvoiceCard(invoice));
  }

  if (invoices.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'muted-text';
    empty.textContent = 'ยังไม่มี invoice ตามเงื่อนไขนี้';
    fragment.append(empty);
  } else {
    fragment.append(list);
  }

  billingWorkspace.replaceChildren(fragment);
}

function createBillingOperationsPanel() {
  const section = document.createElement('section');
  section.className = 'inline-profile-form billing-form';

  const heading = document.createElement('div');
  heading.className = 'inline-form-heading';
  const title = document.createElement('h3');
  title.textContent = 'งานบัญชีแคชเชียร์';
  const hint = document.createElement('span');
  hint.textContent = 'Phase 3B';
  heading.append(title, hint);
  section.append(heading);

  const sequenceActions = document.createElement('div');
  sequenceActions.className = 'record-actions';
  const createSequence = document.createElement('button');
  createSequence.type = 'button';
  createSequence.className = 'secondary-button small-button';
  createSequence.textContent = 'ตั้งเลขเอกสาร';
  createSequence.addEventListener('click', createBillingNumberSequencePrompt);
  const issueNumber = document.createElement('button');
  issueNumber.type = 'button';
  issueNumber.className = 'primary-button small-button';
  issueNumber.textContent = 'ออกเลขเอกสาร';
  issueNumber.addEventListener('click', issueBillingNumberPrompt);
  sequenceActions.append(createSequence, issueNumber);
  section.append(sequenceActions);

  section.append(createBillingOperationList('ชุดเลขเอกสาร', currentBilling.numberSequences ?? [], [
    'document_type',
    'prefix',
    'next_number',
    'padding',
    'is_active',
  ]));

  const reconciliationForm = document.createElement('form');
  reconciliationForm.className = 'nested-inline-form';
  reconciliationForm.append(
    createBillingInput('reconciliationDate', 'Reconciliation date', new Date().toISOString().slice(0, 10), true, 'date'),
    createBillingInput('openingCashAmount', 'Opening cash', '0', false, 'number')
  );
  const openButton = document.createElement('button');
  openButton.type = 'submit';
  openButton.className = 'secondary-button compact-button';
  openButton.textContent = 'เปิดรอบเงินสด';
  reconciliationForm.append(openButton);
  reconciliationForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    await createCashierReconciliationFromForm(reconciliationForm, openButton);
  });
  section.append(reconciliationForm);

  section.append(createBillingOperationList('รอบปิดเงินสด', currentBilling.reconciliations ?? [], [
    'reconciliation_date',
    'status',
    'opening_cash_amount',
    'expected_cash_amount',
    'counted_cash_amount',
    'variance_amount',
  ], createCloseCashierReconciliationAction));

  return section;
}

function createBillingOperationList(titleText, rows, fields, actionFactory) {
  const wrapper = document.createElement('section');
  wrapper.className = 'compact-table-section';
  const title = document.createElement('h4');
  title.textContent = titleText;
  wrapper.append(title);
  if (rows.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'muted-text';
    empty.textContent = 'ยังไม่มีรายการ';
    wrapper.append(empty);
    return wrapper;
  }

  for (const row of rows) {
    const item = document.createElement('dl');
    for (const field of fields) {
      const term = document.createElement('dt');
      term.textContent = labelize(field);
      const description = document.createElement('dd');
      description.textContent = formatValue(row[field]);
      item.append(term, description);
    }
    if (actionFactory) item.append(actionFactory(row));
    wrapper.append(item);
  }
  return wrapper;
}

function createInvoiceCreateForm() {
  const form = document.createElement('form');
  form.className = 'inline-profile-form billing-form';

  const heading = document.createElement('div');
  heading.className = 'inline-form-heading';
  const title = document.createElement('h3');
  title.textContent = 'สร้าง invoice';
  const hint = document.createElement('span');
  hint.textContent = 'cashier';
  heading.append(title, hint);
  form.append(heading);

  form.append(
    createBillingInput('patientId', 'Patient ID', readValue('billingPatientId'), true),
    createBillingInput('invoiceNumber', 'Invoice number', `INV-${Date.now().toString().slice(-8)}`, true),
    createBillingInput('receiptNumber', 'Receipt number', ''),
    createBillingInput('taxInvoiceNumber', 'Tax invoice number', ''),
    createFormField('notes', 'Notes', 'textarea')
  );

  const lines = document.createElement('div');
  lines.className = 'invoice-lines-editor';
  lines.append(createInvoiceLineEditorRow());
  const addLine = document.createElement('button');
  addLine.type = 'button';
  addLine.className = 'secondary-button compact-button';
  addLine.textContent = 'เพิ่ม line item';
  addLine.addEventListener('click', () => lines.append(createInvoiceLineEditorRow()));
  form.append(lines, addLine);

  const submit = document.createElement('button');
  submit.type = 'submit';
  submit.className = 'primary-button compact-button';
  submit.textContent = 'สร้าง invoice';
  form.append(submit);

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    await createInvoiceFromForm(form, submit);
  });

  return form;
}

function createAutoChargeCaptureForm() {
  const form = document.createElement('form');
  form.className = 'inline-profile-form billing-form';
  const heading = document.createElement('div');
  heading.className = 'inline-form-heading';
  const title = document.createElement('h3');
  title.textContent = 'สร้าง invoice จาก encounter';
  const hint = document.createElement('span');
  hint.textContent = 'auto charge';
  heading.append(title, hint);
  form.append(heading);
  form.append(
    createBillingInput('patientId', 'Patient ID', readValue('billingPatientId'), true),
    createEncounterBillingSelect(),
    createBillingInput('invoiceNumber', 'Invoice number', `INV-${Date.now().toString().slice(-8)}`, true),
    createBillingInput('receiptNumber', 'Receipt number', ''),
    createBillingInput('taxInvoiceNumber', 'Tax invoice number', ''),
    createFormField('notes', 'Notes', 'textarea')
  );
  const submit = document.createElement('button');
  submit.type = 'submit';
  submit.className = 'secondary-button compact-button';
  submit.textContent = 'ดึง charge จาก encounter';
  form.append(submit);
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    await createInvoiceFromEncounterForm(form, submit);
  });
  return form;
}

function createInvoiceLineEditorRow(item = {}) {
  const row = document.createElement('div');
  row.className = 'invoice-line-row';
  row.append(
    createBillingSelect('itemType', 'Type', [
      ['visit', 'visit'],
      ['procedure', 'procedure'],
      ['medication', 'medication'],
      ['lab', 'lab'],
      ['discount', 'discount'],
      ['other', 'other'],
    ], item.itemType ?? 'procedure'),
    createBillingSelect('chargeTemplateId', 'Template', [
      ['', 'กำหนดเอง'],
      ...currentBilling.chargeTemplates.map((template) => [
        template.id,
        `${template.code ?? ''} · ${template.description ?? ''} · ${formatMoney(template.unit_price_amount ?? 0)}`,
      ]),
    ], item.chargeTemplateId ?? ''),
    createBillingInput('description', 'Description', item.description ?? '', true),
    createBillingInput('quantity', 'Qty', item.quantity ?? '1', true, 'number'),
    createBillingInput('unitPriceAmount', 'Unit price', item.unitPriceAmount ?? '', true, 'number'),
    createBillingInput('discountAmount', 'Discount', item.discountAmount ?? '0', false, 'number'),
    createBillingInput('taxAmount', 'Tax', item.taxAmount ?? '0', false, 'number')
  );
  const remove = document.createElement('button');
  remove.type = 'button';
  remove.className = 'secondary-button danger-button small-button';
  remove.textContent = 'ลบ line';
  remove.addEventListener('click', () => {
    if (row.parentElement?.querySelectorAll('.invoice-line-row').length === 1) return;
    row.remove();
  });
  row.append(remove);
  const templateSelect = row.querySelector('select[name="chargeTemplateId"]');
  templateSelect.addEventListener('change', () => {
    const template = currentBilling.chargeTemplates.find((entry) => entry.id === templateSelect.value);
    if (!template) return;
    row.querySelector('[name="itemType"]').value = template.item_type ?? 'procedure';
    row.querySelector('[name="description"]').value = template.description ?? '';
    row.querySelector('[name="unitPriceAmount"]').value = template.unit_price_amount ?? '';
    row.querySelector('[name="taxAmount"]').value = template.tax_amount ?? '0';
  });
  return row;
}

function createChargeTemplateForm() {
  const form = document.createElement('form');
  form.className = 'inline-profile-form billing-form';

  const heading = document.createElement('div');
  heading.className = 'inline-form-heading';
  const title = document.createElement('h3');
  title.textContent = 'เพิ่ม charge template';
  const hint = document.createElement('span');
  hint.textContent = 'common fees';
  heading.append(title, hint);
  form.append(heading);

  form.append(
    createBillingInput('code', 'Code', '', true),
    createBillingInput('description', 'Description', '', true),
    createBillingSelect('itemType', 'Type', [
      ['visit', 'visit'],
      ['procedure', 'procedure'],
      ['medication', 'medication'],
      ['lab', 'lab'],
      ['other', 'other'],
    ]),
    createBillingInput('unitPriceAmount', 'Unit price', '', true, 'number'),
    createBillingInput('taxAmount', 'Tax', '0', false, 'number'),
    createFormField('notes', 'Notes', 'textarea')
  );

  const submit = document.createElement('button');
  submit.type = 'submit';
  submit.className = 'secondary-button compact-button';
  submit.textContent = 'เพิ่ม template';
  form.append(submit);

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    await createChargeTemplateFromForm(form, submit);
  });

  return form;
}

function createInvoiceCard(invoice) {
  const card = createRecordCard(invoice, invoiceSummary, [
    'status',
    'invoice_number',
    'patient_id',
    'total_amount',
    'paid_amount',
    'refunded_amount',
    'balance_amount',
    'issued_at',
  ]);
  card.append(createInvoiceActions(invoice));
  return card;
}

function createInvoiceActions(invoice) {
  const wrapper = document.createElement('div');
  wrapper.className = 'invoice-action-stack';
  const actions = document.createElement('div');
  actions.className = 'record-actions';

  const openButton = document.createElement('button');
  openButton.type = 'button';
  openButton.className = 'secondary-button small-button';
  openButton.textContent = 'เปิดรายละเอียด';
  openButton.addEventListener('click', async () => {
    await expandInvoiceDetails(wrapper, invoice.id);
  });

  const receiptButton = document.createElement('button');
  receiptButton.type = 'button';
  receiptButton.className = 'secondary-button small-button';
  receiptButton.textContent = 'พิมพ์ใบเสร็จ';
  receiptButton.addEventListener('click', async () => {
    const detail = await fetchInvoice(invoice.id, currentApiToken || readValue('apiToken'));
    openReceiptPrint(detail);
  });

  actions.append(openButton, receiptButton);
  if (invoice.status !== 'voided') {
    actions.append(
      createPaymentAction(invoice),
      createRefundAction(invoice),
      createEditInvoiceAction(invoice),
      createClaimAction(invoice),
      createVoidInvoiceAction(invoice)
    );
  }

  wrapper.append(actions);
  return wrapper;
}

function createEditInvoiceAction(invoice) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'secondary-button small-button';
  button.textContent = 'แก้ invoice';
  button.addEventListener('click', async () => {
    const detail = await fetchInvoice(invoice.id, currentApiToken || readValue('apiToken'));
    const receiptNumber = window.prompt('Receipt number', detail.receipt_number ?? '') ?? '';
    const taxInvoiceNumber = window.prompt('Tax invoice number', detail.tax_invoice_number ?? '') ?? '';
    await postInvoiceAction(`/api/invoices/${invoice.id}`, {
      receiptNumber,
      taxInvoiceNumber,
      receiptIssuedAt: receiptNumber ? new Date().toISOString() : undefined,
    }, 'PATCH');
  });
  return button;
}

function createClaimAction(invoice) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'secondary-button small-button';
  button.textContent = 'สร้าง claim';
  button.addEventListener('click', async () => {
    const insurerName = window.prompt('Insurer name');
    if (!insurerName) return;
    await postInsuranceClaim({
      clinicId: invoice.clinic_id,
      patientId: invoice.patient_id,
      invoiceId: invoice.id,
      claimNumber: `CLM-${Date.now().toString().slice(-8)}`,
      insurerName,
      status: 'draft',
      approvedAmount: 0,
      paidAmount: 0,
    });
  });
  return button;
}

async function expandInvoiceDetails(container, invoiceId) {
  setStatus('กำลังโหลด invoice', '');
  try {
    const invoice = await fetchInvoice(invoiceId, currentApiToken || readValue('apiToken'));
    container.querySelector('.invoice-detail')?.remove();
    const detail = document.createElement('div');
    detail.className = 'invoice-detail';
    detail.append(
      createInvoiceTable('Line items', invoice.line_items ?? [], ['description', 'quantity', 'unit_price_amount', 'tax_amount', 'line_total_amount']),
      createInvoiceTable('Payments', invoice.payments ?? [], ['payment_number', 'method', 'amount', 'paid_at']),
      createInvoiceTable('Refunds', invoice.refunds ?? [], ['refund_number', 'method', 'amount', 'refunded_at']),
      createInvoiceTable('Claims', currentBilling.insuranceClaims.filter((claim) => claim.invoice_id === invoice.id), [
        'claim_number',
        'status',
        'insurer_name',
        'approved_amount',
        'paid_amount',
      ])
    );
    container.append(detail);
    setStatus('เปิด invoice แล้ว', 'success');
  } catch (error) {
    setStatus(error instanceof Error ? error.message : 'เปิด invoice ไม่สำเร็จ', 'error');
  }
}

function createInvoiceTable(titleText, rows, fields) {
  const section = document.createElement('section');
  section.className = 'compact-table-section';
  const title = document.createElement('h4');
  title.textContent = titleText;
  section.append(title);
  if (rows.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'muted-text';
    empty.textContent = 'ยังไม่มีรายการ';
    section.append(empty);
    return section;
  }

  for (const row of rows) {
    const item = document.createElement('dl');
    for (const field of fields) {
      const term = document.createElement('dt');
      term.textContent = labelize(field);
      const description = document.createElement('dd');
      description.textContent = formatValue(row[field]);
      item.append(term, description);
    }
    section.append(item);
  }
  return section;
}

function createPaymentAction(invoice) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'primary-button small-button';
  button.textContent = 'รับชำระ';
  button.addEventListener('click', async () => {
    const amount = window.prompt('ยอดรับชำระ', invoice.balance_amount ?? '');
    if (!amount) return;
    await postInvoiceAction(`/api/invoices/${invoice.id}/payments`, {
      paymentNumber: `PAY-${Date.now().toString().slice(-8)}`,
      method: 'cash',
      amount,
      receivedByUserId: readValue('userId'),
    });
  });
  return button;
}

function createRefundAction(invoice) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'secondary-button small-button';
  button.textContent = 'คืนเงิน';
  button.addEventListener('click', async () => {
    const amount = window.prompt('ยอดคืนเงิน', invoice.paid_amount ?? '');
    if (!amount) return;
    await postInvoiceAction(`/api/invoices/${invoice.id}/refunds`, {
      refundNumber: `REF-${Date.now().toString().slice(-8)}`,
      method: 'cash',
      amount,
      refundedByUserId: readValue('userId'),
    });
  });
  return button;
}

function createVoidInvoiceAction(invoice) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'secondary-button danger-button small-button';
  button.textContent = 'Void';
  button.addEventListener('click', async () => {
    const voidReason = window.prompt('เหตุผลที่ void invoice');
    if (!voidReason) return;
    await postInvoiceAction(`/api/invoices/${invoice.id}/void`, { voidReason }, 'PATCH');
  });
  return button;
}

async function createInvoiceFromForm(form, submit) {
  const values = Object.fromEntries(new FormData(form).entries());
  const lineItems = Array.from(form.querySelectorAll('.invoice-line-row')).map((row) => {
    const line = Object.fromEntries(
      Array.from(row.querySelectorAll('input, select, textarea')).map((input) => [input.name, input.value])
    );
    return compactPayload({
      itemType: line.itemType,
      description: line.description,
      quantity: line.quantity,
      unitPriceAmount: line.unitPriceAmount,
      discountAmount: line.discountAmount,
      taxAmount: line.taxAmount,
    });
  });
  const payload = compactPayload({
    clinicId: readValue('billingClinicId'),
    patientId: values.patientId,
    invoiceNumber: values.invoiceNumber,
    status: 'issued',
    receiptNumber: values.receiptNumber,
    taxInvoiceNumber: values.taxInvoiceNumber,
    receiptIssuedAt: values.receiptNumber ? new Date().toISOString() : '',
    notes: values.notes,
    lineItems,
  });

  submit.disabled = true;
  submit.textContent = 'กำลังสร้าง';
  try {
    const response = await fetch('/api/invoices', {
      method: 'POST',
      headers: buildHeaders(currentApiToken || readValue('apiToken')),
      body: JSON.stringify(payload),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.detail || result.error || `HTTP ${response.status}`);
    form.reset();
    await reloadBillingWorkspace();
    setStatus('สร้าง invoice แล้ว', 'success');
  } catch (error) {
    renderInlineFormError(form, error instanceof Error ? error.message : 'สร้าง invoice ไม่สำเร็จ');
    setStatus('สร้าง invoice ไม่สำเร็จ', 'error');
  } finally {
    submit.disabled = false;
    submit.textContent = 'สร้าง invoice';
  }
}

async function createInvoiceFromEncounterForm(form, submit) {
  const values = Object.fromEntries(new FormData(form).entries());
  const payload = compactPayload({
    clinicId: readValue('billingClinicId'),
    patientId: values.patientId,
    encounterId: values.encounterId,
    invoiceNumber: values.invoiceNumber,
    receiptNumber: values.receiptNumber,
    taxInvoiceNumber: values.taxInvoiceNumber,
    notes: values.notes,
    includeVisitCharge: true,
    includePrescriptions: true,
  });
  submit.disabled = true;
  submit.textContent = 'กำลังดึง charge';
  try {
    const response = await fetch('/api/invoices/from-encounter', {
      method: 'POST',
      headers: buildHeaders(currentApiToken || readValue('apiToken')),
      body: JSON.stringify(payload),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.detail || result.error || `HTTP ${response.status}`);
    form.reset();
    await reloadBillingWorkspace();
    setStatus('สร้าง invoice จาก encounter แล้ว', 'success');
  } catch (error) {
    renderInlineFormError(form, error instanceof Error ? error.message : 'ดึง charge ไม่สำเร็จ');
    setStatus('ดึง charge ไม่สำเร็จ', 'error');
  } finally {
    submit.disabled = false;
    submit.textContent = 'ดึง charge จาก encounter';
  }
}

async function postInsuranceClaim(payload) {
  setStatus('กำลังสร้าง claim', '');
  try {
    const response = await fetch('/api/insurance-claims', {
      method: 'POST',
      headers: buildHeaders(currentApiToken || readValue('apiToken')),
      body: JSON.stringify(payload),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.detail || result.error || `HTTP ${response.status}`);
    await reloadBillingWorkspace();
    setStatus('สร้าง claim แล้ว', 'success');
  } catch (error) {
    setStatus(error instanceof Error ? error.message : 'สร้าง claim ไม่สำเร็จ', 'error');
  }
}

async function createChargeTemplateFromForm(form, submit) {
  const values = Object.fromEntries(new FormData(form).entries());
  const payload = compactPayload({
    clinicId: readValue('billingClinicId'),
    code: values.code,
    description: values.description,
    itemType: values.itemType,
    unitPriceAmount: values.unitPriceAmount,
    taxAmount: values.taxAmount,
    notes: values.notes,
  });

  submit.disabled = true;
  submit.textContent = 'กำลังเพิ่ม';
  try {
    const response = await fetch('/api/charge-templates', {
      method: 'POST',
      headers: buildHeaders(currentApiToken || readValue('apiToken')),
      body: JSON.stringify(payload),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.detail || result.error || `HTTP ${response.status}`);
    form.reset();
    await reloadBillingWorkspace();
    setStatus('เพิ่ม charge template แล้ว', 'success');
  } catch (error) {
    renderInlineFormError(form, error instanceof Error ? error.message : 'เพิ่ม template ไม่สำเร็จ');
    setStatus('เพิ่ม template ไม่สำเร็จ', 'error');
  } finally {
    submit.disabled = false;
    submit.textContent = 'เพิ่ม template';
  }
}

async function createBillingNumberSequencePrompt() {
  const documentType = window.prompt('Document type: invoice, receipt, tax_invoice, claim', 'receipt');
  if (!documentType) return;
  const prefix = window.prompt('Prefix', `${documentType.toUpperCase()}-`);
  if (!prefix) return;
  const nextNumber = window.prompt('Next number', '1');
  if (!nextNumber) return;
  const padding = window.prompt('Padding', '6');
  if (!padding) return;

  setStatus('กำลังตั้งเลขเอกสาร', '');
  try {
    const response = await fetch('/api/billing-number-sequences', {
      method: 'POST',
      headers: buildHeaders(currentApiToken || readValue('apiToken')),
      body: JSON.stringify({
        clinicId: readValue('billingClinicId'),
        documentType,
        prefix,
        nextNumber: Number(nextNumber),
        padding: Number(padding),
      }),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.detail || result.error || `HTTP ${response.status}`);
    await reloadBillingWorkspace();
    setStatus('ตั้งเลขเอกสารแล้ว', 'success');
  } catch (error) {
    setStatus(error instanceof Error ? error.message : 'ตั้งเลขเอกสารไม่สำเร็จ', 'error');
  }
}

async function issueBillingNumberPrompt() {
  const documentType = window.prompt('Document type: invoice, receipt, tax_invoice, claim', 'receipt');
  if (!documentType) return;
  setStatus('กำลังออกเลขเอกสาร', '');
  try {
    const response = await fetch('/api/billing-number-sequences/issue', {
      method: 'POST',
      headers: buildHeaders(currentApiToken || readValue('apiToken')),
      body: JSON.stringify({ clinicId: readValue('billingClinicId'), documentType }),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.detail || result.error || `HTTP ${response.status}`);
    await reloadBillingWorkspace();
    setStatus(`เลขเอกสารใหม่: ${result.data?.documentNumber ?? ''}`, 'success');
  } catch (error) {
    setStatus(error instanceof Error ? error.message : 'ออกเลขเอกสารไม่สำเร็จ', 'error');
  }
}

async function createCashierReconciliationFromForm(form, submit) {
  const values = Object.fromEntries(new FormData(form).entries());
  submit.disabled = true;
  submit.textContent = 'กำลังเปิดรอบ';
  try {
    const response = await fetch('/api/cashier-reconciliations', {
      method: 'POST',
      headers: buildHeaders(currentApiToken || readValue('apiToken')),
      body: JSON.stringify(compactPayload({
        clinicId: readValue('billingClinicId'),
        reconciliationDate: values.reconciliationDate,
        openingCashAmount: values.openingCashAmount,
        openedByUserId: readValue('userId'),
      })),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.detail || result.error || `HTTP ${response.status}`);
    await reloadBillingWorkspace();
    setStatus('เปิดรอบเงินสดแล้ว', 'success');
  } catch (error) {
    renderInlineFormError(form, error instanceof Error ? error.message : 'เปิดรอบเงินสดไม่สำเร็จ');
    setStatus('เปิดรอบเงินสดไม่สำเร็จ', 'error');
  } finally {
    submit.disabled = false;
    submit.textContent = 'เปิดรอบเงินสด';
  }
}

function createCloseCashierReconciliationAction(reconciliation) {
  const wrapper = document.createElement('dd');
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'secondary-button small-button';
  button.textContent = 'ปิดรอบ';
  button.disabled = reconciliation.status !== 'open';
  button.addEventListener('click', async () => {
    const countedCashAmount = window.prompt('ยอดเงินสดที่นับได้', reconciliation.expected_cash_amount ?? '');
    if (!countedCashAmount) return;
    await closeCashierReconciliation(reconciliation.id, countedCashAmount);
  });
  wrapper.append(button);
  return wrapper;
}

async function closeCashierReconciliation(reconciliationId, countedCashAmount) {
  setStatus('กำลังปิดรอบเงินสด', '');
  try {
    const response = await fetch(`/api/cashier-reconciliations/${reconciliationId}/close`, {
      method: 'PATCH',
      headers: buildHeaders(currentApiToken || readValue('apiToken')),
      body: JSON.stringify({
        countedCashAmount,
        closedByUserId: readValue('userId'),
      }),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.detail || result.error || `HTTP ${response.status}`);
    await reloadBillingWorkspace();
    setStatus('ปิดรอบเงินสดแล้ว', 'success');
  } catch (error) {
    setStatus(error instanceof Error ? error.message : 'ปิดรอบเงินสดไม่สำเร็จ', 'error');
  }
}

async function postInvoiceAction(url, payload, method = 'POST') {
  setStatus('กำลังบันทึกรายการเงิน', '');
  try {
    const response = await fetch(url, {
      method,
      headers: buildHeaders(currentApiToken || readValue('apiToken')),
      body: JSON.stringify(payload),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.detail || result.error || `HTTP ${response.status}`);
    await reloadBillingWorkspace();
    setStatus('บันทึกรายการเงินแล้ว', 'success');
  } catch (error) {
    setStatus(error instanceof Error ? error.message : 'บันทึกรายการเงินไม่สำเร็จ', 'error');
  }
}

async function reloadBillingWorkspace() {
  currentBilling = await fetchBillingBundle(readValue('billingClinicId'), currentApiToken || readValue('apiToken'));
  renderBillingWorkspace();
}

function createBillingInput(name, labelText, value = '', required = false, type = 'text') {
  const field = createFormField(name, labelText, 'input', required);
  const input = field.querySelector('input');
  input.value = value ?? '';
  input.type = type;
  if (type === 'number') input.step = '0.01';
  return field;
}

function createBillingSelect(name, labelText, options, selectedValue = '') {
  const label = document.createElement('label');
  label.textContent = labelText;
  const select = document.createElement('select');
  select.name = name;
  for (const [value, text] of options) {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = text;
    select.append(option);
  }
  select.value = selectedValue;
  label.append(select);
  return label;
}

function createEncounterBillingSelect() {
  const options = [['', 'เลือก encounter']];
  for (const encounter of currentPatient?.encounters ?? []) {
    options.push([encounter.id, `${encounter.encounter_number ?? encounter.id} · ${encounter.status ?? ''}`]);
  }
  const field = createBillingSelect('encounterId', 'Encounter', options);
  field.querySelector('select').required = true;
  return field;
}

function createQueueSummary() {
  const activeVisits = currentQueue.filter((visit) => !['discharged', 'cancelled'].includes(visit.status));
  const providerCount = new Set(activeVisits.map((visit) => visit.practitioner_id).filter(Boolean)).size;
  const roomCount = new Set(activeVisits.map((visit) => visit.room_name).filter(Boolean)).size;
  const report = currentDailyReport ?? {};

  return createMetricGrid([
    ['Active Queue', activeVisits.length],
    ['Waiting', currentQueue.filter((visit) => visit.status === 'waiting').length],
    ['With Doctor', currentQueue.filter((visit) => visit.status === 'with_doctor').length],
    ['Providers', providerCount],
    ['Rooms', roomCount],
    ['Daily Visits', report.visits_total ?? 0],
    ['Daily Dx', report.diagnoses_total ?? 0],
    ['Daily Rx', report.prescriptions_total ?? 0],
  ]);
}

function createOperationsCharts() {
  const section = document.createElement('section');
  section.className = 'operations-charts';

  const report = currentDailyReport ?? {};
  const statusRows = [
    ['Waiting', report.waiting ?? currentQueue.filter((visit) => visit.status === 'waiting').length],
    ['In room', report.in_room ?? currentQueue.filter((visit) => visit.status === 'in_room').length],
    ['With doctor', report.with_doctor ?? currentQueue.filter((visit) => visit.status === 'with_doctor').length],
    ['Completed', report.completed ?? currentQueue.filter((visit) => visit.status === 'completed').length],
    ['Discharged', report.discharged ?? currentQueue.filter((visit) => visit.status === 'discharged').length],
    ['Cancelled', report.cancelled ?? currentQueue.filter((visit) => visit.status === 'cancelled').length],
  ];

  section.append(
    createBarChart('Visit status', statusRows),
    createBarChart('Rooms', (report.by_room ?? []).map((item) => [item.room_name || 'No room', item.visits ?? 0])),
    createBarChart('Top diagnoses', (report.top_diagnoses ?? []).map((item) => [item.diagnosis_name || 'Unspecified', item.count ?? 0])),
    createBarChart('Prescribers', (report.by_prescriber ?? []).map((item) => [
      practitionerLabel(item.prescribed_by_practitioner_id) || 'No prescriber',
      item.prescriptions ?? 0,
    ]))
  );

  return section;
}

function createBarChart(title, rows) {
  const chart = document.createElement('article');
  chart.className = 'bar-chart';

  const heading = document.createElement('h3');
  heading.textContent = title;
  chart.append(heading);

  const normalizedRows = rows
    .map(([label, value]) => [label, Number(value) || 0])
    .filter(([, value]) => value > 0)
    .slice(0, 6);
  const maxValue = Math.max(1, ...normalizedRows.map(([, value]) => value));

  if (normalizedRows.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'muted-note';
    empty.textContent = 'ไม่มีข้อมูล';
    chart.append(empty);
    return chart;
  }

  for (const [label, value] of normalizedRows) {
    const row = document.createElement('div');
    row.className = 'bar-row';
    const labelText = document.createElement('span');
    labelText.textContent = label;
    const track = document.createElement('div');
    track.className = 'bar-track';
    const fill = document.createElement('span');
    fill.style.width = `${Math.max(8, Math.round((value / maxValue) * 100))}%`;
    track.append(fill);
    const valueText = document.createElement('strong');
    valueText.textContent = String(value);
    row.append(labelText, track, valueText);
    chart.append(row);
  }

  return chart;
}

function practitionerLabel(practitionerId) {
  if (!practitionerId) return '';
  const practitioner = (currentAdmin.practitioners ?? []).find((item) => item.id === practitionerId)
    || (currentProfile?.practitioners ?? []).find((item) => item.id === practitionerId);
  return practitioner ? practitionerSummary(practitioner) : practitionerId.slice(0, 8);
}

function createVisitActions(visit) {
  const actions = document.createElement('div');
  actions.className = 'record-actions';
  const transitions = {
    waiting: [['in_room', 'เข้าห้อง'], ['with_doctor', 'พบแพทย์'], ['cancelled', 'ยกเลิก']],
    in_room: [['with_doctor', 'พบแพทย์'], ['cancelled', 'ยกเลิก']],
    with_doctor: [['completed', 'จบตรวจ'], ['cancelled', 'ยกเลิก']],
    completed: [['discharged', 'จำหน่าย']],
  };

  const actorPractitionerId = readValue('actorPractitionerId');
  if (
    actorPractitionerId &&
    visit.practitioner_id !== actorPractitionerId &&
    ['waiting', 'in_room', 'with_doctor'].includes(visit.status)
  ) {
    actions.append(createClaimVisitButton(visit, actorPractitionerId));
  }

  if (visit.encounter_id) {
    actions.append(createOpenVisitRecordButton(visit));
  } else if (['waiting', 'in_room', 'with_doctor'].includes(visit.status)) {
    actions.append(createStartVisitEncounterButton(visit));
  }

  for (const [status, label] of transitions[visit.status] ?? []) {
    actions.append(createVisitStatusButton(visit, status, label));
  }

  return actions;
}

function createClaimVisitButton(visit, practitionerId) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'secondary-button small-button';
  button.textContent = visit.practitioner_id ? 'รับเคสแทน' : 'รับเคส';
  button.addEventListener('click', async () => {
    button.disabled = true;
    button.textContent = 'กำลังรับ';

    try {
      await patchVisit(visit.id, { practitionerId });
      currentQueue = await fetchQueue(readValue('queueClinicId'), currentApiToken || readValue('apiToken'));
      renderQueueBoard();
      setStatus('รับเคสแล้ว', 'success');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'รับเคสไม่สำเร็จ';
      setStatus(message, 'error');
    } finally {
      button.disabled = false;
      button.textContent = visit.practitioner_id ? 'รับเคสแทน' : 'รับเคส';
    }
  });
  return button;
}

function createStartVisitEncounterButton(visit) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'primary-button small-button';
  button.textContent = 'เริ่มตรวจ';
  button.addEventListener('click', async () => {
    button.disabled = true;
    button.textContent = 'กำลังเริ่ม';

    try {
      await startEncounterFromVisit(visit);
      currentQueue = await fetchQueue(readValue('queueClinicId'), currentApiToken || readValue('apiToken'));
      renderQueueBoard();
      setStatus('เริ่มตรวจและผูก encounter แล้ว', 'success');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'เริ่มตรวจจากคิวไม่สำเร็จ';
      setStatus(message, 'error');
    } finally {
      button.disabled = false;
      button.textContent = 'เริ่มตรวจ';
    }
  });
  return button;
}

function createOpenVisitRecordButton(visit) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'secondary-button small-button';
  button.textContent = 'เปิดเวชระเบียน';
  button.addEventListener('click', async () => {
    button.disabled = true;
    button.textContent = 'กำลังเปิด';

    try {
      await openVisitPatientRecord(visit);
      setStatus('เปิดเวชระเบียนจากคิวแล้ว', 'success');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'เปิดเวชระเบียนจากคิวไม่สำเร็จ';
      setStatus(message, 'error');
    } finally {
      button.disabled = false;
      button.textContent = 'เปิดเวชระเบียน';
    }
  });
  return button;
}

function createVisitStatusButton(visit, status, label) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = status === 'cancelled' ? 'secondary-button danger-button small-button' : 'secondary-button small-button';
  button.textContent = label;
  button.addEventListener('click', async () => {
    button.disabled = true;
    button.textContent = 'กำลังบันทึก';

    try {
      await patchVisit(visit.id, { status });
      currentQueue = await fetchQueue(readValue('queueClinicId'), currentApiToken || readValue('apiToken'));
      renderQueueBoard();
      setStatus(`Visit: ${status}`, 'success');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'อัปเดต visit ไม่สำเร็จ';
      setStatus(message, 'error');
    } finally {
      button.disabled = false;
      button.textContent = label;
    }
  });
  return button;
}

async function startEncounterFromVisit(visit) {
  const patientId = visit.patient_id;
  const medicalRecordNumber = visit.medical_record_number;
  if (!patientId || !medicalRecordNumber) {
    throw new Error('Visit นี้ไม่มี patient หรือ HN สำหรับเริ่มตรวจ');
  }

  const chiefComplaint = String(visit.notes ?? '').trim();
  const queueLabel = visit.queue_label ?? visit.visit_number ?? visit.id;
  const response = await fetch('/api/encounters', {
    method: 'POST',
    headers: buildHeaders(currentApiToken || readValue('apiToken')),
    body: JSON.stringify(compactPayload({
      patientId,
      encounterNumber: nextEncounterNumber(medicalRecordNumber),
      appointmentId: visit.appointment_id,
      status: 'in_progress',
      encounterClass: 'outpatient',
      attendingPractitionerId: visit.practitioner_id,
      chiefComplaint: chiefComplaint || `Queue ${queueLabel}`,
      triageSummary: `Started from queue ${queueLabel}`,
      title: `Queue visit ${queueLabel}`,
      subjective: chiefComplaint || `Queue ${queueLabel}`,
    })),
  });
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.detail || result.error || `HTTP ${response.status}`);
  }

  const encounterId = result.data?.encounter?.id;
  if (!encounterId) {
    throw new Error('สร้าง encounter แล้วแต่ไม่พบ encounter id');
  }

  await patchVisit(visit.id, { encounterId, status: 'with_doctor' });
  await openVisitPatientRecord(visit, 'Encounters');
  return result.data;
}

async function openVisitPatientRecord(visit, sectionLabel = 'Encounters') {
  if (!visit.clinic_id || !visit.medical_record_number) {
    throw new Error('Visit นี้ไม่มี clinic หรือ HN สำหรับเปิดเวชระเบียน');
  }

  const apiToken = currentApiToken || readValue('apiToken');
  const patient = await fetchPatientDetail(visit.clinic_id, visit.medical_record_number, apiToken);
  const profile = await fetchPatientProfileBundle(patient, apiToken);
  currentClinicalNoteTemplates = await fetchClinicalNoteTemplates(patient.clinic_id, apiToken);
  currentDrugCatalog = await fetchDrugCatalog(patient.clinic_id, apiToken).catch(() => []);
  currentProfileSection = sectionLabel;
  showPatientDetail(patient, profile);
}

function renderAdminWorkspace(clinicId) {
  adminWorkspace.hidden = false;

  adminWorkspace.replaceChildren(
    createAdminSection('Users', 'users', createUserForm(clinicId), currentAdmin.users, userSummary, [
      'role',
      'oidc_subject',
      'last_login_at',
      'is_active',
      'username',
    ], createUserActions),
    createAdminSection(
      'Practitioners',
      'practitioners',
      createPractitionerForm(clinicId),
      currentAdmin.practitioners,
      practitionerSummary,
      ['practitioner_code', 'specialty', 'is_active'],
      createPractitionerActions
    ),
    createTemplateAdminSection(clinicId),
    createClinicSettingsSection(clinicId),
    createAuditSection()
  );
}

function createClinicSettingsSection(clinicId) {
  const section = document.createElement('div');
  section.className = 'admin-section';
  const title = document.createElement('h3');
  title.textContent = 'Clinic Branding';
  section.append(title, createClinicSettingsForm(clinicId));
  return section;
}

function createClinicSettingsForm(clinicId) {
  const form = document.createElement('form');
  form.className = 'inline-profile-form';
  form.append(
    createAdminInput('displayName', 'Display name', currentClinicSettings?.display_name ?? 'EMR Core Clinic', true),
    createFormField('address', 'Address', 'textarea'),
    createAdminInput('phoneNumber', 'Phone', currentClinicSettings?.phone_number ?? ''),
    createAdminInput('email', 'Email', currentClinicSettings?.email ?? ''),
    createAdminInput('website', 'Website', currentClinicSettings?.website ?? ''),
    createAdminInput('logoUrl', 'Logo URL', currentClinicSettings?.logo_url ?? ''),
    createLogoAssetPicker(clinicId),
    createFormField('prescriptionFooter', 'Prescription footer', 'textarea')
  );
  form.elements.address.value = currentClinicSettings?.address ?? '';
  form.elements.prescriptionFooter.value = currentClinicSettings?.prescription_footer ?? '';

  const submit = createAdminSubmit('บันทึก branding');
  form.append(submit);
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    await saveClinicSettings(clinicId, form, submit);
  });
  return form;
}

function createLogoAssetPicker(clinicId) {
  const panel = document.createElement('div');
  panel.className = 'asset-picker-panel';
  panel.dataset.workflow = 'clinic-logo-asset-picker';

  const pickerLabel = document.createElement('label');
  pickerLabel.textContent = 'Logo file asset';
  const select = document.createElement('select');
  select.name = 'logoFileAssetId';
  select.dataset.workflow = 'clinic-logo-asset-select';
  pickerLabel.append(select);

  const searchField = createAdminInput('logoAssetSearch', 'Search assets', 'logo');
  const loadButton = document.createElement('button');
  loadButton.type = 'button';
  loadButton.className = 'secondary-button';
  loadButton.dataset.workflow = 'clinic-logo-asset-load';
  loadButton.textContent = 'โหลด assets';
  loadButton.addEventListener('click', async () => {
    await loadClinicLogoAssets(clinicId, panel);
  });

  const storageKey = createAdminInput('logoAssetStorageKey', 'Storage key', `clinic-logo-${Date.now()}.png`);
  const originalFilename = createAdminInput('logoAssetOriginalFilename', 'Filename', 'clinic-logo.png');
  const mimeType = createAdminInput('logoAssetMimeType', 'MIME type', 'image/png');
  const byteSize = createAdminInput('logoAssetByteSize', 'Byte size', '0');
  byteSize.querySelector('input').type = 'number';
  byteSize.querySelector('input').min = '0';
  const fileField = createFormField('logoAssetFile', 'Upload logo file');
  const fileInput = fileField.querySelector('input');
  fileInput.type = 'file';
  fileInput.accept = acceptedLogoMimeTypes().join(',');
  fileInput.addEventListener('change', () => syncLogoFileMetadata(panel, fileInput.files?.[0]));

  const createButton = document.createElement('button');
  createButton.type = 'button';
  createButton.className = 'secondary-button';
  createButton.dataset.workflow = 'clinic-logo-asset-create';
  createButton.textContent = 'สร้าง logo asset';
  createButton.addEventListener('click', async () => {
    await createClinicLogoAsset(clinicId, panel);
  });

  const status = document.createElement('div');
  status.className = 'inline-error';
  status.dataset.workflow = 'clinic-logo-asset-status';
  status.hidden = true;

  panel.append(
    pickerLabel,
    searchField,
    loadButton,
    storageKey,
    originalFilename,
    mimeType,
    byteSize,
    fileField,
    createButton,
    status
  );
  refreshLogoAssetOptions(panel);
  return panel;
}

function refreshLogoAssetOptions(panel) {
  const select = panel.querySelector('select[name="logoFileAssetId"]');
  if (!select) return;

  const selected = currentClinicSettings?.logo_file_asset_id ?? select.value;
  const selectedAssetIsListed = currentLogoAssets.some((asset) => asset.id === selected);
  const options = [
    ['', 'ไม่ใช้ logo asset'],
    ...(selected && !selectedAssetIsListed ? [[selected, `Current logo asset (${selected})`]] : []),
    ...currentLogoAssets.map((asset) => [
      asset.id,
      `${asset.original_filename ?? asset.storage_key ?? asset.id} (${asset.mime_type ?? 'file'})`,
    ]),
  ];
  select.replaceChildren(
    ...options.map(([value, label]) => {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = label;
      return option;
    })
  );
  select.value = options.some(([value]) => value === selected) ? selected : '';
}

async function loadClinicLogoAssets(clinicId, panel) {
  setAssetPickerStatus(panel, 'กำลังโหลด assets', '');

  try {
    currentLogoAssets = await fetchFileAssets(clinicId, currentApiToken || readValue('apiToken'), {
      search: panel.querySelector('input[name="logoAssetSearch"]')?.value?.trim(),
      limit: 25,
    });
    refreshLogoAssetOptions(panel);
    setAssetPickerStatus(panel, `โหลด assets แล้ว ${currentLogoAssets.length} รายการ`, 'success');
  } catch (error) {
    setAssetPickerStatus(panel, error instanceof Error ? error.message : 'โหลด assets ไม่สำเร็จ', 'error');
  }
}

async function createClinicLogoAsset(clinicId, panel) {
  const storageKey = panel.querySelector('input[name="logoAssetStorageKey"]')?.value?.trim();
  const originalFilename = panel.querySelector('input[name="logoAssetOriginalFilename"]')?.value?.trim();
  const mimeType = panel.querySelector('input[name="logoAssetMimeType"]')?.value?.trim();
  const byteSizeValue = panel.querySelector('input[name="logoAssetByteSize"]')?.value?.trim();
  const file = panel.querySelector('input[name="logoAssetFile"]')?.files?.[0];
  const byteSize = byteSizeValue ? Number(byteSizeValue) : 0;

  if (file) {
    const policyError = validateLogoFileAgainstPolicy(file);
    if (policyError) {
      setAssetPickerStatus(panel, policyError, 'error');
      return;
    }
  }

  if (!storageKey || (!originalFilename && !file) || !Number.isInteger(byteSize) || byteSize < 0) {
    setAssetPickerStatus(panel, 'กรุณากรอก storage key, filename และ byte size ให้ถูกต้อง', 'error');
    return;
  }

  setAssetPickerStatus(panel, file ? 'กำลัง upload logo asset' : 'กำลังสร้าง logo asset', '');

  try {
    const apiToken = currentApiToken || readValue('apiToken');
    const asset = file
      ? await uploadFileAsset(
          compactPayload({
            clinicId,
            storageKey,
            originalFilename: originalFilename || file.name,
            mimeType: mimeType || file.type || 'application/octet-stream',
            byteSize: file.size,
            contentBase64: await fileToBase64(file),
          }),
          apiToken
        )
      : await createFileAsset(
          compactPayload({
            clinicId,
            storageKey,
            originalFilename,
            mimeType,
            byteSize,
          }),
          apiToken
        );
    currentLogoAssets = [asset, ...currentLogoAssets.filter((item) => item.id !== asset.id)];
    logoAssetDataUrls.delete(asset.id);
    refreshLogoAssetOptions(panel);
    panel.querySelector('select[name="logoFileAssetId"]').value = asset.id;
    setAssetPickerStatus(panel, file ? 'upload logo asset แล้ว' : 'สร้าง logo asset แล้ว', 'success');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'บันทึก logo asset ไม่สำเร็จ';
    setAssetPickerStatus(panel, message, 'error');
  }
}

function setAssetPickerStatus(panel, message, mode) {
  const status = panel.querySelector('[data-workflow="clinic-logo-asset-status"]');
  if (!status) return;
  status.hidden = false;
  status.textContent = message;
  status.className = mode === 'success' ? 'status-pill success' : mode === 'error' ? 'inline-error' : 'status-pill';
}

function syncLogoFileMetadata(panel, file) {
  if (!file) return;

  const storageKeyInput = panel.querySelector('input[name="logoAssetStorageKey"]');
  const originalFilenameInput = panel.querySelector('input[name="logoAssetOriginalFilename"]');
  const mimeTypeInput = panel.querySelector('input[name="logoAssetMimeType"]');
  const byteSizeInput = panel.querySelector('input[name="logoAssetByteSize"]');
  const safeName = file.name.replace(/[^A-Za-z0-9._-]/g, '-');

  storageKeyInput.value = `clinic-logos/${Date.now()}-${safeName}`;
  originalFilenameInput.value = file.name;
  mimeTypeInput.value = file.type || 'application/octet-stream';
  byteSizeInput.value = String(file.size);
}

function validateLogoFileAgainstPolicy(file) {
  if (!currentFileAssetStoragePolicy) return '';

  if (file.size > currentFileAssetStoragePolicy.maxUploadBytes) {
    return `ไฟล์ใหญ่เกิน ${currentFileAssetStoragePolicy.maxUploadBytes} bytes`;
  }

  if (!acceptedLogoMimeTypes().includes(file.type)) {
    return 'ชนิดไฟล์นี้ยังไม่ถูกเปิดให้ upload';
  }

  return '';
}

function acceptedLogoMimeTypes() {
  const policyTypes = currentFileAssetStoragePolicy?.allowedMimeTypes ?? ['image/png', 'image/jpeg', 'image/webp'];
  return policyTypes.filter((mimeType) => mimeType.startsWith('image/'));
}

function createTemplateAdminSection(clinicId) {
  const section = document.createElement('div');
  section.className = 'admin-section';
  const title = document.createElement('h3');
  title.textContent = 'SOAP Templates';
  section.append(title, createTemplateAdminForm(clinicId));

  const list = document.createElement('div');
  list.className = 'record-list';
  for (const template of currentClinicalNoteTemplates) {
    const card = createRecordCard(template, templateSummary, [
      'template_key',
      'category',
      'is_active',
      'updated_at',
    ]);
    card.append(createTemplateAdminActions(card, template, clinicId));
    list.append(card);
  }
  section.append(list);
  return section;
}

function createTemplateAdminForm(clinicId, template = null) {
  const form = document.createElement('form');
  form.className = 'inline-profile-form';
  form.append(
    createAdminInput('templateKey', 'Key', template?.template_key ?? '', true),
    createAdminInput('title', 'Title', template?.title ?? '', true),
    createAdminInput('category', 'Category', template?.category ?? ''),
    createFormField('subjective', 'Subjective', 'textarea'),
    createFormField('objective', 'Objective', 'textarea'),
    createFormField('assessment', 'Assessment', 'textarea'),
    createFormField('plan', 'Plan', 'textarea'),
    createAdminSelect('isActive', 'Active', ['true', 'false'], String(template?.is_active ?? true))
  );
  form.elements.subjective.value = template?.subjective ?? '';
  form.elements.objective.value = template?.objective ?? '';
  form.elements.assessment.value = template?.assessment ?? '';
  form.elements.plan.value = template?.plan ?? '';

  const submit = createAdminSubmit(template ? 'บันทึก template' : 'เพิ่ม template');
  form.append(submit);
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    await saveClinicalNoteTemplate(clinicId, template?.id, form, submit);
  });
  return form;
}

function createTemplateAdminActions(card, template, clinicId) {
  const actions = document.createElement('div');
  actions.className = 'record-actions';
  const editButton = document.createElement('button');
  editButton.type = 'button';
  editButton.className = 'secondary-button small-button';
  editButton.textContent = 'แก้ template';
  editButton.addEventListener('click', () => {
    card.querySelector('.inline-profile-form')?.remove();
    card.append(createTemplateAdminForm(clinicId, template));
  });
  const activeButton = document.createElement('button');
  activeButton.type = 'button';
  activeButton.className = template.is_active ? 'secondary-button danger-button small-button' : 'secondary-button small-button';
  activeButton.textContent = template.is_active ? 'ปิดใช้' : 'เปิดใช้';
  activeButton.addEventListener('click', async () => {
    activeButton.disabled = true;
    try {
      await patchClinicalNoteTemplate(template.id, { isActive: !template.is_active });
      currentClinicalNoteTemplates = await fetchClinicalNoteTemplates(clinicId, currentApiToken || readValue('apiToken'), false);
      renderAdminWorkspace(clinicId);
      setStatus('อัปเดต template แล้ว', 'success');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'อัปเดต template ไม่สำเร็จ';
      setStatus(message, 'error');
    }
  });
  actions.append(editButton, activeButton);
  return actions;
}

function createAuditSection() {
  const section = document.createElement('div');
  section.className = 'admin-section';
  const title = document.createElement('h3');
  title.textContent = 'Audit Logs';
  section.append(title, createAuditForm(), createAuditList());
  return section;
}

function createAuditForm() {
  const form = document.createElement('form');
  form.className = 'inline-profile-form audit-form';
  form.append(
    createAdminSelect('entityType', 'Entity type', [
      'patient',
      'user',
      'practitioner',
      'appointment',
      'encounter',
      'clinical_note',
      'soap_note',
      'diagnosis',
      'vital_sign',
      'prescription',
      'patient_flag',
      'patient_allergy',
      'patient_condition',
      'patient_medication',
    ], 'user'),
    createAdminInput('entityId', 'Entity ID', '', true),
    createAdminInput('limit', 'Limit', '20')
  );

  const limit = form.querySelector('[name="limit"]');
  limit.type = 'number';
  limit.min = '1';
  limit.max = '200';

  const submit = createAdminSubmit('โหลด audit');
  form.append(submit);
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    await loadAuditLogs(form, submit);
  });
  return form;
}

function createAuditList() {
  const list = document.createElement('div');
  list.className = 'record-list audit-list';

  if (currentAuditLogs.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'muted-note';
    empty.textContent = 'ยังไม่มี audit log ที่โหลด';
    list.append(empty);
    return list;
  }

  for (const log of currentAuditLogs) {
    const card = createRecordCard(log, auditSummary, [
      'entity_type',
      'entity_id',
      'actor_user_id',
      'actor_practitioner_id',
      'created_at',
    ]);
    const metadata = document.createElement('pre');
    metadata.className = 'metadata-preview';
    metadata.textContent = JSON.stringify(log.metadata ?? {}, null, 2);
    card.append(metadata);
    list.append(card);
  }

  return list;
}

async function loadAuditLogs(form, submit) {
  const values = Object.fromEntries(new FormData(form).entries());
  const params = new URLSearchParams({
    entityType: values.entityType,
    entityId: values.entityId,
    limit: values.limit || '20',
  });
  const originalText = submit.textContent;
  submit.disabled = true;
  submit.textContent = 'กำลังโหลด';
  setStatus('กำลังโหลด audit', '');

  try {
    const response = await fetch(`/api/audit-logs?${params.toString()}`, {
      headers: buildHeaders(currentApiToken || readValue('apiToken')),
    });
    const result = await response.json();

    if (!response.ok) {
      throw createApiError(response, result);
    }

    currentAuditLogs = result.data ?? [];
    renderAdminWorkspace(readValue('adminClinicId'));
    setStatus('โหลด audit แล้ว', 'success');
  } catch (error) {
    const message = friendlyAdminError(error);
    setStatus(message, 'error');
    renderInlineFormError(form, message);
  } finally {
    submit.disabled = false;
    submit.textContent = originalText;
  }
}

function createAdminSection(titleText, filterKey, form, items, summary, fields, actionsFactory) {
  const section = document.createElement('div');
  section.className = 'admin-section';
  const title = document.createElement('h3');
  title.textContent = titleText;
  section.append(title, createAdminFilterBar(filterKey), form);

  const list = document.createElement('div');
  list.className = 'record-list';
  for (const item of items) {
    const card = createRecordCard(item, summary, fields);
    if (actionsFactory) card.append(actionsFactory(card, item));
    list.append(card);
  }
  section.append(list);
  return section;
}

function createAdminFilterBar(filterKey) {
  const filters = document.createElement('div');
  filters.className = 'admin-filter-bar';

  const search = document.createElement('input');
  search.type = 'search';
  search.autocomplete = 'off';
  search.placeholder = 'Search';
  search.value = currentAdminFilters[`${filterKey}Search`];
  search.addEventListener('input', () => {
    currentAdminFilters = {
      ...currentAdminFilters,
      [`${filterKey}Search`]: search.value,
    };
    setAdminOffset(filterKey, 0);
    reloadAdminWorkspace();
  });

  const active = createSelect('activeFilter', ['active', 'inactive', 'all']);
  active.value = currentAdminFilters[`${filterKey}Active`];
  active.addEventListener('change', () => {
    currentAdminFilters = {
      ...currentAdminFilters,
      [`${filterKey}Active`]: active.value,
    };
    setAdminOffset(filterKey, 0);
    reloadAdminWorkspace();
  });

  filters.append(search, active, createAdminPagination(filterKey));
  return filters;
}

function createAdminPagination(filterKey) {
  const meta = currentAdminMeta[filterKey];
  const controls = document.createElement('div');
  controls.className = 'admin-pagination';

  const previous = document.createElement('button');
  previous.type = 'button';
  previous.className = 'secondary-button small-button';
  previous.textContent = 'ก่อนหน้า';
  previous.disabled = meta.offset === 0;
  previous.addEventListener('click', () => {
    setAdminOffset(filterKey, Math.max(0, meta.offset - meta.limit));
    reloadAdminWorkspace();
  });

  const label = document.createElement('span');
  const pageCount = currentAdmin[filterKey].length;
  label.textContent = pageCount === 0 ? '0' : `${meta.offset + 1}-${meta.offset + pageCount}`;

  const next = document.createElement('button');
  next.type = 'button';
  next.className = 'secondary-button small-button';
  next.textContent = 'ถัดไป';
  next.disabled = !meta.hasMore;
  next.addEventListener('click', () => {
    setAdminOffset(filterKey, meta.nextOffset ?? meta.offset + meta.limit);
    reloadAdminWorkspace();
  });

  controls.append(previous, label, next);
  return controls;
}

function setAdminOffset(filterKey, offset) {
  currentAdminPagination = {
    ...currentAdminPagination,
    [`${filterKey}Offset`]: offset,
  };
}

async function reloadAdminWorkspace() {
  const clinicId = readValue('adminClinicId');
  if (!clinicId) return;

  try {
    currentAdmin = await fetchAdminBundle(clinicId, currentApiToken || readValue('apiToken'));
    renderAdminWorkspace(clinicId);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'โหลดข้อมูลตั้งค่าคลินิกไม่สำเร็จ';
    setStatus(message, 'error');
  }
}

function createUserForm(clinicId, user = null) {
  const form = document.createElement('form');
  form.className = 'inline-profile-form';
  form.append(
    createAdminInput('username', 'Username', user?.username ?? '', !user),
    createAdminInput('displayName', 'Display name', user?.display_name ?? '', true),
    createAdminSelect('role', 'Role', ['doctor', 'nurse', 'admin'], user?.role ?? 'nurse'),
    createAdminInput('oidcSubject', 'OIDC subject', user?.oidc_subject ?? '')
  );
  if (user) form.append(createAdminSelect('isActive', 'Active', ['true', 'false'], String(user.is_active ?? true)));

  const submit = createAdminSubmit(user ? 'บันทึก user' : 'เพิ่ม user');
  form.append(submit);
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    await saveUser(clinicId, user?.id, form, submit);
  });
  return form;
}

function createPractitionerForm(clinicId, practitioner = null) {
  const form = document.createElement('form');
  form.className = 'inline-profile-form';
  form.append(
    createAdminInput('practitionerCode', 'Code', practitioner?.practitioner_code ?? '', !practitioner),
    createAdminInput('firstName', 'First name', practitioner?.first_name ?? '', true),
    createAdminInput('lastName', 'Last name', practitioner?.last_name ?? '', true),
    createUserLinkField(practitioner?.user_id ?? ''),
    createAdminInput('licenseNumber', 'License', practitioner?.license_number ?? ''),
    createAdminInput('specialty', 'Specialty', practitioner?.specialty ?? '')
  );
  if (practitioner) {
    form.append(createAdminSelect('isActive', 'Active', ['true', 'false'], String(practitioner.is_active ?? true)));
  }

  const submit = createAdminSubmit(practitioner ? 'บันทึก practitioner' : 'เพิ่ม practitioner');
  form.append(submit);
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    await savePractitioner(clinicId, practitioner?.id, form, submit);
  });
  return form;
}

function createUserActions(card, user) {
  const actions = document.createElement('div');
  actions.className = 'record-actions';
  const editButton = document.createElement('button');
  editButton.type = 'button';
  editButton.className = 'secondary-button small-button';
  editButton.textContent = 'แก้ไข';
  editButton.addEventListener('click', () => {
    card.querySelector('.inline-profile-form')?.remove();
    card.append(createUserForm(readValue('adminClinicId'), user));
  });
  actions.append(editButton, createAdminActiveButton('user', user.id, user.is_active !== false));
  return actions;
}

function createPractitionerActions(card, practitioner) {
  const actions = document.createElement('div');
  actions.className = 'record-actions';
  const editButton = document.createElement('button');
  editButton.type = 'button';
  editButton.className = 'secondary-button small-button';
  editButton.textContent = 'แก้ไข';
  editButton.addEventListener('click', () => {
    card.querySelector('.inline-profile-form')?.remove();
    card.append(createPractitionerForm(readValue('adminClinicId'), practitioner));
  });
  actions.append(
    editButton,
    createAdminActiveButton('practitioner', practitioner.id, practitioner.is_active !== false)
  );
  return actions;
}

function createAdminActiveButton(kind, id, isActive) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = isActive
    ? 'secondary-button danger-button small-button'
    : 'secondary-button small-button';
  button.textContent = isActive ? 'ปิดใช้งาน' : 'เปิดใช้งาน';
  button.addEventListener('click', async () => {
    button.disabled = true;
    button.textContent = 'กำลังบันทึก';

    try {
      const url = kind === 'user' ? `/api/users/${id}` : `/api/practitioners/${id}`;
      const response = await fetch(url, {
        method: 'PATCH',
        headers: buildHeaders(currentApiToken || readValue('apiToken')),
        body: JSON.stringify({ isActive: !isActive }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw createApiError(response, result);
      }

      currentAdmin = await fetchAdminBundle(readValue('adminClinicId'), currentApiToken || readValue('apiToken'));
      renderAdminWorkspace(readValue('adminClinicId'));
      if (currentPatient) await refreshPatientWorkspace(currentProfileSection);
      setStatus(isActive ? 'ปิดใช้งานแล้ว' : 'เปิดใช้งานแล้ว', 'success');
    } catch (error) {
      const message = friendlyAdminError(error);
      setStatus(message, 'error');
    } finally {
      button.disabled = false;
      button.textContent = isActive ? 'ปิดใช้งาน' : 'เปิดใช้งาน';
    }
  });
  return button;
}

async function saveUser(clinicId, userId, form, submit) {
  const values = Object.fromEntries(new FormData(form).entries());
  const payload = compactPayload({
    clinicId,
    username: values.username,
    displayName: values.displayName,
    role: values.role,
    oidcSubject: values.oidcSubject,
    isActive: parseOptionalBoolean(values.isActive),
  });

  await saveAdminRecord({
    form,
    submit,
    payload,
    url: userId ? `/api/users/${userId}` : '/api/users',
    method: userId ? 'PATCH' : 'POST',
    busyText: 'กำลังบันทึก user',
    successText: userId ? 'แก้ user แล้ว' : 'เพิ่ม user แล้ว',
    resetAfterSave: !userId,
  });
}

async function savePractitioner(clinicId, practitionerId, form, submit) {
  const values = Object.fromEntries(new FormData(form).entries());
  const payload = compactPayload({
    clinicId,
    practitionerCode: values.practitionerCode,
    firstName: values.firstName,
    lastName: values.lastName,
    userId: values.userId,
    licenseNumber: values.licenseNumber,
    specialty: values.specialty,
    isActive: parseOptionalBoolean(values.isActive),
  });

  await saveAdminRecord({
    form,
    submit,
    payload,
    url: practitionerId ? `/api/practitioners/${practitionerId}` : '/api/practitioners',
    method: practitionerId ? 'PATCH' : 'POST',
    busyText: 'กำลังบันทึก practitioner',
    successText: practitionerId ? 'แก้ practitioner แล้ว' : 'เพิ่ม practitioner แล้ว',
    resetAfterSave: !practitionerId,
  });
}

async function saveClinicalNoteTemplate(clinicId, templateId, form, submit) {
  const values = Object.fromEntries(new FormData(form).entries());
  const payload = compactPayload({
    clinicId,
    templateKey: values.templateKey,
    title: values.title,
    category: values.category,
    subjective: values.subjective,
    objective: values.objective,
    assessment: values.assessment,
    plan: values.plan,
    isActive: parseOptionalBoolean(values.isActive),
  });

  await saveAdminRecord({
    form,
    submit,
    payload,
    url: templateId ? `/api/clinical-note-templates/${templateId}` : '/api/clinical-note-templates',
    method: templateId ? 'PATCH' : 'POST',
    busyText: 'กำลังบันทึก template',
    successText: templateId ? 'แก้ template แล้ว' : 'เพิ่ม template แล้ว',
    resetAfterSave: !templateId,
  });
}

async function saveClinicSettings(clinicId, form, submit) {
  const values = Object.fromEntries(new FormData(form).entries());
  const payload = compactPayload({
    displayName: values.displayName,
    address: values.address,
    phoneNumber: values.phoneNumber,
    email: values.email,
    website: values.website,
    logoUrl: values.logoUrl,
    logoFileAssetId: values.logoFileAssetId,
    prescriptionFooter: values.prescriptionFooter,
  });

  const originalText = submit.textContent;
  submit.disabled = true;
  submit.textContent = 'กำลังบันทึก';
  setStatus('กำลังบันทึก branding', '');

  try {
    const response = await fetch(`/api/clinics/${clinicId}/settings`, {
      method: 'PATCH',
      headers: buildHeaders(currentApiToken || readValue('apiToken')),
      body: JSON.stringify(payload),
    });
    const result = await response.json();

    if (!response.ok) throw createApiError(response, result);

    currentClinicSettings = result.data;
    renderAdminWorkspace(clinicId);
    setStatus('บันทึก branding แล้ว', 'success');
  } catch (error) {
    const message = friendlyAdminError(error);
    setStatus(message, 'error');
    renderInlineFormError(form, message);
  } finally {
    submit.disabled = false;
    submit.textContent = originalText;
  }
}

async function patchClinicalNoteTemplate(templateId, payload) {
  const response = await fetch(`/api/clinical-note-templates/${templateId}`, {
    method: 'PATCH',
    headers: buildHeaders(currentApiToken || readValue('apiToken')),
    body: JSON.stringify(payload),
  });
  const result = await response.json();

  if (!response.ok) {
    throw createApiError(response, result);
  }

  return result.data;
}

async function saveAdminRecord({
  form,
  submit,
  payload,
  url,
  method,
  busyText,
  successText,
  resetAfterSave,
}) {
  const clinicId = readValue('adminClinicId');
  const originalText = submit.textContent;
  submit.disabled = true;
  submit.textContent = 'กำลังบันทึก';
  setStatus(busyText, '');

  try {
    const response = await fetch(url, {
      method,
      headers: buildHeaders(currentApiToken || readValue('apiToken')),
      body: JSON.stringify(payload),
    });
    const result = await response.json();

    if (!response.ok) {
      throw createApiError(response, result);
    }

    if (resetAfterSave) form.reset();
    currentAdmin = await fetchAdminBundle(clinicId, currentApiToken || readValue('apiToken'));
    renderAdminWorkspace(clinicId);
    if (currentPatient) await refreshPatientWorkspace(currentProfileSection);
    setStatus(successText, 'success');
  } catch (error) {
    const message = friendlyAdminError(error);
    setStatus(message, 'error');
    renderInlineFormError(form, message);
  } finally {
    submit.disabled = false;
    submit.textContent = originalText;
  }
}

function parseOptionalBoolean(value) {
  if (value === undefined || value === '') return undefined;
  return value === 'true';
}

function createAppointmentForm(patient) {
  const form = document.createElement('form');
  form.className = 'appointment-form';
  const appointmentNumber = nextAppointmentNumber(patient.medical_record_number);
  form.dataset.appointmentNumber = appointmentNumber;

  const header = document.createElement('div');
  header.className = 'inline-form-heading';
  const title = document.createElement('h3');
  title.textContent = 'นัดหมาย / check-in';
  const number = document.createElement('span');
  number.textContent = appointmentNumber;
  header.append(title, number);
  form.append(header);

  const startField = createFormField('scheduledStartAt', 'Start', 'input', true);
  startField.querySelector('input').type = 'datetime-local';
  startField.querySelector('input').value = defaultDateTimeLocal(15);
  const endField = createFormField('scheduledEndAt', 'End', 'input');
  endField.querySelector('input').type = 'datetime-local';
  endField.querySelector('input').value = defaultDateTimeLocal(45);

  form.append(
    startField,
    endField,
    createPractitionerField('practitionerId', 'Practitioner', ''),
    createFormField('reason', 'Reason', 'input'),
    createFormField('notes', 'Notes', 'textarea')
  );

  const submit = document.createElement('button');
  submit.type = 'submit';
  submit.className = 'primary-button compact-button';
  submit.textContent = 'บันทึกนัด';
  form.append(submit);

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    await createAppointmentFromForm(patient, form, submit);
  });

  return form;
}

function createAppointmentEditForm(appointment) {
  const form = document.createElement('form');
  form.className = 'appointment-form';

  const header = document.createElement('div');
  header.className = 'inline-form-heading';
  const title = document.createElement('h3');
  title.textContent = 'แก้นัดหมาย';
  const number = document.createElement('span');
  number.textContent = appointment.appointment_number ?? appointment.id;
  header.append(title, number);
  form.append(header);

  const startField = createFormField('scheduledStartAt', 'Start', 'input', true);
  startField.querySelector('input').type = 'datetime-local';
  startField.querySelector('input').value = toDateTimeLocal(appointment.scheduled_start_at);
  const endField = createFormField('scheduledEndAt', 'End', 'input');
  endField.querySelector('input').type = 'datetime-local';
  endField.querySelector('input').value = toDateTimeLocal(appointment.scheduled_end_at);

  form.append(
    startField,
    endField,
    createPractitionerField('practitionerId', 'Practitioner', appointment.practitioner_id ?? ''),
    createFormField('reason', 'Reason', 'input'),
    createFormField('notes', 'Notes', 'textarea')
  );
  form.elements.reason.value = appointment.reason ?? '';
  form.elements.notes.value = appointment.notes ?? '';

  const submit = document.createElement('button');
  submit.type = 'submit';
  submit.className = 'primary-button compact-button';
  submit.textContent = 'บันทึกนัด';
  form.append(submit);

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    await updateAppointmentFromForm(appointment.id, form, submit);
  });

  return form;
}

function createEncounterEditForm(encounter) {
  const form = document.createElement('form');
  form.className = 'encounter-edit-form appointment-form';

  const header = document.createElement('div');
  header.className = 'inline-form-heading';
  const title = document.createElement('h3');
  title.textContent = 'แก้ encounter';
  const number = document.createElement('span');
  number.textContent = encounter.encounter_number ?? encounter.id;
  header.append(title, number);
  form.append(header);

  form.append(
    createAdminSelect(
      'encounterClass',
      'Class',
      ['outpatient', 'inpatient', 'emergency', 'other'],
      encounter.encounter_class ?? 'outpatient'
    ),
    createPractitionerField(
      'attendingPractitionerId',
      'Practitioner',
      encounter.attending_practitioner_id ?? ''
    ),
    createAdminInput('chiefComplaint', 'Chief complaint', encounter.chief_complaint ?? ''),
    createFormField('triageSummary', 'Triage summary', 'textarea'),
    createDateTimeField('startedAt', 'Started', encounter.started_at),
    createDateTimeField('endedAt', 'Ended', encounter.ended_at)
  );
  form.elements.triageSummary.value = encounter.triage_summary ?? '';

  const submit = createAdminSubmit('บันทึก encounter');
  form.append(submit);
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    await updateEncounterFromForm(encounter.id, form, submit);
  });

  return form;
}

function createEncounterEntryForm(patient, appointment = null) {
  const form = document.createElement('form');
  form.className = 'encounter-entry-form';

  const header = document.createElement('div');
  header.className = 'inline-form-heading';
  const title = document.createElement('h3');
  title.textContent = appointment ? 'เริ่มตรวจจากนัดหมาย' : 'เริ่ม visit / SOAP';
  const number = document.createElement('span');
  number.textContent = appointment?.appointment_number ?? nextEncounterNumber(patient.medical_record_number);
  header.append(title, number);
  form.append(header);

  form.append(
    createTemplateField(),
    createFormField('chiefComplaint', 'Chief complaint', 'input', true),
    createPractitionerField('attendingPractitionerId', 'Practitioner', appointment?.practitioner_id ?? ''),
    createFormField('subjective', 'Subjective', 'textarea'),
    createFormField('objective', 'Objective', 'textarea'),
    createFormField('assessment', 'Assessment', 'textarea'),
    createFormField('plan', 'Plan', 'textarea'),
    createFormField('diagnosisName', 'Diagnosis', 'input'),
    createFormField('bodyTemperatureC', 'Temp C', 'input'),
    createFormField('heartRateBpm', 'HR', 'input'),
    createFormField('oxygenSaturationPct', 'SpO2', 'input')
  );

  form.elements.noteTemplate.addEventListener('change', () => {
    applyNoteTemplate(form, form.elements.noteTemplate.value);
  });

  const submit = document.createElement('button');
  submit.type = 'submit';
  submit.className = 'primary-button compact-button';
  submit.textContent = 'บันทึก visit';
  form.append(submit);

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    await createEncounterFromForm(patient, form, submit, appointment);
  });

  return form;
}

function createTemplateField() {
  const label = document.createElement('label');
  label.textContent = 'Template';
  const select = document.createElement('select');
  select.name = 'noteTemplate';
  const empty = document.createElement('option');
  empty.value = '';
  empty.textContent = 'ไม่ใช้ template';
  select.append(empty);

  for (const template of getAvailableNoteTemplates()) {
    const option = document.createElement('option');
    option.value = template.key;
    option.textContent = template.title;
    select.append(option);
  }

  label.append(select);
  return label;
}

function applyNoteTemplate(form, templateKey) {
  const template = getAvailableNoteTemplates().find((item) => item.key === templateKey);
  if (!template) return;

  for (const field of ['subjective', 'objective', 'assessment', 'plan']) {
    const value = template[field];
    if (form.elements[field] && !form.elements[field].value) {
      form.elements[field].value = value;
    }
  }
}

function getAvailableNoteTemplates() {
  const persisted = currentClinicalNoteTemplates
    .filter((template) => template.is_active !== false)
    .map((template) => ({
      key: `persisted:${template.id}`,
      title: template.title ?? template.template_key,
      subjective: template.subjective ?? '',
      objective: template.objective ?? '',
      assessment: template.assessment ?? '',
      plan: template.plan ?? '',
    }));

  return [
    ...persisted,
    ...Object.entries(fallbackNoteTemplates).map(([key, template]) => ({
      key,
      title: key.replaceAll('_', ' '),
      ...template,
    })),
  ];
}

function createFormField(name, labelText, type = 'input', required = false) {
  const label = document.createElement('label');
  label.textContent = labelText;
  const input = type === 'textarea' ? document.createElement('textarea') : document.createElement('input');
  input.name = name;
  input.required = required;
  input.autocomplete = 'off';
  if (type === 'textarea') input.rows = 2;
  label.append(input);
  return label;
}

function createDateTimeField(name, labelText, value = '') {
  const field = createFormField(name, labelText, 'input');
  const input = field.querySelector('input');
  input.type = 'datetime-local';
  input.value = toDateTimeLocal(value);
  return field;
}

function createAdminInput(name, labelText, value = '', required = false) {
  const field = createFormField(name, labelText, 'input', required);
  field.querySelector('input').value = value ?? '';
  return field;
}

function createAdminSelect(name, labelText, options, selectedValue = '') {
  const label = document.createElement('label');
  label.textContent = labelText;
  const select = createSelect(name, options);
  select.value = selectedValue;
  label.append(select);
  return label;
}

function createAdminSubmit(text) {
  const submit = document.createElement('button');
  submit.type = 'submit';
  submit.className = 'primary-button compact-button';
  submit.textContent = text;
  return submit;
}

function createUserLinkField(selectedValue = '') {
  const label = document.createElement('label');
  label.textContent = 'User';
  const select = document.createElement('select');
  select.name = 'userId';

  const empty = document.createElement('option');
  empty.value = '';
  empty.textContent = 'ไม่ผูก user';
  select.append(empty);

  for (const user of currentAdmin.users ?? []) {
    const option = document.createElement('option');
    option.value = user.id ?? '';
    option.textContent = userSummary(user);
    select.append(option);
  }

  select.value = selectedValue;
  label.append(select);
  return label;
}

function createPractitionerField(name, labelText, selectedValue = '') {
  const label = document.createElement('label');
  label.textContent = labelText;
  const select = document.createElement('select');
  select.name = name;

  const empty = document.createElement('option');
  empty.value = '';
  empty.textContent = 'ไม่ระบุ';
  select.append(empty);

  for (const practitioner of currentProfile?.practitioners ?? []) {
    const option = document.createElement('option');
    option.value = practitioner.id ?? '';
    option.textContent = practitionerSummary(practitioner);
    select.append(option);
  }

  select.value = selectedValue;
  label.append(select);
  return label;
}

async function createAppointmentFromForm(patient, form, submit) {
  const values = Object.fromEntries(new FormData(form).entries());
  const payload = compactPayload({
    clinicId: patient.clinic_id,
    patientId: patient.id,
    practitionerId: values.practitionerId,
    appointmentNumber: form.dataset.appointmentNumber || nextAppointmentNumber(patient.medical_record_number),
    status: 'confirmed',
    scheduledStartAt: toIsoDateTime(values.scheduledStartAt),
    scheduledEndAt: toIsoDateTime(values.scheduledEndAt),
    reason: values.reason,
    notes: values.notes,
  });

  submit.disabled = true;
  submit.textContent = 'กำลังบันทึก';
  setStatus('กำลังบันทึกนัด', '');

  try {
    const response = await fetch('/api/appointments', {
      method: 'POST',
      headers: buildHeaders(currentApiToken || readValue('apiToken')),
      body: JSON.stringify(payload),
    });
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.detail || result.error || `HTTP ${response.status}`);
    }

    form.reset();
    await refreshPatientWorkspace('Appointments');
    setStatus('บันทึกนัดแล้ว', 'success');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'บันทึกนัดไม่สำเร็จ';
    setStatus('บันทึกนัดไม่สำเร็จ', 'error');
    renderInlineFormError(form, message);
  } finally {
    submit.disabled = false;
    submit.textContent = 'บันทึกนัด';
  }
}

async function updateAppointmentFromForm(appointmentId, form, submit) {
  const values = Object.fromEntries(new FormData(form).entries());
  const payload = compactPayload({
    practitionerId: values.practitionerId,
    scheduledStartAt: toIsoDateTime(values.scheduledStartAt),
    scheduledEndAt: toIsoDateTime(values.scheduledEndAt),
    reason: values.reason,
    notes: values.notes,
  });

  submit.disabled = true;
  submit.textContent = 'กำลังบันทึก';
  setStatus('กำลังแก้นัด', '');

  try {
    await patchAppointment(appointmentId, payload);
    await refreshPatientWorkspace('Appointments');
    setStatus('แก้นัดแล้ว', 'success');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'แก้นัดไม่สำเร็จ';
    setStatus(message, 'error');
    renderInlineFormError(form, message);
  } finally {
    submit.disabled = false;
    submit.textContent = 'บันทึกนัด';
  }
}

async function updateEncounterFromForm(encounterId, form, submit) {
  const values = Object.fromEntries(new FormData(form).entries());
  const payload = compactPayload({
    encounterClass: values.encounterClass,
    attendingPractitionerId: values.attendingPractitionerId,
    chiefComplaint: values.chiefComplaint,
    triageSummary: values.triageSummary,
    startedAt: toIsoDateTime(values.startedAt),
    endedAt: toIsoDateTime(values.endedAt),
  });

  submit.disabled = true;
  submit.textContent = 'กำลังบันทึก';
  setStatus('กำลังแก้ encounter', '');

  try {
    await patchEncounter(encounterId, payload);
    await refreshPatientWorkspace('Encounters');
    setStatus('แก้ encounter แล้ว', 'success');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'แก้ encounter ไม่สำเร็จ';
    setStatus(message, 'error');
    renderInlineFormError(form, message);
  } finally {
    submit.disabled = false;
    submit.textContent = 'บันทึก encounter';
  }
}

async function createEncounterFromForm(patient, form, submit, appointment = null) {
  const values = Object.fromEntries(new FormData(form).entries());
  const encounterNumber = nextEncounterNumber(patient.medical_record_number);
  const diagnosisName = String(values.diagnosisName ?? '').trim();
  const vitalSign = compactPayload({
    bodyTemperatureC: values.bodyTemperatureC,
    heartRateBpm: values.heartRateBpm,
    oxygenSaturationPct: values.oxygenSaturationPct,
  });
  const hasVitalSign = Object.keys(vitalSign).length > 0;
  const subjective = String(values.subjective ?? '').trim();
  const objective = String(values.objective ?? '').trim();
  const assessment = String(values.assessment ?? '').trim();
  const plan = String(values.plan ?? '').trim();
  const chiefComplaint = String(values.chiefComplaint ?? '').trim();

  const payload = compactPayload({
    patientId: patient.id,
    encounterNumber,
    appointmentId: appointment?.id,
    status: 'in_progress',
    encounterClass: 'outpatient',
    attendingPractitionerId: values.attendingPractitionerId,
    chiefComplaint,
    title: chiefComplaint ? `Visit: ${chiefComplaint}` : 'Visit SOAP',
    subjective: subjective || chiefComplaint,
    objective,
    assessment,
    plan,
    diagnoses: diagnosisName ? [{ diagnosisName, status: 'active', diagnosisType: 'working' }] : undefined,
    vitalSigns: hasVitalSign ? [vitalSign] : undefined,
  });

  submit.disabled = true;
  submit.textContent = 'กำลังบันทึก';
  setStatus('กำลังบันทึก visit', '');

  try {
    const response = await fetch('/api/encounters', {
      method: 'POST',
      headers: buildHeaders(currentApiToken || readValue('apiToken')),
      body: JSON.stringify(payload),
    });
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.detail || result.error || `HTTP ${response.status}`);
    }

    if (appointment?.id) {
      await patchAppointment(appointment.id, { status: 'completed' });
    }

    currentProfileSection = 'Encounters';
    await refreshPatientWorkspace('Encounters');
    setStatus('บันทึก visit แล้ว', 'success');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'บันทึก visit ไม่สำเร็จ';
    setStatus('บันทึก visit ไม่สำเร็จ', 'error');
    renderInlineFormError(form, message);
  } finally {
    submit.disabled = false;
    submit.textContent = 'บันทึก visit';
  }
}

async function refreshPatientWorkspace(sectionLabel = currentProfileSection) {
  if (!currentPatient) return;

  const apiToken = currentApiToken || readValue('apiToken');
  const refreshed = await fetchPatientDetail(
    currentPatient.clinic_id,
    currentPatient.medical_record_number,
    apiToken
  );
  const profile = await fetchPatientProfileBundle(refreshed, apiToken);
  currentClinicalNoteTemplates = await fetchClinicalNoteTemplates(refreshed.clinic_id, apiToken);
  currentDrugCatalog = await fetchDrugCatalog(refreshed.clinic_id, apiToken).catch(() => []);
  currentProfileSection = sectionLabel;
  showPatientDetail(refreshed, profile);
}

function nextEncounterNumber(mrn) {
  const safeMrn = String(mrn ?? 'MRN').replace(/[^a-zA-Z0-9]/g, '').slice(-8) || 'PATIENT';
  return `ENC-${safeMrn}-${Date.now()}`;
}

function nextAppointmentNumber(mrn) {
  const safeMrn = String(mrn ?? 'MRN').replace(/[^a-zA-Z0-9]/g, '').slice(-8) || 'PATIENT';
  return `APT-${safeMrn}-${Date.now()}`;
}

function nextVisitNumber(mrn) {
  const safeMrn = String(mrn ?? 'MRN').replace(/[^a-zA-Z0-9]/g, '').slice(-8) || 'PATIENT';
  return `VIS-${safeMrn}-${Date.now()}`;
}

function nextQueueLabel() {
  return `Q${String(Date.now()).slice(-4)}`;
}

function defaultDateTimeLocal(minutesFromNow) {
  const date = new Date(Date.now() + minutesFromNow * 60 * 1000);
  date.setSeconds(0, 0);
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60 * 1000);
  return localDate.toISOString().slice(0, 16);
}

function toIsoDateTime(value) {
  const text = String(value ?? '').trim();
  if (!text) return '';
  return new Date(text).toISOString();
}

function toDateTimeLocal(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60 * 1000);
  return localDate.toISOString().slice(0, 16);
}

function syncSearchFields(patient) {
  document.querySelector('#searchClinicId').value = patient.clinic_id ?? readValue('clinicId');
  document.querySelector('#adminClinicId').value = patient.clinic_id ?? readValue('clinicId');
  document.querySelector('#billingClinicId').value = patient.clinic_id ?? readValue('clinicId');
  document.querySelector('#billingPatientId').value = patient.id ?? '';
  document.querySelector('#searchMedicalRecordNumber').value =
    patient.medical_record_number ?? readValue('medicalRecordNumber');
  renderRequestPreview();
}

function renderResultRows(rows) {
  resultList.replaceChildren();

  for (const [label, value] of Object.entries(rows)) {
    if (value === undefined || value === null || value === '') continue;

    const term = document.createElement('dt');
    term.textContent = label;
    const description = document.createElement('dd');
    description.textContent = value;
    resultList.append(term, description);
  }
}

function clearPatientDetail() {
  patientDetailPanel.hidden = true;
  patientDetail.replaceChildren();
}

function renderRequestPreview() {
  const body =
    activeView === 'search'
      ? buildSearchRequest()
      : activeView === 'queue'
        ? buildQueueRequest()
      : activeView === 'billing'
        ? buildBillingRequest()
      : activeView === 'admin'
        ? buildAdminRequest()
        : buildPatientPayload();
  payloadPreview.textContent = JSON.stringify(body, null, 2);
}

function buildEncounterDerivedLists(encounters) {
  return {
    diagnoses: encounters.flatMap((encounter) => encounter.diagnoses ?? []),
    vitalSigns: encounters.flatMap((encounter) => encounter.vital_signs ?? []),
    prescriptions: encounters.flatMap((encounter) => encounter.prescriptions ?? []),
    clinicalNotes: encounters.flatMap((encounter) => encounter.clinical_notes ?? []),
  };
}

function createMetricGrid(metrics) {
  const grid = document.createElement('div');
  grid.className = 'metric-grid';

  for (const [label, value] of metrics) {
    grid.append(createMetric(label, value));
  }

  return grid;
}

function createMetric(label, value) {
  const item = document.createElement('div');
  item.className = 'detail-metric';

  const count = document.createElement('strong');
  count.textContent = String(value);
  const name = document.createElement('span');
  name.textContent = label;

  item.append(count, name);
  return item;
}

function createProfileTabs(sections, initialLabel) {
  const wrapper = document.createElement('div');
  wrapper.className = 'profile-tabs';
  const tabs = document.createElement('div');
  tabs.className = 'profile-tab-bar';
  const content = document.createElement('div');
  content.className = 'profile-tab-content';
  const entries = Object.entries(sections);

  const activeLabel = sections[initialLabel] ? initialLabel : entries[0][0];

  for (const [label, section] of entries) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = label === activeLabel ? 'profile-tab active' : 'profile-tab';
    button.textContent = `${label} ${section.items.length}`;
    button.addEventListener('click', () => {
      currentProfileSection = label;
      for (const tab of tabs.querySelectorAll('.profile-tab')) {
        tab.classList.toggle('active', tab === button);
      }
      renderProfileSection(content, label, section);
    });
    tabs.append(button);
  }

  wrapper.append(tabs, content);
  renderProfileSection(content, activeLabel, sections[activeLabel]);
  return wrapper;
}

function renderProfileSection(container, label, section) {
  container.replaceChildren();

  const title = document.createElement('h3');
  title.textContent = label;
  container.append(title);

  const createConfig = createProfileConfigs[label];
  if (createConfig && currentPatient) {
    container.append(createProfileForm(label, createConfig));
  }

  if (label === 'Prescriptions' && currentPatient) {
    container.append(createPrescriptionEntryForm(currentPatient));
  }

  if (section.items.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'muted-text';
    empty.textContent = 'ยังไม่มีข้อมูลในหมวดนี้';
    container.append(empty);
    return;
  }

  const list = document.createElement('div');
  list.className = 'record-list';

  for (const item of section.items) {
    list.append(createRecordCard(item, section.summary, section.fields, section.sectionLabel));
  }

  container.append(list);
}

function createProfileForm(sectionLabel, config, initialValues = null) {
  const form = document.createElement('form');
  form.className = 'inline-profile-form';

  for (const field of config.fields) {
    const label = document.createElement('label');
    label.textContent = field.label;
    const input =
      field.type === 'select'
        ? createSelect(field.name, field.options ?? [])
        : document.createElement('input');

    input.name = field.name;
    input.required = Boolean(field.required);
    input.autocomplete = 'off';
    input.value = initialValues?.[field.name] ?? '';
    label.append(input);
    form.append(label);
  }

  const submit = document.createElement('button');
  submit.type = 'submit';
  submit.className = 'primary-button compact-button';
  submit.textContent = initialValues?.id ? config.updateText : config.submitText;
  form.append(submit);

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (initialValues?.id) {
      await updateProfileRecord(sectionLabel, config, initialValues.id, form, submit);
      return;
    }

    await createProfileRecord(sectionLabel, config, form, submit);
  });

  return form;
}

function createPrescriptionEntryForm(patient) {
  const form = document.createElement('form');
  form.className = 'inline-profile-form prescription-entry-form';

  const heading = document.createElement('div');
  heading.className = 'inline-form-heading';
  const title = document.createElement('h3');
  title.textContent = 'เพิ่ม prescription';
  const hint = document.createElement('span');
  hint.textContent = 'Phase 2B safety check';
  heading.append(title, hint);
  form.append(heading);

  const encounterField = createEncounterSelectField(patient);
  const noteField = createClinicalNoteSelectField(patient);
  const catalogField = createDrugCatalogField();
  const warningPanel = document.createElement('div');
  warningPanel.className = 'safety-warning-panel';
  warningPanel.hidden = true;

  form.append(
    encounterField,
    noteField,
    catalogField,
    createFormField('medicationName', 'Medication', 'input', true),
    createFormField('rxnormCode', 'RxNorm code', 'input'),
    createFormField('dosage', 'Dosage', 'input'),
    createFormField('route', 'Route', 'input'),
    createFormField('frequency', 'Frequency', 'input'),
    createFormField('durationText', 'Duration', 'input'),
    createFormField('instructions', 'Instructions', 'textarea'),
    createFormField('safetyOverrideReason', 'Override reason', 'textarea'),
    warningPanel
  );

  form.elements.drugCatalogId.addEventListener('change', () => {
    applyDrugCatalogSelection(form);
    clearSafetyWarningPanel(warningPanel);
  });

  for (const field of ['medicationName', 'rxnormCode']) {
    form.elements[field].addEventListener('input', () => clearSafetyWarningPanel(warningPanel));
  }

  const checkButton = document.createElement('button');
  checkButton.type = 'button';
  checkButton.className = 'secondary-button compact-button';
  checkButton.textContent = 'เช็ก safety';
  checkButton.addEventListener('click', async () => {
    await checkPrescriptionSafety(patient, form, warningPanel, checkButton);
  });

  const submit = document.createElement('button');
  submit.type = 'submit';
  submit.className = 'primary-button compact-button';
  submit.textContent = 'เพิ่ม prescription';
  form.append(checkButton, submit);

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    await createPrescriptionFromForm(patient, form, submit, warningPanel);
  });

  return form;
}

function createEncounterSelectField(patient) {
  const label = document.createElement('label');
  label.textContent = 'Encounter';
  const select = document.createElement('select');
  select.name = 'encounterId';
  select.required = true;

  for (const encounter of patient.encounters ?? []) {
    const option = document.createElement('option');
    option.value = encounter.id;
    option.textContent = `${encounter.encounter_number ?? encounter.id} · ${encounter.status ?? ''}`;
    select.append(option);
  }

  label.append(select);
  return label;
}

function createClinicalNoteSelectField(patient) {
  const label = document.createElement('label');
  label.textContent = 'Clinical note';
  const select = document.createElement('select');
  select.name = 'clinicalNoteId';
  const empty = document.createElement('option');
  empty.value = '';
  empty.textContent = 'ไม่ผูก note';
  select.append(empty);

  for (const encounter of patient.encounters ?? []) {
    for (const note of encounter.clinical_notes ?? []) {
      const option = document.createElement('option');
      option.value = note.id;
      option.textContent = `${encounter.encounter_number ?? encounter.id} · ${note.title ?? note.note_type ?? note.id}`;
      select.append(option);
    }
  }

  label.append(select);
  return label;
}

function createDrugCatalogField() {
  const label = document.createElement('label');
  label.textContent = 'Drug catalog';
  const select = document.createElement('select');
  select.name = 'drugCatalogId';
  const empty = document.createElement('option');
  empty.value = '';
  empty.textContent = 'ไม่เลือก catalog';
  select.append(empty);

  for (const item of currentDrugCatalog) {
    const option = document.createElement('option');
    option.value = item.id;
    option.textContent = `${item.medication_name ?? item.id}${item.rxnorm_code ? ` · ${item.rxnorm_code}` : ''}`;
    select.append(option);
  }

  label.append(select);
  return label;
}

function applyDrugCatalogSelection(form) {
  const selected = currentDrugCatalog.find((item) => item.id === form.elements.drugCatalogId.value);
  if (!selected) return;

  form.elements.medicationName.value = selected.medication_name ?? form.elements.medicationName.value;
  form.elements.rxnormCode.value = selected.rxnorm_code ?? form.elements.rxnormCode.value;
  form.elements.route.value = selected.route ?? form.elements.route.value;
}

function clearSafetyWarningPanel(panel) {
  panel.hidden = true;
  panel.replaceChildren();
}

function renderSafetyWarningPanel(panel, assessment) {
  panel.hidden = false;
  panel.replaceChildren();
  const warnings = assessment?.warnings ?? [];
  const title = document.createElement('strong');
  title.textContent = warnings.length > 0 ? 'Safety warnings' : 'ไม่พบ warning จากข้อมูล allergy/catalog';
  panel.append(title);

  for (const warning of warnings) {
    const item = document.createElement('p');
    item.className = warning.severity === 'critical' ? 'critical-warning' : 'muted-note';
    item.textContent = `${warning.severity ?? 'warning'}: ${warning.message ?? warning.allergenName ?? 'warning'}`;
    panel.append(item);
  }
}

async function checkPrescriptionSafety(patient, form, panel, button) {
  const payload = buildPrescriptionSafetyPayload(patient, form);
  if (!payload.medicationName) {
    renderSafetyWarningPanel(panel, { warnings: [] });
    return { warnings: [] };
  }

  button.disabled = true;
  button.textContent = 'กำลังเช็ก';
  try {
    const response = await fetch('/api/prescription-safety-checks', {
      method: 'POST',
      headers: buildHeaders(currentApiToken || readValue('apiToken')),
      body: JSON.stringify(payload),
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.detail || result.error || `HTTP ${response.status}`);
    }
    renderSafetyWarningPanel(panel, result.data);
    return result.data;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'เช็ก safety ไม่สำเร็จ';
    setStatus(message, 'error');
    renderInlineFormError(form, message);
    return { warnings: [] };
  } finally {
    button.disabled = false;
    button.textContent = 'เช็ก safety';
  }
}

function buildPrescriptionSafetyPayload(patient, form) {
  const values = Object.fromEntries(new FormData(form).entries());
  return compactPayload({
    patientId: patient.id,
    medicationName: values.medicationName,
    rxnormCode: values.rxnormCode,
    drugCatalogId: values.drugCatalogId,
  });
}

async function createPrescriptionFromForm(patient, form, submit, warningPanel) {
  const values = Object.fromEntries(new FormData(form).entries());
  const payload = compactPayload({
    encounterId: values.encounterId,
    clinicalNoteId: values.clinicalNoteId,
    drugCatalogId: values.drugCatalogId,
    medicationName: values.medicationName,
    rxnormCode: values.rxnormCode,
    dosage: values.dosage,
    route: values.route,
    frequency: values.frequency,
    durationText: values.durationText,
    instructions: values.instructions,
    safetyOverrideReason: values.safetyOverrideReason,
    status: 'active',
  });

  submit.disabled = true;
  submit.textContent = 'กำลังบันทึก';
  setStatus('กำลังเพิ่ม prescription', '');

  try {
    if (!warningPanel.hidden) {
      clearSafetyWarningPanel(warningPanel);
    }
    const assessment = await fetchPrescriptionSafety(buildPrescriptionSafetyPayload(patient, form));
    renderSafetyWarningPanel(warningPanel, assessment);
    if ((assessment.warnings ?? []).length > 0 && !String(values.safetyOverrideReason ?? '').trim()) {
      throw new Error('กรุณาระบุ override reason เมื่อมี safety warning');
    }

    const response = await fetch('/api/prescriptions', {
      method: 'POST',
      headers: buildHeaders(currentApiToken || readValue('apiToken')),
      body: JSON.stringify(payload),
    });
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.detail || result.error || `HTTP ${response.status}`);
    }

    form.reset();
    currentProfileSection = 'Prescriptions';
    await refreshPatientWorkspace('Prescriptions');
    setStatus('เพิ่ม prescription แล้ว', 'success');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'เพิ่ม prescription ไม่สำเร็จ';
    setStatus(message, 'error');
    renderInlineFormError(form, message);
  } finally {
    submit.disabled = false;
    submit.textContent = 'เพิ่ม prescription';
  }
}

async function fetchPrescriptionSafety(payload) {
  if (!payload.medicationName) return { warnings: [] };

  const response = await fetch('/api/prescription-safety-checks', {
    method: 'POST',
    headers: buildHeaders(currentApiToken || readValue('apiToken')),
    body: JSON.stringify(payload),
  });
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.detail || result.error || `HTTP ${response.status}`);
  }

  return result.data;
}

function createSelect(name, options) {
  const select = document.createElement('select');
  select.name = name;

  for (const optionValue of options) {
    const option = document.createElement('option');
    option.value = optionValue;
    option.textContent = optionValue;
    select.append(option);
  }

  return select;
}

async function createProfileRecord(sectionLabel, config, form, submit) {
  if (!currentPatient) return;

  const payload = compactPayload({
    patientId: currentPatient.id,
    ...Object.fromEntries(new FormData(form).entries()),
  });

  submit.disabled = true;
  submit.textContent = 'กำลังบันทึก';
  setStatus('กำลังบันทึก profile', '');

  try {
    const response = await fetch(config.endpoint, {
      method: 'POST',
      headers: buildHeaders(currentApiToken || readValue('apiToken')),
      body: JSON.stringify(payload),
    });
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.detail || result.error || `HTTP ${response.status}`);
    }

    form.reset();
    currentProfileSection = sectionLabel;
    await refreshPatientWorkspace(sectionLabel);
    setStatus(`${sectionLabel} บันทึกแล้ว`, 'success');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'บันทึก profile ไม่สำเร็จ';
    setStatus('บันทึก profile ไม่สำเร็จ', 'error');
    renderInlineFormError(form, message);
  } finally {
    submit.disabled = false;
    submit.textContent = config.submitText;
  }
}

async function updateProfileRecord(sectionLabel, config, recordId, form, submit) {
  const payload = compactPayload(Object.fromEntries(new FormData(form).entries()));

  submit.disabled = true;
  submit.textContent = 'กำลังบันทึก';
  setStatus('กำลังแก้ไข profile', '');

  try {
    const response = await fetch(`${config.endpoint}/${recordId}`, {
      method: 'PATCH',
      headers: buildHeaders(currentApiToken || readValue('apiToken')),
      body: JSON.stringify(payload),
    });
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.detail || result.error || `HTTP ${response.status}`);
    }

    currentProfileSection = sectionLabel;
    await refreshPatientWorkspace(sectionLabel);
    setStatus(`${sectionLabel} แก้ไขแล้ว`, 'success');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'แก้ไข profile ไม่สำเร็จ';
    setStatus('แก้ไข profile ไม่สำเร็จ', 'error');
    renderInlineFormError(form, message);
  } finally {
    submit.disabled = false;
    submit.textContent = config.updateText;
  }
}

async function deleteProfileRecord(sectionLabel, config, recordId, button) {
  button.disabled = true;
  button.textContent = 'กำลังปิด';
  setStatus('กำลังปิดรายการ', '');

  try {
    const response = await fetch(`${config.endpoint}/${recordId}`, {
      method: 'DELETE',
      headers: buildHeaders(currentApiToken || readValue('apiToken')),
    });
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.detail || result.error || `HTTP ${response.status}`);
    }

    currentProfileSection = sectionLabel;
    await refreshPatientWorkspace(sectionLabel);
    setStatus(`${sectionLabel} ปิดรายการแล้ว`, 'success');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'ปิดรายการไม่สำเร็จ';
    setStatus(message, 'error');
  } finally {
    button.disabled = false;
    button.textContent = 'ปิดรายการ';
  }
}

function renderInlineFormError(form, message) {
  form.querySelector('.inline-error')?.remove();
  const error = document.createElement('p');
  error.className = 'inline-error';
  error.textContent = message;
  form.append(error);
}

function records(items, summary, fields, sectionLabel) {
  return { items, summary, fields, sectionLabel };
}

function createRecordCard(item, summary, fields, sectionLabel) {
  const card = document.createElement('article');
  card.className = 'record-card';
  const title = document.createElement('h4');
  title.textContent = summary(item);
  const details = document.createElement('dl');

  for (const field of fields) {
    const value = item[field];
    if (value === undefined || value === null || value === '') continue;

    const term = document.createElement('dt');
    term.textContent = labelize(field);
    const description = document.createElement('dd');
    description.textContent = formatValue(value);
    details.append(term, description);
  }

  card.append(title, details);

  const config = createProfileConfigs[sectionLabel];
  if (config && item.id) {
    card.append(createRecordActions(card, item, sectionLabel, config));
  }

  if (sectionLabel === 'Notes' && item.id && (item.note_type === 'soap' || item.soap_note)) {
    card.append(createClinicalNoteActions(card, item));
  }

  if (sectionLabel === 'Appointments' && item.id) {
    card.append(createAppointmentActions(card, item));
  }

  if (sectionLabel === 'Encounters' && item.id) {
    card.append(createEncounterActions(item));
  }

  if (sectionLabel === 'Prescriptions' && item.id) {
    card.append(createPrescriptionActions(item));
  }

  return card;
}

function createPrescriptionActions(prescription) {
  const actions = document.createElement('div');
  actions.className = 'record-actions';
  const printButton = document.createElement('button');
  printButton.type = 'button';
  printButton.className = 'secondary-button small-button';
  printButton.textContent = 'พิมพ์ใบสั่งยา';
  printButton.addEventListener('click', async () => {
    await openPrescriptionPrint(prescription);
  });
  actions.append(printButton);
  return actions;
}

async function openPrescriptionPrint(prescription) {
  const printWindow = window.open('', '_blank', 'width=720,height=840');
  if (!printWindow) return;

  const html = await buildPrescriptionPrintHtml(prescription);
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
}

function openReceiptPrint(invoice) {
  const printWindow = window.open('', '_blank', 'width=720,height=840');
  if (!printWindow) return;

  printWindow.document.write(buildReceiptPrintHtml(invoice));
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
}

function buildReceiptPrintHtml(invoice) {
  const printedAt = new Date().toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' });
  const clinicName = currentClinicSettings?.display_name ?? 'EMR Core Clinic';
  const patientName = currentPatient ? `${currentPatient.first_name} ${currentPatient.last_name}` : invoice.patient_id ?? '';
  const lineItems = invoice.line_items ?? [];
  const payments = invoice.payments ?? [];
  const refunds = invoice.refunds ?? [];

  return `
    <!doctype html>
    <html lang="th">
      <head>
        <meta charset="utf-8" />
        <title>Receipt</title>
        <style>
          body { margin: 0; color: #17211f; font-family: Arial, sans-serif; }
          main { padding: 32px; }
          header { display: flex; justify-content: space-between; gap: 24px; border-bottom: 2px solid #17211f; padding-bottom: 18px; }
          h1 { margin: 0; font-size: 24px; }
          h2 { margin: 24px 0 8px; font-size: 16px; }
          dl { display: grid; grid-template-columns: 140px 1fr; gap: 6px 12px; margin: 14px 0; }
          dt { font-weight: 700; color: #5f706b; }
          dd { margin: 0; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th, td { border-bottom: 1px solid #d9e4e0; padding: 8px 6px; text-align: left; vertical-align: top; }
          th:last-child, td:last-child { text-align: right; }
          .totals { margin-left: auto; max-width: 320px; }
          .status { text-transform: uppercase; font-weight: 700; }
          @media print { body { print-color-adjust: exact; } }
        </style>
      </head>
      <body>
        <main>
          <header>
            <div>
              <h1>ใบเสร็จ / Receipt</h1>
              <div>${escapeHtml(clinicName)}</div>
            </div>
            <div>
              <div class="status">${escapeHtml(invoice.status ?? '')}</div>
              <div>${escapeHtml(printedAt)}</div>
            </div>
          </header>
          <dl>
            <dt>Invoice</dt><dd>${escapeHtml(invoice.invoice_number ?? invoice.id ?? '')}</dd>
            <dt>Patient</dt><dd>${escapeHtml(patientName)}</dd>
            <dt>Patient ID</dt><dd>${escapeHtml(invoice.patient_id ?? '')}</dd>
          </dl>
          <h2>Charges</h2>
          <table>
            <thead><tr><th>รายการ</th><th>จำนวน</th><th>ราคา</th><th>รวม</th></tr></thead>
            <tbody>
              ${lineItems.map((item) => `
                <tr>
                  <td>${escapeHtml(item.description ?? '')}</td>
                  <td>${escapeHtml(item.quantity ?? '')}</td>
                  <td>${escapeHtml(formatMoney(item.unit_price_amount ?? 0))}</td>
                  <td>${escapeHtml(formatMoney(item.line_total_amount ?? 0))}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <h2>Payments</h2>
          <table>
            <tbody>
              ${payments.map((payment) => `
                <tr><td>${escapeHtml(payment.payment_number ?? '')}</td><td>${escapeHtml(payment.method ?? '')}</td><td>${escapeHtml(formatMoney(payment.amount ?? 0))}</td></tr>
              `).join('') || '<tr><td colspan="3">ยังไม่มี payment</td></tr>'}
            </tbody>
          </table>
          <h2>Refunds</h2>
          <table>
            <tbody>
              ${refunds.map((refund) => `
                <tr><td>${escapeHtml(refund.refund_number ?? '')}</td><td>${escapeHtml(refund.method ?? '')}</td><td>${escapeHtml(formatMoney(refund.amount ?? 0))}</td></tr>
              `).join('') || '<tr><td colspan="3">ยังไม่มี refund</td></tr>'}
            </tbody>
          </table>
          <dl class="totals">
            <dt>Total</dt><dd>${escapeHtml(formatMoney(invoice.total_amount ?? 0))}</dd>
            <dt>Paid</dt><dd>${escapeHtml(formatMoney(invoice.paid_amount ?? 0))}</dd>
            <dt>Refunded</dt><dd>${escapeHtml(formatMoney(invoice.refunded_amount ?? 0))}</dd>
            <dt>Balance</dt><dd>${escapeHtml(formatMoney(invoice.balance_amount ?? 0))}</dd>
          </dl>
        </main>
      </body>
    </html>
  `;
}

async function buildPrescriptionPrintHtml(prescription) {
  const patientName = currentPatient ? `${currentPatient.first_name} ${currentPatient.last_name}` : '';
  const practitioner = (currentProfile?.practitioners ?? []).find(
    (item) => item.id === prescription.prescribed_by_practitioner_id
  );
  const practitionerName = practitioner ? practitionerSummary(practitioner) : prescription.prescribed_by_practitioner_id ?? '';
  const documentNumber = `RX-${String(prescription.id ?? Date.now()).slice(0, 8).toUpperCase()}`;
  const printedAt = new Date().toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' });
  const clinicName = currentClinicSettings?.display_name ?? 'EMR Core Clinic';
  const clinicContact = [
    currentClinicSettings?.address,
    currentClinicSettings?.phone_number,
    currentClinicSettings?.email,
    currentClinicSettings?.website,
  ].filter(Boolean).join(' | ');
  const footer = currentClinicSettings?.prescription_footer ?? 'ลงชื่อแพทย์ / Pharmacist verification';
  const logoUrl = currentClinicSettings?.logo_url
    || (currentClinicSettings?.logo_file_asset_id
      ? await fetchFileAssetDataUrl(currentClinicSettings.logo_file_asset_id, currentApiToken || readValue('apiToken'))
      : '');
  const logoMarkup = logoUrl
    ? `<img class="clinic-logo" src="${escapeHtml(logoUrl)}" alt="${escapeHtml(clinicName)} logo" />`
    : '';

  return `
    <!doctype html>
    <html lang="th">
      <head>
        <title>Prescription</title>
        <style>
          body { font-family: system-ui, sans-serif; margin: 32px; color: #111827; }
          .header { border-bottom: 2px solid #111827; padding-bottom: 16px; margin-bottom: 20px; display: flex; gap: 16px; align-items: center; }
          .clinic-logo { width: 64px; height: 64px; object-fit: contain; }
          .clinic { font-size: 22px; font-weight: 800; }
          .doc-meta { color: #475569; margin-top: 4px; }
          h1 { font-size: 20px; margin: 0 0 12px; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
          dl { display: grid; grid-template-columns: 130px 1fr; gap: 8px 12px; }
          dt { font-weight: 700; color: #334155; }
          dd { margin: 0; }
          .medicine { border: 1px solid #cbd5e1; padding: 18px; margin-top: 20px; }
          .medicine-name { font-size: 19px; font-weight: 800; margin-bottom: 10px; }
          .footer { margin-top: 56px; display: grid; grid-template-columns: 1fr 1fr; gap: 32px; }
          .signature { border-top: 1px solid #111827; padding-top: 10px; text-align: center; }
        </style>
      </head>
      <body>
        <div class="header">
          ${logoMarkup}
          <div>
            <div class="clinic">${escapeHtml(clinicName)}</div>
            <div class="doc-meta">${escapeHtml(clinicContact || `Clinic ID: ${currentPatient?.clinic_id ?? ''}`)}</div>
          </div>
        </div>
        <h1>ใบสั่งยา / Prescription</h1>
        <div class="grid">
          <dl>
            <dt>เลขที่เอกสาร</dt><dd>${escapeHtml(documentNumber)}</dd>
            <dt>วันที่พิมพ์</dt><dd>${escapeHtml(printedAt)}</dd>
            <dt>Encounter</dt><dd>${escapeHtml(prescription.encounter_id ?? '')}</dd>
          </dl>
          <dl>
            <dt>ผู้ป่วย</dt><dd>${escapeHtml(patientName)}</dd>
            <dt>HN</dt><dd>${escapeHtml(currentPatient?.medical_record_number ?? '')}</dd>
            <dt>แพทย์</dt><dd>${escapeHtml(practitionerName)}</dd>
          </dl>
        </div>
        <div class="medicine">
          <div class="medicine-name">${escapeHtml(prescription.medication_name ?? '')}</div>
          <dl>
            <dt>ขนาดยา</dt><dd>${escapeHtml(prescription.dosage ?? '')}</dd>
            <dt>วิถีทาง</dt><dd>${escapeHtml(prescription.route ?? '')}</dd>
            <dt>ความถี่</dt><dd>${escapeHtml(prescription.frequency ?? '')}</dd>
            <dt>ระยะเวลา</dt><dd>${escapeHtml(prescription.duration_text ?? '')}</dd>
            <dt>วิธีใช้</dt><dd>${escapeHtml(prescription.instructions ?? '')}</dd>
            <dt>สถานะ</dt><dd>${escapeHtml(prescription.status ?? '')}</dd>
          </dl>
        </div>
        <div class="footer">
          <div></div>
          <div class="signature">${escapeHtml(footer)}</div>
        </div>
      </body>
    </html>
  `;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function createRecordActions(card, item, sectionLabel, config) {
  const actions = document.createElement('div');
  actions.className = 'record-actions';
  const editButton = document.createElement('button');
  editButton.type = 'button';
  editButton.className = 'secondary-button small-button';
  editButton.textContent = 'แก้ไข';
  const deleteButton = document.createElement('button');
  deleteButton.type = 'button';
  deleteButton.className = 'secondary-button danger-button small-button';
  deleteButton.textContent = 'ปิดรายการ';

  editButton.addEventListener('click', () => {
    card.querySelector('.inline-profile-form')?.remove();
    const form = createProfileForm(sectionLabel, config, valuesForForm(item, config));
    card.append(form);
  });

  deleteButton.addEventListener('click', async () => {
    await deleteProfileRecord(sectionLabel, config, item.id, deleteButton);
  });

  actions.append(editButton, deleteButton);
  return actions;
}

function createAppointmentActions(card, appointment) {
  const actions = document.createElement('div');
  actions.className = 'record-actions';

  if (appointment.status === 'pending') {
    actions.append(createAppointmentStatusButton(appointment, 'confirmed', 'ยืนยันนัด'));
  }

  if (!['completed', 'cancelled', 'no_show'].includes(appointment.status)) {
    const editButton = document.createElement('button');
    editButton.type = 'button';
    editButton.className = 'secondary-button small-button';
    editButton.textContent = 'แก้นัด';
    editButton.addEventListener('click', () => {
      card.querySelector('.appointment-form')?.remove();
      card.append(createAppointmentEditForm(appointment));
    });
    actions.append(editButton);
  }

  if (appointment.status === 'confirmed') {
    actions.append(createCheckInButton(appointment));
  }

  if (appointment.status === 'checked_in') {
    const startButton = document.createElement('button');
    startButton.type = 'button';
    startButton.className = 'primary-button small-button';
    startButton.textContent = 'เริ่มตรวจ';
    startButton.addEventListener('click', () => {
      card.querySelector('.encounter-entry-form')?.remove();
      card.append(createEncounterEntryForm(currentPatient, appointment));
    });
    actions.append(startButton);
  }

  if (!['completed', 'cancelled', 'no_show'].includes(appointment.status)) {
    actions.append(createAppointmentStatusButton(appointment, 'cancelled', 'ยกเลิก'));
  }

  if (appointment.status === 'confirmed') {
    actions.append(createAppointmentStatusButton(appointment, 'no_show', 'No-show'));
  }

  return actions;
}

function createCheckInButton(appointment) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'secondary-button small-button';
  button.textContent = 'เช็กอิน';
  button.addEventListener('click', async () => {
    button.disabled = true;
    button.textContent = 'กำลังเช็กอิน';

    try {
      await createVisitFromAppointment(appointment);
      await patchAppointment(appointment.id, { status: 'checked_in' });
      await refreshPatientWorkspace('Appointments');
      setStatus('เช็กอินและเข้าคิวแล้ว', 'success');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'เช็กอินไม่สำเร็จ';
      setStatus(message, 'error');
    } finally {
      button.disabled = false;
      button.textContent = 'เช็กอิน';
    }
  });
  return button;
}

async function createVisitFromAppointment(appointment) {
  const response = await fetch('/api/visits', {
    method: 'POST',
    headers: buildHeaders(currentApiToken || readValue('apiToken')),
    body: JSON.stringify({
      clinicId: appointment.clinic_id,
      patientId: appointment.patient_id,
      appointmentId: appointment.id,
      practitionerId: appointment.practitioner_id,
      visitNumber: nextVisitNumber(currentPatient?.medical_record_number),
      queueLabel: nextQueueLabel(),
    }),
  });
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.detail || result.error || `HTTP ${response.status}`);
  }

  return result.data;
}

function createEncounterActions(encounter) {
  const actions = document.createElement('div');
  actions.className = 'record-actions';
  const editButton = document.createElement('button');
  editButton.type = 'button';
  editButton.className = 'secondary-button small-button';
  editButton.textContent = 'แก้ encounter';
  editButton.addEventListener('click', () => {
    const card = editButton.closest('.record-card');
    card.querySelector('.encounter-edit-form')?.remove();
    card.append(createEncounterEditForm(encounter));
  });
  actions.append(editButton);

  if (encounter.status === 'draft') {
    actions.append(createEncounterStatusButton(encounter, 'in_progress', 'เริ่มตรวจ'));
  }

  if (encounter.status === 'draft' || encounter.status === 'in_progress') {
    actions.append(createEncounterStatusButton(encounter, 'cancelled', 'ยกเลิก'));
  }

  if (encounter.status === 'in_progress') {
    actions.append(createEncounterStatusButton(encounter, 'completed', 'จบ encounter'));
  }

  if (encounter.status === 'completed') {
    actions.append(createEncounterStatusButton(encounter, 'signed', 'Sign encounter'));
  }

  return actions;
}

function createEncounterStatusButton(encounter, status, label) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className =
    status === 'cancelled'
      ? 'secondary-button danger-button small-button'
      : status === 'signed'
        ? 'primary-button small-button'
        : 'secondary-button small-button';
  button.textContent = label;

  button.addEventListener('click', async () => {
    button.disabled = true;
    button.textContent = 'กำลังบันทึก';

    try {
      const payload = { status };
      if (status === 'completed') payload.endedAt = new Date().toISOString();
      if (status === 'in_progress') payload.startedAt = encounter.started_at ?? new Date().toISOString();
      await patchEncounter(encounter.id, payload);
      await syncVisitStatusForEncounter(encounter.id, status);
      await refreshPatientWorkspace('Encounters');
      setStatus(`Encounter: ${status}`, 'success');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'อัปเดต encounter ไม่สำเร็จ';
      setStatus(message, 'error');
    } finally {
      button.disabled = false;
      button.textContent = label;
    }
  });

  return button;
}

async function syncVisitStatusForEncounter(encounterId, encounterStatus) {
  const visit = currentQueue.find((item) => item.encounter_id === encounterId);
  if (!visit) return;

  const statusMap = {
    completed: 'completed',
    signed: 'discharged',
    cancelled: 'cancelled',
  };
  const visitStatus = statusMap[encounterStatus];
  if (!visitStatus || visit.status === visitStatus) return;

  await patchVisit(visit.id, { status: visitStatus });
  currentQueue = await fetchQueue(readValue('queueClinicId') || visit.clinic_id, currentApiToken || readValue('apiToken'));
}

async function patchEncounter(encounterId, payload) {
  const response = await fetch(`/api/encounters/${encounterId}`, {
    method: 'PATCH',
    headers: buildHeaders(currentApiToken || readValue('apiToken')),
    body: JSON.stringify(payload),
  });
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.detail || result.error || `HTTP ${response.status}`);
  }

  return result.data;
}

function createAppointmentStatusButton(appointment, status, label) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className =
    status === 'cancelled' || status === 'no_show'
      ? 'secondary-button danger-button small-button'
      : 'secondary-button small-button';
  button.textContent = label;
  button.addEventListener('click', async () => {
    button.disabled = true;
    button.textContent = 'กำลังบันทึก';

    try {
      await patchAppointment(appointment.id, { status });
      await refreshPatientWorkspace('Appointments');
      setStatus(`Appointment: ${status}`, 'success');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'อัปเดตนัดไม่สำเร็จ';
      setStatus(message, 'error');
    } finally {
      button.disabled = false;
      button.textContent = label;
    }
  });
  return button;
}

async function patchAppointment(appointmentId, payload) {
  const response = await fetch(`/api/appointments/${appointmentId}`, {
    method: 'PATCH',
    headers: buildHeaders(currentApiToken || readValue('apiToken')),
    body: JSON.stringify(payload),
  });
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.detail || result.error || `HTTP ${response.status}`);
  }

  return result.data;
}

async function patchVisit(visitId, payload) {
  const response = await fetch(`/api/visits/${visitId}`, {
    method: 'PATCH',
    headers: buildHeaders(currentApiToken || readValue('apiToken')),
    body: JSON.stringify(payload),
  });
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.detail || result.error || `HTTP ${response.status}`);
  }

  return result.data;
}

function createClinicalNoteActions(card, note) {
  const actions = document.createElement('div');
  actions.className = 'record-actions';
  const openButton = document.createElement('button');
  openButton.type = 'button';
  openButton.className = 'secondary-button small-button';
  openButton.textContent = 'เปิด SOAP';

  openButton.addEventListener('click', async () => {
    card.querySelector('.soap-editor-form')?.remove();
    openButton.disabled = true;
    openButton.textContent = 'กำลังเปิด';

    try {
      const soapNote = await fetchSoapNote(note.id);
      card.append(createSoapEditorForm(note.id, soapNote));
      setStatus('เปิด SOAP แล้ว', 'success');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'เปิด SOAP ไม่สำเร็จ';
      setStatus(message, 'error');
    } finally {
      openButton.disabled = false;
      openButton.textContent = 'เปิด SOAP';
    }
  });

  actions.append(openButton);

  if (note.status !== 'final') {
    actions.append(createClinicalNoteStatusButton(note, 'finalize', 'Finalize'));
  }

  if (!note.signed_at) {
    actions.append(createClinicalNoteStatusButton(note, 'sign', 'Sign'));
  }

  return actions;
}

function createClinicalNoteStatusButton(note, action, label) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = action === 'sign' ? 'primary-button small-button' : 'secondary-button small-button';
  button.textContent = label;

  button.addEventListener('click', async () => {
    button.disabled = true;
    button.textContent = 'กำลังบันทึก';

    try {
      await patchClinicalNoteStatus(note.id, action);
      await refreshPatientWorkspace('Notes');
      setStatus(action === 'sign' ? 'ลงนาม note แล้ว' : 'finalize note แล้ว', 'success');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'อัปเดต note ไม่สำเร็จ';
      setStatus(message, 'error');
    } finally {
      button.disabled = false;
      button.textContent = label;
    }
  });

  return button;
}

async function patchClinicalNoteStatus(clinicalNoteId, action) {
  const response = await fetch(`/api/clinical-notes/${clinicalNoteId}/${action}`, {
    method: 'PATCH',
    headers: buildHeaders(currentApiToken || readValue('apiToken')),
    body: JSON.stringify({}),
  });
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.detail || result.error || `HTTP ${response.status}`);
  }

  return result.data;
}

async function fetchSoapNote(clinicalNoteId) {
  const response = await fetch(`/api/clinical-notes/${clinicalNoteId}/soap`, {
    headers: buildHeaders(currentApiToken || readValue('apiToken')),
  });
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.detail || result.error || `HTTP ${response.status}`);
  }

  return result.data;
}

function createSoapEditorForm(clinicalNoteId, soapNote) {
  const form = document.createElement('form');
  form.className = 'soap-editor-form';
  const heading = document.createElement('div');
  heading.className = 'inline-form-heading';
  const title = document.createElement('h3');
  title.textContent = 'SOAP';
  const idLabel = document.createElement('span');
  idLabel.textContent = clinicalNoteId;
  heading.append(title, idLabel);
  form.append(heading);

  for (const field of ['subjective', 'objective', 'assessment', 'plan']) {
    const label = createFormField(field, labelize(field), 'textarea');
    label.querySelector('textarea').value = soapNote[field] ?? '';
    form.append(label);
  }

  const submit = document.createElement('button');
  submit.type = 'submit';
  submit.className = 'primary-button compact-button';
  submit.textContent = 'บันทึก SOAP';
  form.append(submit);

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    await updateSoapNote(clinicalNoteId, form, submit);
  });

  return form;
}

async function updateSoapNote(clinicalNoteId, form, submit) {
  const payload = compactPayload(Object.fromEntries(new FormData(form).entries()));

  submit.disabled = true;
  submit.textContent = 'กำลังบันทึก';
  setStatus('กำลังบันทึก SOAP', '');

  try {
    const response = await fetch(`/api/clinical-notes/${clinicalNoteId}/soap`, {
      method: 'PATCH',
      headers: buildHeaders(currentApiToken || readValue('apiToken')),
      body: JSON.stringify(payload),
    });
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.detail || result.error || `HTTP ${response.status}`);
    }

    if (currentPatient) {
      await refreshPatientWorkspace('Notes');
    }
    setStatus('บันทึก SOAP แล้ว', 'success');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'บันทึก SOAP ไม่สำเร็จ';
    setStatus('บันทึก SOAP ไม่สำเร็จ', 'error');
    renderInlineFormError(form, message);
  } finally {
    submit.disabled = false;
    submit.textContent = 'บันทึก SOAP';
  }
}

function valuesForForm(item, config) {
  return {
    id: item.id,
    ...Object.fromEntries(
      config.fields.map((field) => [field.name, item[camelToSnake(field.name)] ?? item[field.name] ?? ''])
    ),
  };
}

function camelToSnake(value) {
  return value.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

function labelize(field) {
  return field.replaceAll('_', ' ');
}

function formatValue(value) {
  if (typeof value !== 'string') return String(value);

  if (/^\d{4}-\d{2}-\d{2}T/.test(value)) {
    return new Intl.DateTimeFormat('th-TH', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value));
  }

  return value;
}

function formatMoney(value) {
  const amount = Number(value ?? 0);
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 2,
  }).format(Number.isFinite(amount) ? amount : 0);
}

function flagSummary(item) {
  return item.label ?? item.flag_type ?? item.id;
}

function allergySummary(item) {
  return item.allergen_name ?? item.allergen ?? item.id;
}

function conditionSummary(item) {
  return item.condition_name ?? item.condition_code ?? item.id;
}

function medicationSummary(item) {
  return item.medication_name ?? item.rxnorm_code ?? item.id;
}

function appointmentSummary(item) {
  return `${item.appointment_number ?? item.id} · ${item.status ?? 'pending'}`;
}

function visitSummary(item) {
  const name = [item.patient_first_name, item.patient_last_name].filter(Boolean).join(' ');
  const owner = [item.practitioner_first_name, item.practitioner_last_name].filter(Boolean).join(' ');
  const ownerText = owner || item.practitioner_id || 'unassigned';
  return `${item.queue_label ?? item.visit_number ?? item.id} · ${name || item.medical_record_number || 'patient'} · ${ownerText}`;
}

function userSummary(item) {
  const identity = item.oidc_subject ? ` · ${item.oidc_subject}` : '';
  return `${item.display_name ?? item.username ?? item.email ?? item.id}${identity}`;
}

function practitionerSummary(item) {
  const name = [item.first_name, item.last_name].filter(Boolean).join(' ');
  return `${name || item.practitioner_code || item.id}${item.specialty ? ` · ${item.specialty}` : ''}`;
}

function templateSummary(item) {
  return item.title ?? item.template_key ?? item.id;
}

function encounterSummary(item) {
  return item.encounter_number ?? item.id;
}

function diagnosisSummary(item) {
  return item.diagnosis_name ?? item.diagnosis_code ?? item.id;
}

function vitalSummary(item) {
  const measuredAt = item.measured_at ? formatValue(item.measured_at) : item.id;
  return `Vitals · ${measuredAt}`;
}

function prescriptionSummary(item) {
  return item.medication_name ?? item.rxnorm_code ?? item.id;
}

function invoiceSummary(item) {
  return `${item.invoice_number ?? item.id} · ${formatMoney(item.balance_amount ?? 0)}`;
}

function noteSummary(item) {
  return item.title ?? item.note_type ?? item.id;
}

function auditSummary(item) {
  return `${item.action ?? 'audit'} · ${item.entity_type ?? 'entity'}`;
}

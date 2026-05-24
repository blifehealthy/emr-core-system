const registrationForm = document.querySelector('#registration-form');
const searchForm = document.querySelector('#patient-search-form');
const adminForm = document.querySelector('#admin-form');
const queueForm = document.querySelector('#queue-form');
const submitButton = document.querySelector('#submit-button');
const searchButton = document.querySelector('#search-button');
const adminLoadButton = document.querySelector('#admin-load-button');
const queueLoadButton = document.querySelector('#queue-load-button');
const serviceStatus = document.querySelector('#service-status');
const resultTitle = document.querySelector('#result-title');
const resultList = document.querySelector('#result-list');
const payloadPreview = document.querySelector('#payload-preview');
const patientDetailPanel = document.querySelector('#patient-detail-panel');
const patientDetail = document.querySelector('#patient-detail');
const adminWorkspace = document.querySelector('#admin-workspace');
const queueBoard = document.querySelector('#queue-board');
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
const noteTemplates = {
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
    renderQueueBoard();
    setStatus('โหลดคิวแล้ว', 'success');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'โหลดคิวไม่สำเร็จ';
    setStatus(message, 'error');
  } finally {
    setQueueBusy(false);
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
    limit: readValue('queueLimit'),
  });
}

function buildHeaders(apiToken) {
  const headers = {
    'content-type': 'application/json',
    'x-user-role': readValue('userRole') || 'nurse',
  };

  const userId = readValue('userId');
  if (userId) headers['x-user-id'] = userId;
  if (apiToken) headers.Authorization = `Bearer ${apiToken}`;

  return headers;
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
  const [usersPage, practitionersPage] = await Promise.all([
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
  ]);
  currentAdminMeta = {
    users: usersPage.meta,
    practitioners: practitionersPage.meta,
  };

  return { users: usersPage.items, practitioners: practitionersPage.items };
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
  queueLoadButton.textContent = isBusy ? 'กำลังโหลด' : 'โหลดคิว';
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
      ]),
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
        'room_name',
        'checked_in_at',
      ]);
      card.append(createVisitActions(visit));
      column.append(card);
    }

    columns.append(column);
  }

  queueBoard.replaceChildren(columns);
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
  currentProfileSection = sectionLabel;
  showPatientDetail(patient, profile);
}

function renderAdminWorkspace(clinicId) {
  adminWorkspace.hidden = false;

  adminWorkspace.replaceChildren(
    createAdminSection('Users', 'users', createUserForm(clinicId), currentAdmin.users, userSummary, [
      'role',
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
    createAuditSection()
  );
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
    createAdminSelect('role', 'Role', ['doctor', 'nurse', 'admin'], user?.role ?? 'nurse')
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
  return createAdminSelect('noteTemplate', 'Template', [
    '',
    'general_follow_up',
    'uri',
    'chronic_follow_up',
  ], '');
}

function applyNoteTemplate(form, templateKey) {
  const template = noteTemplates[templateKey];
  if (!template) return;

  for (const [field, value] of Object.entries(template)) {
    if (form.elements[field] && !form.elements[field].value) {
      form.elements[field].value = value;
    }
  }
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
  printButton.addEventListener('click', () => {
    openPrescriptionPrint(prescription);
  });
  actions.append(printButton);
  return actions;
}

function openPrescriptionPrint(prescription) {
  const printWindow = window.open('', '_blank', 'width=720,height=840');
  if (!printWindow) return;

  const patientName = currentPatient ? `${currentPatient.first_name} ${currentPatient.last_name}` : '';
  printWindow.document.write(`
    <!doctype html>
    <html lang="th">
      <head>
        <title>Prescription</title>
        <style>
          body { font-family: system-ui, sans-serif; margin: 32px; color: #111827; }
          h1 { font-size: 22px; margin: 0 0 16px; }
          dl { display: grid; grid-template-columns: 140px 1fr; gap: 8px 12px; }
          dt { font-weight: 700; color: #475569; }
          dd { margin: 0; }
          .footer { margin-top: 48px; border-top: 1px solid #cbd5e1; padding-top: 16px; }
        </style>
      </head>
      <body>
        <h1>ใบสั่งยา</h1>
        <dl>
          <dt>ผู้ป่วย</dt><dd>${escapeHtml(patientName)}</dd>
          <dt>HN</dt><dd>${escapeHtml(currentPatient?.medical_record_number ?? '')}</dd>
          <dt>ยา</dt><dd>${escapeHtml(prescription.medication_name ?? '')}</dd>
          <dt>ขนาดยา</dt><dd>${escapeHtml(prescription.dosage ?? '')}</dd>
          <dt>ความถี่</dt><dd>${escapeHtml(prescription.frequency ?? '')}</dd>
          <dt>วิธีใช้</dt><dd>${escapeHtml(prescription.instructions ?? '')}</dd>
          <dt>สถานะ</dt><dd>${escapeHtml(prescription.status ?? '')}</dd>
        </dl>
        <div class="footer">ลงชื่อแพทย์ __________________________</div>
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
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
  return `${item.queue_label ?? item.visit_number ?? item.id} · ${name || item.medical_record_number || 'patient'}`;
}

function practitionerSummary(item) {
  const name = [item.first_name, item.last_name].filter(Boolean).join(' ');
  return `${name || item.practitioner_code || item.id}${item.specialty ? ` · ${item.specialty}` : ''}`;
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

function noteSummary(item) {
  return item.title ?? item.note_type ?? item.id;
}

function auditSummary(item) {
  return `${item.action ?? 'audit'} · ${item.entity_type ?? 'entity'}`;
}

const registrationForm = document.querySelector('#registration-form');
const searchForm = document.querySelector('#patient-search-form');
const submitButton = document.querySelector('#submit-button');
const searchButton = document.querySelector('#search-button');
const serviceStatus = document.querySelector('#service-status');
const resultTitle = document.querySelector('#result-title');
const resultList = document.querySelector('#result-list');
const payloadPreview = document.querySelector('#payload-preview');
const patientDetailPanel = document.querySelector('#patient-detail-panel');
const patientDetail = document.querySelector('#patient-detail');
const tabButtons = Array.from(document.querySelectorAll('[data-view]'));
const viewPanels = Array.from(document.querySelectorAll('[data-view-panel]'));

let activeView = 'registration';

const defaults = {
  clinicId: '10000000-0000-0000-0000-000000000101',
  searchClinicId: '10000000-0000-0000-0000-000000000101',
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
    showPatientDetail(patient);
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

  setStatus(activeView === 'search' ? 'พร้อมค้นหา' : 'พร้อมกรอกข้อมูล', '');
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

function setStatus(text, mode) {
  serviceStatus.textContent = text;
  serviceStatus.className = mode ? `status-pill ${mode}` : 'status-pill';
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

function showPatientDetail(patient) {
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
    createMetric('Active Flags', patient.flags?.length ?? 0),
    createMetric('Encounters', patient.encounters?.length ?? 0),
    createMetric('Allergies', patient.allergies?.length ?? 0),
    createMetric('Conditions', patient.conditions?.length ?? 0),
    createMetric('Medications', patient.medications?.length ?? 0),
    createTimeline(patient.encounters ?? [])
  );
}

function syncSearchFields(patient) {
  document.querySelector('#searchClinicId').value = patient.clinic_id ?? readValue('clinicId');
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
  const body = activeView === 'search' ? buildSearchRequest() : buildPatientPayload();
  payloadPreview.textContent = JSON.stringify(body, null, 2);
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

function createTimeline(encounters) {
  const wrapper = document.createElement('div');
  wrapper.className = 'timeline-block';

  const title = document.createElement('h3');
  title.textContent = 'Recent Encounters';
  wrapper.append(title);

  if (encounters.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'muted-text';
    empty.textContent = 'ยังไม่มี encounter';
    wrapper.append(empty);
    return wrapper;
  }

  const list = document.createElement('ol');
  for (const encounter of encounters.slice(0, 3)) {
    const item = document.createElement('li');
    item.textContent = `${encounter.encounter_number ?? encounter.id} · ${encounter.status ?? 'unknown'}`;
    list.append(item);
  }

  wrapper.append(list);
  return wrapper;
}

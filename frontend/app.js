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
let currentPatient = null;
let currentProfile = null;
let currentApiToken = '';
let currentProfileSection = 'Flags';

const createProfileConfigs = {
  Flags: {
    endpoint: '/api/patient-flags',
    submitText: 'เพิ่ม flag',
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
    const profile = await fetchClinicalProfile(patient.id, apiToken);
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

function showPatientDetail(patient, profile = {}) {
  currentPatient = patient;
  currentProfile = profile;

  const encounters = patient.encounters ?? [];
  const derived = buildEncounterDerivedLists(encounters);
  const flags = profile.flags ?? patient.flags ?? [];
  const allergies = profile.allergies ?? [];
  const conditions = profile.conditions ?? [];
  const medications = profile.medications ?? [];

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
    createMetricGrid([
      ['Active Flags', flags.length],
      ['Encounters', encounters.length],
      ['Allergies', allergies.length],
      ['Conditions', conditions.length],
      ['Medications', medications.length],
    ]),
    createProfileTabs({
      Flags: records(flags, flagSummary, ['severity', 'status', 'notes']),
      Allergies: records(allergies, allergySummary, ['severity', 'status', 'reaction']),
      Conditions: records(conditions, conditionSummary, ['status', 'onset_date', 'notes']),
      Medications: records(medications, medicationSummary, ['status', 'dosage', 'frequency']),
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
      Notes: records(derived.clinicalNotes, noteSummary, ['status', 'note_type', 'authored_at']),
    }, currentProfileSection)
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
    list.append(createRecordCard(item, section.summary, section.fields));
  }

  container.append(list);
}

function createProfileForm(sectionLabel, config) {
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
    label.append(input);
    form.append(label);
  }

  const submit = document.createElement('button');
  submit.type = 'submit';
  submit.className = 'primary-button compact-button';
  submit.textContent = config.submitText;
  form.append(submit);

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
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
    currentProfile = await fetchClinicalProfile(currentPatient.id, currentApiToken || readValue('apiToken'));
    currentProfileSection = sectionLabel;
    showPatientDetail(currentPatient, currentProfile);
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

function renderInlineFormError(form, message) {
  form.querySelector('.inline-error')?.remove();
  const error = document.createElement('p');
  error.className = 'inline-error';
  error.textContent = message;
  form.append(error);
}

function records(items, summary, fields) {
  return { items, summary, fields };
}

function createRecordCard(item, summary, fields) {
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
  return card;
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

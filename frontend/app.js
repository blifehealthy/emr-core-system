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

async function fetchPatientProfileBundle(patient, apiToken) {
  const [profile, appointments, practitioners] = await Promise.all([
    fetchClinicalProfile(patient.id, apiToken),
    fetchPatientAppointments(patient, apiToken),
    fetchPractitioners(patient.clinic_id, apiToken),
  ]);

  return { ...profile, appointments, practitioners };
}

async function fetchPractitioners(clinicId, apiToken) {
  const searchParams = new URLSearchParams({ clinicId });
  const response = await fetch(`/api/practitioners?${searchParams.toString()}`, {
    headers: buildHeaders(apiToken),
  });
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.detail || result.error || `HTTP ${response.status}`);
  }

  return result.data ?? [];
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
  const appointments = profile.appointments ?? [];
  const practitioners = profile.practitioners ?? [];

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
    ]),
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

  return card;
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
    actions.append(createAppointmentStatusButton(appointment, 'checked_in', 'เช็กอิน'));
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
    actions.append(
      createAppointmentStatusButton(appointment, 'cancelled', 'ยกเลิก'),
      createAppointmentStatusButton(appointment, 'no_show', 'No-show')
    );
  }

  return actions;
}

function createEncounterActions(encounter) {
  const actions = document.createElement('div');
  actions.className = 'record-actions';

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

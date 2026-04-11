import test from 'node:test';
import assert from 'node:assert/strict';

import {
  getPatientWithEncountersAndSOAP,
  mapPatientWithEncountersAndSOAP,
  type PatientEncounterSOAPRow,
} from './getPatientWithEncountersAndSOAP.ts';

function buildRow(
  overrides: Partial<PatientEncounterSOAPRow> = {}
): PatientEncounterSOAPRow {
  return {
    patient_id: 'patient-1',
    patient_clinic_id: 'clinic-1',
    medical_record_number: 'MRN-001',
    national_id: null,
    first_name: 'Jane',
    middle_name: null,
    last_name: 'Doe',
    preferred_name: null,
    date_of_birth: '1990-01-01',
    sex_at_birth: 'female',
    phone_number: null,
    email: null,
    blood_type: null,
    patient_notes: null,
    patient_created_at: '2026-01-01T00:00:00.000Z',
    patient_updated_at: '2026-01-01T00:00:00.000Z',
    encounter_id: 'encounter-1',
    encounter_number: 'ENC-001',
    encounter_patient_id: 'patient-1',
    encounter_status: 'completed',
    encounter_class: 'outpatient',
    appointment_id: null,
    attending_practitioner_id: null,
    chief_complaint: 'fever',
    triage_summary: null,
    started_at: '2026-01-02T00:00:00.000Z',
    ended_at: null,
    encounter_created_at: '2026-01-02T00:00:00.000Z',
    encounter_updated_at: '2026-01-02T00:00:00.000Z',
    clinical_note_id: 'clinical-note-1',
    clinical_note_encounter_id: 'encounter-1',
    note_type: 'soap',
    clinical_note_status: 'draft',
    title: 'Initial SOAP',
    note_text: 'note',
    authored_by_practitioner_id: null,
    authored_at: '2026-01-02T00:05:00.000Z',
    finalized_at: null,
    signed_at: null,
    amendment_reason: null,
    clinical_note_created_at: '2026-01-02T00:05:00.000Z',
    clinical_note_updated_at: '2026-01-02T00:05:00.000Z',
    soap_note_clinical_note_id: 'clinical-note-1',
    subjective: 'subjective',
    objective: 'objective',
    assessment: 'assessment',
    plan: 'plan',
    soap_note_created_at: '2026-01-02T00:05:00.000Z',
    soap_note_updated_at: '2026-01-02T00:05:00.000Z',
    diagnosis_id: 'diagnosis-1',
    diagnosis_encounter_id: 'encounter-1',
    diagnosis_clinical_note_id: 'clinical-note-1',
    diagnosis_code: 'J11',
    coding_system: 'ICD-10',
    diagnosis_name: 'Influenza',
    diagnosis_type: 'final',
    diagnosis_status: 'active',
    sequence_number: 1,
    diagnosed_at: '2026-01-02T00:06:00.000Z',
    resolution_note: null,
    diagnosis_notes: 'Primary diagnosis',
    diagnosis_created_at: '2026-01-02T00:06:00.000Z',
    diagnosis_updated_at: '2026-01-02T00:06:00.000Z',
    vital_sign_id: 'vital-sign-1',
    vital_sign_encounter_id: 'encounter-1',
    vital_sign_clinical_note_id: 'clinical-note-1',
    measured_at: '2026-01-02T00:03:00.000Z',
    measured_by_practitioner_id: null,
    body_temperature_c: '38.2',
    heart_rate_bpm: 92,
    respiratory_rate_bpm: 18,
    systolic_bp_mmhg: 118,
    diastolic_bp_mmhg: 76,
    oxygen_saturation_pct: '98.00',
    weight_kg: '65.50',
    height_cm: '170.00',
    bmi: '22.70',
    pain_score: 2,
    vital_sign_notes: 'Stable',
    vital_sign_created_at: '2026-01-02T00:03:00.000Z',
    vital_sign_updated_at: '2026-01-02T00:03:00.000Z',
    prescription_id: 'prescription-1',
    prescription_encounter_id: 'encounter-1',
    prescription_clinical_note_id: 'clinical-note-1',
    prescribed_by_practitioner_id: 'practitioner-1',
    medication_name: 'Paracetamol',
    rxnorm_code: '161',
    dosage: '500 mg',
    route: 'oral',
    frequency: 'q6h',
    duration_text: '5 days',
    prescription_instructions: 'after meals',
    prescription_status: 'active',
    prescription_start_date: '2026-01-02',
    prescription_end_date: '2026-01-07',
    prescription_created_at: '2026-01-02T00:08:00.000Z',
    prescription_updated_at: '2026-01-02T00:08:00.000Z',
    ...overrides,
  };
}

test('mapPatientWithEncountersAndSOAP returns null for no rows', () => {
  assert.equal(mapPatientWithEncountersAndSOAP([]), null);
});

test('mapPatientWithEncountersAndSOAP keeps patient with no encounters', () => {
  const patient = mapPatientWithEncountersAndSOAP([
    buildRow({
      encounter_id: null,
      encounter_number: null,
      encounter_patient_id: null,
      encounter_status: null,
      encounter_class: null,
      encounter_created_at: null,
      encounter_updated_at: null,
      clinical_note_id: null,
      clinical_note_encounter_id: null,
      note_type: null,
      clinical_note_status: null,
      clinical_note_created_at: null,
      clinical_note_updated_at: null,
      soap_note_clinical_note_id: null,
      subjective: null,
      objective: null,
      assessment: null,
      plan: null,
      soap_note_created_at: null,
      soap_note_updated_at: null,
      diagnosis_id: null,
      diagnosis_encounter_id: null,
      diagnosis_clinical_note_id: null,
      diagnosis_code: null,
      coding_system: null,
      diagnosis_name: null,
      diagnosis_type: null,
      diagnosis_status: null,
      sequence_number: null,
      diagnosed_at: null,
      resolution_note: null,
      diagnosis_notes: null,
      diagnosis_created_at: null,
      diagnosis_updated_at: null,
      vital_sign_id: null,
      vital_sign_encounter_id: null,
      vital_sign_clinical_note_id: null,
      measured_at: null,
      measured_by_practitioner_id: null,
      body_temperature_c: null,
      heart_rate_bpm: null,
      respiratory_rate_bpm: null,
      systolic_bp_mmhg: null,
      diastolic_bp_mmhg: null,
      oxygen_saturation_pct: null,
      weight_kg: null,
      height_cm: null,
      bmi: null,
      pain_score: null,
      vital_sign_notes: null,
      vital_sign_created_at: null,
      vital_sign_updated_at: null,
      prescription_id: null,
      prescription_encounter_id: null,
      prescription_clinical_note_id: null,
      prescribed_by_practitioner_id: null,
      medication_name: null,
      rxnorm_code: null,
      dosage: null,
      route: null,
      frequency: null,
      duration_text: null,
      prescription_instructions: null,
      prescription_status: null,
      prescription_start_date: null,
      prescription_end_date: null,
      prescription_created_at: null,
      prescription_updated_at: null,
    }),
  ]);

  assert.ok(patient);
  assert.equal(patient.encounters.length, 0);
});

test('mapPatientWithEncountersAndSOAP groups multiple notes under one encounter', () => {
  const patient = mapPatientWithEncountersAndSOAP([
    buildRow(),
    buildRow({
      clinical_note_id: 'clinical-note-2',
      title: 'Follow up',
      soap_note_clinical_note_id: null,
      subjective: null,
      objective: null,
      assessment: null,
      plan: null,
      soap_note_created_at: null,
      soap_note_updated_at: null,
    }),
  ]);

  assert.ok(patient);
  assert.equal(patient.encounters.length, 1);
  assert.equal(patient.encounters[0].clinical_notes.length, 2);
  assert.equal(patient.encounters[0].diagnoses.length, 1);
  assert.equal(patient.encounters[0].vital_signs.length, 1);
  assert.equal(patient.encounters[0].prescriptions.length, 1);
  assert.equal(patient.encounters[0].clinical_notes[0].soap_note?.clinical_note_id, 'clinical-note-1');
  assert.equal(patient.encounters[0].clinical_notes[1].soap_note, null);
});

test('mapPatientWithEncountersAndSOAP de-duplicates diagnoses, vital signs, and prescriptions across joined rows', () => {
  const patient = mapPatientWithEncountersAndSOAP([
    buildRow(),
    buildRow({
      clinical_note_id: 'clinical-note-2',
      title: 'Triage update',
      soap_note_clinical_note_id: null,
      subjective: null,
      objective: null,
      assessment: null,
      plan: null,
      soap_note_created_at: null,
      soap_note_updated_at: null,
      vital_sign_id: 'vital-sign-2',
      measured_at: '2026-01-02T00:10:00.000Z',
      body_temperature_c: '37.8',
      heart_rate_bpm: 88,
      respiratory_rate_bpm: 16,
      systolic_bp_mmhg: 120,
      diastolic_bp_mmhg: 80,
      oxygen_saturation_pct: '99.00',
      weight_kg: '65.50',
      height_cm: '170.00',
      bmi: '22.70',
      pain_score: 1,
      vital_sign_notes: 'Improving',
      vital_sign_created_at: '2026-01-02T00:10:00.000Z',
      vital_sign_updated_at: '2026-01-02T00:10:00.000Z',
      prescription_id: 'prescription-2',
      medication_name: 'Ibuprofen',
      dosage: '200 mg',
      route: 'oral',
      frequency: 'bid',
      duration_text: '3 days',
      prescription_instructions: 'with food',
      prescription_created_at: '2026-01-02T00:11:00.000Z',
      prescription_updated_at: '2026-01-02T00:11:00.000Z',
    }),
    buildRow({
      diagnosis_id: 'diagnosis-2',
      diagnosis_clinical_note_id: null,
      diagnosis_code: 'R50.9',
      diagnosis_name: 'Fever',
      diagnosis_type: 'working',
      diagnosis_status: 'active',
      sequence_number: 2,
      diagnosed_at: '2026-01-02T00:07:00.000Z',
      diagnosis_notes: 'Secondary diagnosis',
      diagnosis_created_at: '2026-01-02T00:07:00.000Z',
      diagnosis_updated_at: '2026-01-02T00:07:00.000Z',
      prescription_id: 'prescription-2',
      medication_name: 'Ibuprofen',
      dosage: '200 mg',
      route: 'oral',
      frequency: 'bid',
      duration_text: '3 days',
      prescription_instructions: 'with food',
      prescription_created_at: '2026-01-02T00:11:00.000Z',
      prescription_updated_at: '2026-01-02T00:11:00.000Z',
    }),
  ]);

  assert.ok(patient);
  assert.equal(patient.encounters.length, 1);
  assert.equal(patient.encounters[0].clinical_notes.length, 2);
  assert.equal(patient.encounters[0].diagnoses.length, 2);
  assert.equal(patient.encounters[0].vital_signs.length, 2);
  assert.equal(patient.encounters[0].prescriptions.length, 2);
  assert.equal(patient.encounters[0].diagnoses[0].id, 'diagnosis-1');
  assert.equal(patient.encounters[0].diagnoses[1].id, 'diagnosis-2');
  assert.equal(patient.encounters[0].vital_signs[1].id, 'vital-sign-2');
  assert.equal(patient.encounters[0].prescriptions[1].id, 'prescription-2');
});

test('getPatientWithEncountersAndSOAP executes the SQL query with expected params', async () => {
  const calls: Array<{ sql: string; params?: unknown[] }> = [];
  const repo = getPatientWithEncountersAndSOAP({
    async query<T>(sql: string, params?: unknown[]) {
      calls.push({ sql, params });
      return { rows: [buildRow()] as T[] };
    },
  });

  const patient = await repo({
    clinicId: 'clinic-1',
    medicalRecordNumber: 'MRN-001',
  });

  assert.ok(patient);
  assert.equal(calls.length, 1);
  assert.match(calls[0].sql, /FROM patients p/);
  assert.deepEqual(calls[0].params, ['clinic-1', 'MRN-001']);
});

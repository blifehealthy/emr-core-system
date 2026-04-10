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
  assert.equal(patient.encounters[0].clinical_notes[0].soap_note?.clinical_note_id, 'clinical-note-1');
  assert.equal(patient.encounters[0].clinical_notes[1].soap_note, null);
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

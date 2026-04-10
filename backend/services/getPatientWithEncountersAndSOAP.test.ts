import test from 'node:test';
import assert from 'node:assert/strict';

import { createGetPatientWithEncountersAndSOAPService } from './getPatientWithEncountersAndSOAP.ts';

test('createGetPatientWithEncountersAndSOAPService delegates to the repository query flow', async () => {
  const calls: Array<{ sql: string; params?: unknown[] }> = [];
  const service = createGetPatientWithEncountersAndSOAPService({
    async query<T>(sql: string, params?: unknown[]) {
      calls.push({ sql, params });

      return {
        rows: [
          {
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
            encounter_id: null,
            encounter_number: null,
            encounter_patient_id: null,
            encounter_status: null,
            encounter_class: null,
            appointment_id: null,
            attending_practitioner_id: null,
            chief_complaint: null,
            triage_summary: null,
            started_at: null,
            ended_at: null,
            encounter_created_at: null,
            encounter_updated_at: null,
            clinical_note_id: null,
            clinical_note_encounter_id: null,
            note_type: null,
            clinical_note_status: null,
            title: null,
            note_text: null,
            authored_by_practitioner_id: null,
            authored_at: null,
            finalized_at: null,
            signed_at: null,
            amendment_reason: null,
            clinical_note_created_at: null,
            clinical_note_updated_at: null,
            soap_note_clinical_note_id: null,
            subjective: null,
            objective: null,
            assessment: null,
            plan: null,
            soap_note_created_at: null,
            soap_note_updated_at: null,
          },
        ] as T[],
      };
    },
  });

  const result = await service({
    clinicId: 'clinic-1',
    medicalRecordNumber: 'MRN-001',
  });

  assert.ok(result);
  assert.equal(result.id, 'patient-1');
  assert.equal(result.encounters.length, 0);
  assert.equal(calls.length, 1);
  assert.match(calls[0].sql, /FROM patients p/);
  assert.deepEqual(calls[0].params, ['clinic-1', 'MRN-001']);
});

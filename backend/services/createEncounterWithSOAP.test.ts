import test from 'node:test';
import assert from 'node:assert/strict';

import { createEncounterWithSOAP } from './createEncounterWithSOAP.ts';

test('createEncounterWithSOAP commits after inserting encounter, clinical note, and soap note', async () => {
  const calls: Array<{ sql: string; params?: unknown[] }> = [];
  const responses = [
    {
      rows: [
        {
          id: 'encounter-1',
          patient_id: 'patient-1',
          encounter_number: 'ENC-001',
          status: 'draft',
          encounter_class: 'outpatient',
          appointment_id: null,
          attending_practitioner_id: null,
          chief_complaint: null,
          triage_summary: null,
          started_at: null,
          ended_at: null,
          created_at: '2026-01-01T00:00:00.000Z',
          updated_at: '2026-01-01T00:00:00.000Z',
        },
      ],
    },
    {
      rows: [
        {
          id: 'clinical-note-1',
          encounter_id: 'encounter-1',
          note_type: 'soap',
          status: 'draft',
          title: 'Initial SOAP',
          note_text: null,
          authored_by_practitioner_id: null,
          authored_at: '2026-01-01T00:00:00.000Z',
          finalized_at: null,
          signed_at: null,
          amendment_reason: null,
          created_at: '2026-01-01T00:00:00.000Z',
          updated_at: '2026-01-01T00:00:00.000Z',
        },
      ],
    },
    {
      rows: [
        {
          clinical_note_id: 'clinical-note-1',
          subjective: 'subjective',
          objective: null,
          assessment: null,
          plan: 'plan',
          created_at: '2026-01-01T00:00:00.000Z',
          updated_at: '2026-01-01T00:00:00.000Z',
        },
      ],
    },
    {
      rows: [
        {
          id: 'diagnosis-1',
          encounter_id: 'encounter-1',
          clinical_note_id: 'clinical-note-1',
          diagnosis_code: 'J11',
          coding_system: 'ICD-10',
          diagnosis_name: 'Influenza',
          diagnosis_type: 'final',
          status: 'active',
          sequence_number: 1,
          diagnosed_at: '2026-01-01T00:01:00.000Z',
          resolution_note: null,
          notes: 'Primary diagnosis',
          created_at: '2026-01-01T00:01:00.000Z',
          updated_at: '2026-01-01T00:01:00.000Z',
        },
      ],
    },
    {
      rows: [
        {
          id: 'vital-sign-1',
          encounter_id: 'encounter-1',
          clinical_note_id: 'clinical-note-1',
          measured_at: '2026-01-01T00:02:00.000Z',
          measured_by_practitioner_id: null,
          body_temperature_c: '38.2',
          heart_rate_bpm: 92,
          respiratory_rate_bpm: 18,
          systolic_bp_mmhg: 118,
          diastolic_bp_mmhg: 76,
          oxygen_saturation_pct: '98.00',
          weight_kg: null,
          height_cm: null,
          bmi: null,
          pain_score: 2,
          notes: 'Stable',
          created_at: '2026-01-01T00:02:00.000Z',
          updated_at: '2026-01-01T00:02:00.000Z',
        },
      ],
    },
  ];

  const service = createEncounterWithSOAP({
    async query<T>(sql: string, params?: unknown[]) {
      calls.push({ sql, params });

      if (sql === 'BEGIN' || sql === 'COMMIT' || sql === 'ROLLBACK') {
        return { rows: [] as T[] };
      }

      const response = responses.shift();

      if (!response) {
        throw new Error(`Unexpected query: ${sql}`);
      }

      return response as { rows: T[] };
    },
  });

  const result = await service({
    patientId: 'patient-1',
    encounterNumber: 'ENC-001',
    subjective: 'subjective',
    plan: 'plan',
    diagnoses: [
      {
        diagnosisCode: 'J11',
        codingSystem: 'ICD-10',
        diagnosisName: 'Influenza',
        diagnosisType: 'final',
        sequenceNumber: 1,
        notes: 'Primary diagnosis',
      },
    ],
    vitalSigns: [
      {
        bodyTemperatureC: 38.2,
        heartRateBpm: 92,
        respiratoryRateBpm: 18,
        systolicBpMmhg: 118,
        diastolicBpMmhg: 76,
        oxygenSaturationPct: 98,
        painScore: 2,
        notes: 'Stable',
      },
    ],
  });

  assert.equal(calls[0].sql, 'BEGIN');
  assert.match(calls[1].sql, /INSERT INTO encounters/);
  assert.match(calls[2].sql, /INSERT INTO clinical_notes/);
  assert.match(calls[3].sql, /INSERT INTO soap_notes/);
  assert.match(calls[4].sql, /INSERT INTO diagnoses/);
  assert.match(calls[5].sql, /INSERT INTO vital_signs/);
  assert.equal(calls[6].sql, 'COMMIT');
  assert.equal(result.encounter.id, 'encounter-1');
  assert.equal(result.clinical_note.id, 'clinical-note-1');
  assert.equal(result.soap_note.clinical_note_id, 'clinical-note-1');
  assert.equal(result.diagnoses[0].id, 'diagnosis-1');
  assert.equal(result.vital_signs[0].id, 'vital-sign-1');
});

test('createEncounterWithSOAP rolls back when soap note insert fails', async () => {
  const calls: string[] = [];
  const service = createEncounterWithSOAP({
    async query<T>(sql: string) {
      calls.push(sql);

      if (sql === 'BEGIN' || sql === 'ROLLBACK') {
        return { rows: [] as T[] };
      }

      if (sql.includes('INSERT INTO encounters')) {
        return {
          rows: [
            {
              id: 'encounter-1',
            },
          ] as T[],
        };
      }

      if (sql.includes('INSERT INTO clinical_notes')) {
        return {
          rows: [
            {
              id: 'clinical-note-1',
            },
          ] as T[],
        };
      }

      if (sql.includes('INSERT INTO soap_notes')) {
        throw new Error('soap note content check failed');
      }

      throw new Error(`Unexpected query: ${sql}`);
    },
  });

  await assert.rejects(
    service({
      patientId: 'patient-1',
      encounterNumber: 'ENC-001',
    }),
    /soap note content check failed/
  );

  assert.equal(calls[0], 'BEGIN');
  assert.match(calls[1], /INSERT INTO encounters/);
  assert.match(calls[2], /INSERT INTO clinical_notes/);
  assert.match(calls[3], /INSERT INTO soap_notes/);
  assert.equal(calls[4], 'ROLLBACK');
});

test('createEncounterWithSOAP rolls back when diagnosis insert fails', async () => {
  const calls: string[] = [];
  const service = createEncounterWithSOAP({
    async query<T>(sql: string) {
      calls.push(sql);

      if (sql === 'BEGIN' || sql === 'ROLLBACK') {
        return { rows: [] as T[] };
      }

      if (sql.includes('INSERT INTO encounters')) {
        return {
          rows: [
            {
              id: 'encounter-1',
            },
          ] as T[],
        };
      }

      if (sql.includes('INSERT INTO clinical_notes')) {
        return {
          rows: [
            {
              id: 'clinical-note-1',
            },
          ] as T[],
        };
      }

      if (sql.includes('INSERT INTO soap_notes')) {
        return {
          rows: [
            {
              clinical_note_id: 'clinical-note-1',
            },
          ] as T[],
        };
      }

      if (sql.includes('INSERT INTO diagnoses')) {
        throw new Error('diagnosis coding pair check failed');
      }

      throw new Error(`Unexpected query: ${sql}`);
    },
  });

  await assert.rejects(
    service({
      patientId: 'patient-1',
      encounterNumber: 'ENC-001',
      subjective: 'subjective',
      diagnoses: [
        {
          diagnosisCode: 'J11',
          diagnosisName: 'Influenza',
        },
      ],
    }),
    /diagnosis coding pair check failed/
  );

  assert.equal(calls[0], 'BEGIN');
  assert.match(calls[1], /INSERT INTO encounters/);
  assert.match(calls[2], /INSERT INTO clinical_notes/);
  assert.match(calls[3], /INSERT INTO soap_notes/);
  assert.match(calls[4], /INSERT INTO diagnoses/);
  assert.equal(calls[5], 'ROLLBACK');
});

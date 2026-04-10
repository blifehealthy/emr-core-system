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
  });

  assert.equal(calls[0].sql, 'BEGIN');
  assert.match(calls[1].sql, /INSERT INTO encounters/);
  assert.match(calls[2].sql, /INSERT INTO clinical_notes/);
  assert.match(calls[3].sql, /INSERT INTO soap_notes/);
  assert.equal(calls[4].sql, 'COMMIT');
  assert.equal(result.encounter.id, 'encounter-1');
  assert.equal(result.clinical_note.id, 'clinical-note-1');
  assert.equal(result.soap_note.clinical_note_id, 'clinical-note-1');
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

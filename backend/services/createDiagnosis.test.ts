import test from 'node:test';
import assert from 'node:assert/strict';

import { createDiagnosis } from './createDiagnosis.ts';

test('createDiagnosis inserts a diagnosis with expected params and defaults', async () => {
  const calls: Array<{ sql: string; params?: unknown[] }> = [];
  const service = createDiagnosis({
    async query<T>(sql: string, params?: unknown[]) {
      calls.push({ sql, params });
      return {
        rows: [{ id: 'diagnosis-1', diagnosis_name: 'Influenza', status: 'active' }] as T[],
      };
    },
  });

  const result = await service({
    encounterId: 'encounter-1',
    clinicalNoteId: 'clinical-note-1',
    diagnosisName: 'Influenza',
    diagnosisCode: 'J11',
    codingSystem: 'ICD-10',
    sequenceNumber: 1,
  });

  assert.match(calls[0].sql, /INSERT INTO diagnoses/);
  assert.deepEqual(calls[0].params, [
    'encounter-1',
    'clinical-note-1',
    'J11',
    'ICD-10',
    'Influenza',
    'working',
    'active',
    1,
    null,
    null,
    null,
  ]);
  assert.equal((result as { id: string }).id, 'diagnosis-1');
});

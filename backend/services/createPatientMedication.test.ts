import test from 'node:test';
import assert from 'node:assert/strict';

import { createPatientMedication } from './createPatientMedication.ts';

test('createPatientMedication inserts a new medication row', async () => {
  const calls: Array<{ sql: string; params?: unknown[] }> = [];
  const service = createPatientMedication({
    async query<T>(sql: string, params?: unknown[]) {
      calls.push({ sql, params });
      return { rows: [{ id: 'medication-1', medication_name: 'Metformin' }] as T[] };
    },
  });

  const result = await service({
    patientId: 'patient-1',
    medicationName: 'Metformin',
    status: 'active',
  });

  assert.match(calls[0].sql, /INSERT INTO patient_medications/);
  assert.deepEqual(calls[0].params, [
    'patient-1',
    null,
    'Metformin',
    null,
    null,
    null,
    null,
    null,
    'active',
    null,
    null,
    null,
  ]);
  assert.equal((result as { id: string }).id, 'medication-1');
});

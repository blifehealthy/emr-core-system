import test from 'node:test';
import assert from 'node:assert/strict';

import { updatePatientMedication } from './updatePatientMedication.ts';

test('updatePatientMedication updates provided medication fields', async () => {
  const calls: Array<{ sql: string; params?: unknown[] }> = [];
  const service = updatePatientMedication({
    async query<T>(sql: string, params?: unknown[]) {
      calls.push({ sql, params });
      return { rows: [{ id: 'medication-1', status: 'completed' }] as T[] };
    },
  });

  const result = await service({
    medicationId: 'medication-1',
    status: 'completed',
    endDate: '2026-04-11',
  });

  assert.match(calls[0].sql, /UPDATE patient_medications/);
  assert.deepEqual(calls[0].params, ['medication-1', 'completed', '2026-04-11']);
  assert.equal((result as { id: string }).id, 'medication-1');
});

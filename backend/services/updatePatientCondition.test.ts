import test from 'node:test';
import assert from 'node:assert/strict';

import { updatePatientCondition } from './updatePatientCondition.ts';

test('updatePatientCondition patches mutable condition fields', async () => {
  const calls: Array<{ sql: string; params?: unknown[] }> = [];
  const service = updatePatientCondition({
    async query<T>(sql: string, params?: unknown[]) {
      calls.push({ sql, params });
      return { rows: [{ id: 'condition-1', clinical_status: 'resolved' }] as T[] };
    },
  });

  const result = await service({
    conditionId: 'condition-1',
    clinicalStatus: 'resolved',
    notes: 'Symptoms resolved',
  });

  assert.match(calls[0].sql, /UPDATE patient_conditions/);
  assert.deepEqual(calls[0].params, ['condition-1', 'resolved', 'Symptoms resolved']);
  assert.equal((result as { id: string }).id, 'condition-1');
});

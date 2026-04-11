import test from 'node:test';
import assert from 'node:assert/strict';

import { createPatientCondition } from './createPatientCondition.ts';

test('createPatientCondition inserts a new condition row', async () => {
  const calls: Array<{ sql: string; params?: unknown[] }> = [];
  const service = createPatientCondition({
    async query<T>(sql: string, params?: unknown[]) {
      calls.push({ sql, params });
      return { rows: [{ id: 'condition-1', condition_name: 'Asthma' }] as T[] };
    },
  });

  const result = await service({
    patientId: 'patient-1',
    conditionName: 'Asthma',
    clinicalStatus: 'active',
  });

  assert.match(calls[0].sql, /INSERT INTO patient_conditions/);
  assert.deepEqual(calls[0].params, [
    'patient-1',
    null,
    null,
    'Asthma',
    'active',
    null,
    null,
    null,
  ]);
  assert.equal((result as { id: string }).id, 'condition-1');
});

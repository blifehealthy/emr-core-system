import test from 'node:test';
import assert from 'node:assert/strict';

import { listPatientConditions } from './listPatientConditions.ts';

test('listPatientConditions reads active conditions with optional clinical status filter', async () => {
  const calls: Array<{ sql: string; params?: unknown[] }> = [];
  const service = listPatientConditions({
    async query<T>(sql: string, params?: unknown[]) {
      calls.push({ sql, params });
      return { rows: [{ id: 'condition-1' }] as T[] };
    },
  });

  const result = await service({ patientId: 'patient-1', clinicalStatus: 'active' });

  assert.match(calls[0].sql, /FROM patient_conditions/);
  assert.deepEqual(calls[0].params, ['patient-1', 'active']);
  assert.equal((result[0] as { id: string }).id, 'condition-1');
});

import test from 'node:test';
import assert from 'node:assert/strict';

import { updatePatientAllergy } from './updatePatientAllergy.ts';

test('updatePatientAllergy patches mutable allergy fields', async () => {
  const calls: Array<{ sql: string; params?: unknown[] }> = [];
  const service = updatePatientAllergy({
    async query<T>(sql: string, params?: unknown[]) {
      calls.push({ sql, params });
      return { rows: [{ id: 'allergy-1', status: 'inactive' }] as T[] };
    },
  });

  const result = await service({
    allergyId: 'allergy-1',
    status: 'inactive',
    notes: 'No recent exposure',
  });

  assert.match(calls[0].sql, /UPDATE patient_allergies/);
  assert.deepEqual(calls[0].params, ['allergy-1', 'inactive', 'No recent exposure']);
  assert.equal((result as { id: string }).id, 'allergy-1');
});

import test from 'node:test';
import assert from 'node:assert/strict';

import { getPatientConditionById } from './getPatientConditionById.ts';

test('getPatientConditionById reads an active condition by id', async () => {
  const calls: Array<{ sql: string; params?: unknown[] }> = [];
  const service = getPatientConditionById({
    async query<T>(sql: string, params?: unknown[]) {
      calls.push({ sql, params });
      return { rows: [{ id: 'condition-1', condition_name: 'Asthma' }] as T[] };
    },
  });

  const result = await service({ conditionId: 'condition-1' });

  assert.match(calls[0].sql, /FROM patient_conditions/);
  assert.deepEqual(calls[0].params, ['condition-1']);
  assert.equal((result as { id: string }).id, 'condition-1');
});

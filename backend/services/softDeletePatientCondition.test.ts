import test from 'node:test';
import assert from 'node:assert/strict';

import { softDeletePatientCondition } from './softDeletePatientCondition.ts';

test('softDeletePatientCondition marks a condition deleted by id', async () => {
  const calls: Array<{ sql: string; params?: unknown[] }> = [];
  const service = softDeletePatientCondition({
    async query<T>(sql: string, params?: unknown[]) {
      calls.push({ sql, params });
      return { rows: [{ id: 'condition-1', deleted_at: '2026-01-01T00:00:00.000Z' }] as T[] };
    },
  });

  const result = await service({ conditionId: 'condition-1' });

  assert.match(calls[0].sql, /UPDATE patient_conditions/);
  assert.match(calls[0].sql, /SET deleted_at = COALESCE\(deleted_at, NOW\(\)\)/);
  assert.deepEqual(calls[0].params, ['condition-1']);
  assert.equal((result as { id: string }).id, 'condition-1');
});

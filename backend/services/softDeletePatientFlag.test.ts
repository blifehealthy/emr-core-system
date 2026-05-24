import test from 'node:test';
import assert from 'node:assert/strict';

import { softDeletePatientFlag } from './softDeletePatientFlag.ts';

test('softDeletePatientFlag marks a flag as deleted', async () => {
  const calls: Array<{ sql: string; params?: unknown[] }> = [];
  const service = softDeletePatientFlag({
    async query<T>(sql: string, params?: unknown[]) {
      calls.push({ sql, params });
      return { rows: [{ id: 'flag-1', deleted_at: '2026-01-01T00:00:00.000Z' }] as T[] };
    },
  });

  const result = await service({ flagId: 'flag-1' });

  assert.match(calls[0].sql, /UPDATE patient_flags/);
  assert.match(calls[0].sql, /deleted_at = COALESCE\(deleted_at, NOW\(\)\)/);
  assert.deepEqual(calls[0].params, ['flag-1']);
  assert.equal((result as { id: string }).id, 'flag-1');
});

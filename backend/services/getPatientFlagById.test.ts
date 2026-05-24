import test from 'node:test';
import assert from 'node:assert/strict';

import { getPatientFlagById } from './getPatientFlagById.ts';

test('getPatientFlagById reads an active flag by id', async () => {
  const calls: Array<{ sql: string; params?: unknown[] }> = [];
  const service = getPatientFlagById({
    async query<T>(sql: string, params?: unknown[]) {
      calls.push({ sql, params });
      return { rows: [{ id: 'flag-1' }] as T[] };
    },
  });

  const result = await service({ flagId: 'flag-1' });

  assert.match(calls[0].sql, /FROM patient_flags/);
  assert.match(calls[0].sql, /deleted_at IS NULL/);
  assert.deepEqual(calls[0].params, ['flag-1']);
  assert.equal((result as { id: string }).id, 'flag-1');
});

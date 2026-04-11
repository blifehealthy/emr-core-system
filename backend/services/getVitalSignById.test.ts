import test from 'node:test';
import assert from 'node:assert/strict';

import { getVitalSignById } from './getVitalSignById.ts';

test('getVitalSignById reads an active vital sign by id', async () => {
  const calls: Array<{ sql: string; params?: unknown[] }> = [];
  const service = getVitalSignById({
    async query<T>(sql: string, params?: unknown[]) {
      calls.push({ sql, params });
      return {
        rows: [{ id: 'vital-sign-1', heart_rate_bpm: 72 }] as T[],
      };
    },
  });

  const result = await service({ vitalSignId: 'vital-sign-1' });

  assert.match(calls[0].sql, /SELECT/);
  assert.match(calls[0].sql, /FROM vital_signs/);
  assert.deepEqual(calls[0].params, ['vital-sign-1']);
  assert.equal((result as { id: string }).id, 'vital-sign-1');
});

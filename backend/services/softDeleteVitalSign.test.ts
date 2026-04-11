import test from 'node:test';
import assert from 'node:assert/strict';

import { softDeleteVitalSign } from './softDeleteVitalSign.ts';

test('softDeleteVitalSign marks a vital sign deleted by id', async () => {
  const calls: Array<{ sql: string; params?: unknown[] }> = [];
  const service = softDeleteVitalSign({
    async query<T>(sql: string, params?: unknown[]) {
      calls.push({ sql, params });
      return {
        rows: [{ id: 'vital-sign-1', deleted_at: '2026-01-01T00:00:00.000Z' }] as T[],
      };
    },
  });

  const result = await service({ vitalSignId: 'vital-sign-1' });

  assert.match(calls[0].sql, /UPDATE vital_signs/);
  assert.match(calls[0].sql, /SET deleted_at = COALESCE\(deleted_at, NOW\(\)\)/);
  assert.deepEqual(calls[0].params, ['vital-sign-1']);
  assert.equal((result as { id: string }).id, 'vital-sign-1');
});

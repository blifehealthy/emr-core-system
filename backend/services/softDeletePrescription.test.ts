import test from 'node:test';
import assert from 'node:assert/strict';

import { softDeletePrescription } from './softDeletePrescription.ts';

test('softDeletePrescription marks a prescription deleted by id', async () => {
  const calls: Array<{ sql: string; params?: unknown[] }> = [];
  const service = softDeletePrescription({
    async query<T>(sql: string, params?: unknown[]) {
      calls.push({ sql, params });
      return {
        rows: [{ id: 'prescription-1', deleted_at: '2026-01-01T00:00:00.000Z' }] as T[],
      };
    },
  });

  const result = await service({ prescriptionId: 'prescription-1' });

  assert.match(calls[0].sql, /UPDATE prescriptions/);
  assert.match(calls[0].sql, /SET deleted_at = COALESCE\(deleted_at, NOW\(\)\)/);
  assert.deepEqual(calls[0].params, ['prescription-1']);
  assert.equal((result as { id: string }).id, 'prescription-1');
});

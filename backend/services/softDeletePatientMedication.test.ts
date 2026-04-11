import test from 'node:test';
import assert from 'node:assert/strict';

import { softDeletePatientMedication } from './softDeletePatientMedication.ts';

test('softDeletePatientMedication marks a medication deleted by id', async () => {
  const calls: Array<{ sql: string; params?: unknown[] }> = [];
  const service = softDeletePatientMedication({
    async query<T>(sql: string, params?: unknown[]) {
      calls.push({ sql, params });
      return { rows: [{ id: 'medication-1', deleted_at: '2026-01-01T00:00:00.000Z' }] as T[] };
    },
  });

  const result = await service({ medicationId: 'medication-1' });

  assert.match(calls[0].sql, /UPDATE patient_medications/);
  assert.match(calls[0].sql, /SET deleted_at = COALESCE\(deleted_at, NOW\(\)\)/);
  assert.deepEqual(calls[0].params, ['medication-1']);
  assert.equal((result as { id: string }).id, 'medication-1');
});

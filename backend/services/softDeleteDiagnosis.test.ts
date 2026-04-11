import test from 'node:test';
import assert from 'node:assert/strict';

import { softDeleteDiagnosis } from './softDeleteDiagnosis.ts';

test('softDeleteDiagnosis marks a diagnosis deleted by id', async () => {
  const calls: Array<{ sql: string; params?: unknown[] }> = [];
  const service = softDeleteDiagnosis({
    async query<T>(sql: string, params?: unknown[]) {
      calls.push({ sql, params });
      return {
        rows: [{ id: 'diagnosis-1', deleted_at: '2026-01-01T00:00:00.000Z' }] as T[],
      };
    },
  });

  const result = await service({ diagnosisId: 'diagnosis-1' });

  assert.match(calls[0].sql, /UPDATE diagnoses/);
  assert.match(calls[0].sql, /SET deleted_at = COALESCE\(deleted_at, NOW\(\)\)/);
  assert.deepEqual(calls[0].params, ['diagnosis-1']);
  assert.equal((result as { id: string }).id, 'diagnosis-1');
});

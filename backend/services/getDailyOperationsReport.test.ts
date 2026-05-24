import test from 'node:test';
import assert from 'node:assert/strict';
import { getDailyOperationsReport } from './getDailyOperationsReport.ts';

test('getDailyOperationsReport builds daily clinic operations aggregate', async () => {
  const calls: Array<{ sql: string; params?: unknown[] }> = [];
  const service = getDailyOperationsReport({
    async query<T>(sql: string, params?: unknown[]) {
      calls.push({ sql, params });
      return { rows: [{ report: { visits_total: 3 } }] as T[] };
    },
  });

  const result = await service({ clinicId: 'clinic-1', date: '2026-05-24' });

  assert.match(calls[0].sql, /WITH visit_rows AS/);
  assert.match(calls[0].sql, /top_diagnoses/);
  assert.deepEqual(calls[0].params, ['clinic-1', '2026-05-24']);
  assert.deepEqual(result, { visits_total: 3 });
});

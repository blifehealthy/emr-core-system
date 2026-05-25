import test from 'node:test';
import assert from 'node:assert/strict';

import { getBillingSummaryReport } from './getBillingSummaryReport.ts';

test('getBillingSummaryReport builds accounting aggregate report', async () => {
  const calls: Array<{ sql: string; params?: unknown[] }> = [];
  const service = getBillingSummaryReport({
    async query<T>(sql: string, params?: unknown[]) {
      calls.push({ sql, params });
      return { rows: [{ report: { invoice_count: 2, paid_total: '500.00' } }] as T[] };
    },
  });

  const result = await service({ clinicId: 'clinic-1', startDate: '2026-05-01', endDate: '2026-05-31' });

  assert.match(calls[0].sql, /WITH invoice_rows AS/);
  assert.match(calls[0].sql, /by_payment_method/);
  assert.match(calls[0].sql, /claim_rows/);
  assert.deepEqual(calls[0].params, ['clinic-1', '2026-05-01', '2026-05-31']);
  assert.deepEqual(result, { invoice_count: 2, paid_total: '500.00' });
});

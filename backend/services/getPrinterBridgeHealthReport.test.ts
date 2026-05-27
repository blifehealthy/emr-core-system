import test from 'node:test';
import assert from 'node:assert/strict';

import { getPrinterBridgeHealthReport } from './getPrinterBridgeHealthReport.ts';

test('getPrinterBridgeHealthReport builds printer queue health aggregate', async () => {
  const calls: Array<{ sql: string; params?: unknown[] }> = [];
  const service = getPrinterBridgeHealthReport({
    async query<T = unknown>(sql: string, params?: unknown[]) {
      calls.push({ sql, params });
      return {
        rows: [
          {
            report: {
              start_date: params?.[1],
              end_date: params?.[2],
              print_job_total: 4,
              failed_total: 1,
              fallback_total: 2,
              retry_queued_total: 1,
              recent_problem_jobs: [{ id: 'job-1', delivery_status: 'failed' }],
            },
          },
        ] as T[],
      };
    },
  });

  const report = await service({
    clinicId: 'clinic-1',
    startDate: '2026-05-27',
    endDate: '2026-05-27',
  });

  assert.equal((report as { print_job_total: number }).print_job_total, 4);
  assert.equal((report as { failed_total: number }).failed_total, 1);
  assert.deepEqual(calls[0].params, ['clinic-1', '2026-05-27', '2026-05-27']);
  assert.match(calls[0].sql, /inventory_barcode_print_jobs/);
  assert.match(calls[0].sql, /recent_problem_jobs/);
  assert.match(calls[0].sql, /by_printer_profile/);
});

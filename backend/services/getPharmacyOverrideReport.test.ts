import test from 'node:test';
import assert from 'node:assert/strict';

import { getPharmacyOverrideReport } from './getPharmacyOverrideReport.ts';

test('getPharmacyOverrideReport aggregates dispense and transfer override rows', async () => {
  const db = {
    async query<T = unknown>(sql: string, params?: unknown[]) {
      assert.match(sql, /medication_dispenses/);
      assert.match(sql, /inventory_transfers/);
      assert.match(sql, /expiry_override_reason/);
      assert.match(sql, /fefo_override_reason/);
      assert.deepEqual(params, ['clinic-1', '2026-05-01', '2026-05-31']);
      return {
        rows: [
          {
            report: {
              start_date: '2026-05-01',
              end_date: '2026-05-31',
              override_total: 2,
              dispense_override_total: 1,
              transfer_override_total: 1,
              expiry_override_total: 1,
              fefo_override_total: 1,
              recent_events: [],
            },
          },
        ] as T[],
      };
    },
  };

  const report = await getPharmacyOverrideReport(db)({
    clinicId: 'clinic-1',
    startDate: '2026-05-01',
    endDate: '2026-05-31',
  });

  assert.equal((report as { override_total: number }).override_total, 2);
});

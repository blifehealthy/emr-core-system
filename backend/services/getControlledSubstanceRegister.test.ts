import test from 'node:test';
import assert from 'node:assert/strict';

import { getControlledSubstanceRegister } from './getControlledSubstanceRegister.ts';

test('getControlledSubstanceRegister combines controlled item receiving dispensing and transfers', async () => {
  const db = {
    async query<T = unknown>(sql: string, params?: unknown[]) {
      assert.match(sql, /is_controlled_substance IS TRUE/);
      assert.match(sql, /inventory_lots/);
      assert.match(sql, /medication_dispenses/);
      assert.match(sql, /inventory_transfers/);
      assert.deepEqual(params, ['clinic-1', '2026-05-01', '2026-05-31']);
      return {
        rows: [
          {
            report: {
              start_date: '2026-05-01',
              end_date: '2026-05-31',
              controlled_item_total: 1,
              event_total: 3,
            },
          },
        ] as T[],
      };
    },
  };

  const report = await getControlledSubstanceRegister(db)({
    clinicId: 'clinic-1',
    startDate: '2026-05-01',
    endDate: '2026-05-31',
  });

  assert.deepEqual(report, {
    start_date: '2026-05-01',
    end_date: '2026-05-31',
    controlled_item_total: 1,
    event_total: 3,
  });
});

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  closeCashierReconciliation,
  createCashierReconciliation,
  listCashierReconciliations,
} from './cashierReconciliations.ts';

test('cashier reconciliation services create, list, and close a cash day', async () => {
  const calls: Array<{ sql: string; params?: unknown[] }> = [];
  const db = {
    async query<T = unknown>(sql: string, params?: unknown[]) {
      calls.push({ sql, params });
      if (sql.includes('FROM cashier_reconciliations') && sql.includes('ORDER BY')) {
        return { rows: [{ id: 'rec-1', status: 'open' }] as T[] };
      }
      if (sql.includes('INSERT INTO cashier_reconciliations')) {
        return { rows: [{ id: 'rec-2', opening_cash_amount: '100.00' }] as T[] };
      }
      if (sql.includes('SELECT id, clinic_id')) {
        return {
          rows: [{
            id: 'rec-2',
            clinic_id: 'clinic-1',
            reconciliation_date: '2026-05-25',
            opening_cash_amount: '100.00',
          }] as T[],
        };
      }
      if (sql.includes('SUM(p.amount)')) {
        return { rows: [{ cash_total: '400.00' }] as T[] };
      }
      if (sql.includes('UPDATE cashier_reconciliations')) {
        return { rows: [{ id: 'rec-2', status: 'closed', variance_amount: '0.00' }] as T[] };
      }
      return { rows: [] as T[] };
    },
  };

  const list = await listCashierReconciliations(db)({ clinicId: 'clinic-1', status: 'open' });
  const created = await createCashierReconciliation(db)({
    clinicId: 'clinic-1',
    reconciliationDate: '2026-05-25',
    openingCashAmount: 100,
  });
  const closed = await closeCashierReconciliation(db)({
    reconciliationId: 'rec-2',
    countedCashAmount: 500,
  });

  assert.equal((list.rows[0] as { id: string }).id, 'rec-1');
  assert.equal((created as { id: string }).id, 'rec-2');
  assert.equal((closed as { status: string }).status, 'closed');
  assert.deepEqual(calls.at(-1)?.params, ['rec-2', 500, 500, 0, null, null]);
});

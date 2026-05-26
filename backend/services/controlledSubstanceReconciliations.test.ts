import test from 'node:test';
import assert from 'node:assert/strict';

import {
  closeControlledSubstanceReconciliation,
  createControlledSubstanceReconciliation,
  listControlledSubstanceReconciliations,
} from './controlledSubstanceReconciliations.ts';

test('controlled substance reconciliation services list create and close a count', async () => {
  const calls: Array<{ sql: string; params?: unknown[] }> = [];
  const db = {
    async query<T = unknown>(sql: string, params?: unknown[]) {
      calls.push({ sql, params });
      if (sql.includes('FROM controlled_substance_reconciliations') && sql.includes('ORDER BY')) {
        return { rows: [{ id: 'csr-1', status: 'open' }] as T[] };
      }
      if (sql.includes('FROM inventory_items')) {
        return { rows: [{ controlled_item_count: '2', expected_quantity: '12.50' }] as T[] };
      }
      if (sql.includes('INSERT INTO controlled_substance_reconciliations')) {
        return { rows: [{ id: 'csr-2', expected_quantity: '12.50' }] as T[] };
      }
      if (sql.includes('SELECT id, expected_quantity')) {
        return { rows: [{ id: 'csr-2', expected_quantity: '12.50' }] as T[] };
      }
      if (sql.includes('UPDATE controlled_substance_reconciliations')) {
        return { rows: [{ id: 'csr-2', status: 'closed', variance_quantity: '-0.50' }] as T[] };
      }
      return { rows: [] as T[] };
    },
  };

  const list = await listControlledSubstanceReconciliations(db)({
    clinicId: 'clinic-1',
    status: 'open',
  });
  const created = await createControlledSubstanceReconciliation(db)({
    clinicId: 'clinic-1',
    reconciliationDate: '2026-05-27',
  });
  const closed = await closeControlledSubstanceReconciliation(db)({
    reconciliationId: 'csr-2',
    countedQuantity: 12,
    varianceReason: 'One tablet damaged',
  });

  assert.equal((list.rows[0] as { id: string }).id, 'csr-1');
  assert.equal((created as { id: string }).id, 'csr-2');
  assert.equal((closed as { status: string }).status, 'closed');
  assert.deepEqual(calls.at(-1)?.params, ['csr-2', 12, -0.5, 'One tablet damaged', null, null]);
});

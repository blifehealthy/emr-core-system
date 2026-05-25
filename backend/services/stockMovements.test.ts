import test from 'node:test';
import assert from 'node:assert/strict';

import { listStockMovements } from './stockMovements.ts';

test('listStockMovements filters by clinic and inventory item', async () => {
  const calls: Array<{ sql: string; params?: unknown[] }> = [];
  const service = listStockMovements({
    async query<T = unknown>(sql: string, params?: unknown[]) {
      calls.push({ sql, params });
      return { rows: [{ id: 'movement-1' }] as T[] };
    },
  });

  const result = await service({ clinicId: 'clinic-1', inventoryItemId: 'item-1', limit: 10, offset: 0 });

  assert.equal((result.rows[0] as { id: string }).id, 'movement-1');
  assert.match(calls[0].sql, /FROM stock_movements m/);
  assert.deepEqual(calls[0].params, ['clinic-1', 'item-1', 11, 0]);
});

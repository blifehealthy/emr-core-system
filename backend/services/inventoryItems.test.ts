import test from 'node:test';
import assert from 'node:assert/strict';

import {
  adjustInventoryStock,
  createInventoryItem,
  listInventoryItems,
  updateInventoryItem,
} from './inventoryItems.ts';

test('inventory item services list, create, update, and adjust stock', async () => {
  const calls: Array<{ sql: string; params?: unknown[] }> = [];
  const db = {
    async query<T = unknown>(sql: string, params?: unknown[]) {
      calls.push({ sql, params });
      if (sql.includes('FROM inventory_items i')) {
        return { rows: [{ id: 'item-1', low_stock: false }] as T[] };
      }
      if (sql.includes('INSERT INTO inventory_items')) {
        return { rows: [{ id: 'item-2', quantity_on_hand: '10.00' }] as T[] };
      }
      if (sql.includes('SELECT *') && sql.includes('FROM inventory_items')) {
        return { rows: [{ id: 'item-2' }] as T[] };
      }
      if (sql.includes('SELECT id, clinic_id, quantity_on_hand')) {
        return { rows: [{ id: 'item-2', clinic_id: 'clinic-1', quantity_on_hand: '10.00' }] as T[] };
      }
      if (sql.includes('UPDATE inventory_items')) {
        return { rows: [{ id: 'item-2', quantity_on_hand: '15.00' }] as T[] };
      }
      return { rows: [] as T[] };
    },
  };

  const list = await listInventoryItems(db)({ clinicId: 'clinic-1', lowStock: true });
  const created = await createInventoryItem(db)({
    clinicId: 'clinic-1',
    itemCode: 'AMOX-500',
    displayName: 'Amoxicillin 500mg',
  });
  const updated = await updateInventoryItem(db)({ inventoryItemId: 'item-2', reorderLevel: 5 });
  const adjusted = await adjustInventoryStock(db)({
    inventoryItemId: 'item-2',
    movementType: 'adjustment_in',
    quantity: 5,
  });

  assert.equal((list.rows[0] as { id: string }).id, 'item-1');
  assert.equal((created as { id: string }).id, 'item-2');
  assert.equal((updated as { id: string }).id, 'item-2');
  assert.equal((adjusted as { id: string }).id, 'item-2');
  assert.ok(calls.some((call) => /INSERT INTO stock_movements/.test(call.sql)));
});

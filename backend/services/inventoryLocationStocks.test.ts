import test from 'node:test';
import assert from 'node:assert/strict';

import {
  applyInventoryLocationStockChange,
  approveInventoryTransfer,
  createInventoryTransfer,
  listInventoryLocationStocks,
  receiveInventoryTransfer,
} from './inventoryLocationStocks.ts';

test('applyInventoryLocationStockChange upserts location stock', async () => {
  const calls: Array<{ sql: string; params?: unknown[] }> = [];
  const db = {
    async query<T = unknown>(sql: string, params?: unknown[]) {
      calls.push({ sql, params });
      if (sql.includes('SELECT quantity_on_hand')) {
        return { rows: [{ quantity_on_hand: '2' }] as T[] };
      }
      if (sql.includes('INSERT INTO inventory_location_stocks')) {
        return { rows: [{ id: 'stock-1', quantity_on_hand: params?.[4] }] as T[] };
      }
      return { rows: [] as T[] };
    },
  };

  const stock = await applyInventoryLocationStockChange(db, {
    clinicId: 'clinic-1',
    inventoryItemId: 'item-1',
    inventoryLocationId: 'loc-1',
    binLabel: 'A1',
    quantityDelta: 3,
  });

  assert.equal((stock as { quantity_on_hand: number }).quantity_on_hand, 5);
  assert.ok(calls.some((call) => /ON CONFLICT/.test(call.sql)));
});

test('listInventoryLocationStocks filters by location and hides empty by default', async () => {
  const db = {
    async query<T = unknown>(sql: string, params?: unknown[]) {
      assert.match(sql, /s.inventory_location_id = \$2/);
      assert.match(sql, /s.quantity_on_hand > 0/);
      assert.deepEqual(params, ['clinic-1', 'loc-1', 2, 0]);
      return { rows: [{ id: 'stock-1' }, { id: 'stock-2' }] as T[] };
    },
  };

  const result = await listInventoryLocationStocks(db)({
    clinicId: 'clinic-1',
    inventoryLocationId: 'loc-1',
    limit: 1,
  });

  assert.equal(result.rows.length, 1);
  assert.equal(result.meta.hasMore, true);
});

test('createInventoryTransfer moves quantity between location stocks', async () => {
  const calls: Array<{ sql: string; params?: unknown[] }> = [];
  const db = {
    async query<T = unknown>(sql: string, params?: unknown[]) {
      calls.push({ sql, params });
      if (sql.includes('FROM inventory_items')) {
        return { rows: [{ id: 'item-1', clinic_id: 'clinic-1', quantity_on_hand: '10' }] as T[] };
      }
      if (sql.includes('SELECT quantity_on_hand')) {
        return { rows: [{ quantity_on_hand: '5' }] as T[] };
      }
      if (sql.includes('INSERT INTO inventory_location_stocks')) {
        return { rows: [{ id: 'stock-1' }] as T[] };
      }
      if (sql.includes('INSERT INTO inventory_transfers')) {
        return { rows: [{ id: 'transfer-1' }] as T[] };
      }
      if (sql.includes('FROM inventory_transfers t')) {
        return { rows: [{ id: 'transfer-1' }] as T[] };
      }
      return { rows: [] as T[] };
    },
  };

  const transfer = await createInventoryTransfer(db)({
    clinicId: 'clinic-1',
    inventoryItemId: 'item-1',
    fromInventoryLocationId: 'loc-1',
    toInventoryLocationId: 'loc-2',
    quantity: 2,
  });

  assert.equal((transfer as { id: string }).id, 'transfer-1');
  assert.ok(calls.some((call) => /INSERT INTO stock_movements/.test(call.sql)));
});

test('approval transfer holds stock until approve and receive steps', async () => {
  const calls: Array<{ sql: string; params?: unknown[] }> = [];
  const transferRows = new Map<string, Record<string, unknown>>();
  const pendingTransfer = {
    id: 'transfer-2',
    clinic_id: 'clinic-1',
    inventory_item_id: 'item-1',
    inventory_lot_id: 'lot-1',
    from_inventory_location_id: 'loc-1',
    to_inventory_location_id: 'loc-2',
    from_bin_label: 'A1',
    to_bin_label: 'B1',
    quantity: '2',
    status: 'pending',
    notes: null,
    inventory_item_quantity_on_hand: '10',
  };
  const db = {
    async query<T = unknown>(sql: string, params?: unknown[]) {
      calls.push({ sql, params });
      if (sql.includes('FROM inventory_items') && !sql.includes('JOIN inventory_items')) {
        return { rows: [{ id: 'item-1', clinic_id: 'clinic-1', quantity_on_hand: '10' }] as T[] };
      }
      if (sql.includes('FROM inventory_lots')) {
        return {
          rows: [
            {
              id: 'lot-1',
              inventory_item_id: 'item-1',
              inventory_location_id: 'loc-1',
              bin_label: 'A1',
            },
          ] as T[],
        };
      }
      if (sql.includes('INSERT INTO inventory_transfers')) {
        transferRows.set('transfer-2', { ...pendingTransfer });
        return { rows: [{ id: 'transfer-2' }] as T[] };
      }
      if (sql.includes('FROM inventory_transfers t')) {
        return { rows: [transferRows.get(params?.[0] as string)].filter(Boolean) as T[] };
      }
      if (sql.includes('SELECT quantity_on_hand')) {
        return { rows: [{ quantity_on_hand: '5' }] as T[] };
      }
      if (sql.includes('INSERT INTO inventory_location_stocks')) {
        return { rows: [{ id: 'stock-1' }] as T[] };
      }
      if (sql.includes("SET status = 'in_transit'")) {
        transferRows.set('transfer-2', { ...transferRows.get('transfer-2'), status: 'in_transit' });
        return { rows: [] as T[] };
      }
      if (sql.includes("SET status = 'completed'")) {
        transferRows.set('transfer-2', { ...transferRows.get('transfer-2'), status: 'completed' });
        return { rows: [] as T[] };
      }
      return { rows: [] as T[] };
    },
  };

  const pending = await createInventoryTransfer(db)({
    clinicId: 'clinic-1',
    inventoryItemId: 'item-1',
    inventoryLotId: 'lot-1',
    fromInventoryLocationId: 'loc-1',
    fromBinLabel: 'A1',
    toInventoryLocationId: 'loc-2',
    toBinLabel: 'B1',
    quantity: 2,
    approvalRequired: true,
  });
  assert.equal((pending as { status: string }).status, 'pending');
  assert.equal(calls.filter((call) => /INSERT INTO inventory_location_stocks/.test(call.sql)).length, 0);

  const approved = await approveInventoryTransfer(db)({
    transferId: 'transfer-2',
    approvedByUserId: 'user-1',
  });
  assert.equal((approved as { status: string }).status, 'in_transit');

  const received = await receiveInventoryTransfer(db)({
    transferId: 'transfer-2',
    receivedByUserId: 'user-2',
  });
  assert.equal((received as { status: string }).status, 'completed');
  assert.equal(calls.filter((call) => /INSERT INTO inventory_location_stocks/.test(call.sql)).length, 2);
});

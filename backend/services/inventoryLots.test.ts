import test from 'node:test';
import assert from 'node:assert/strict';

import { listInventoryLots, receiveInventoryLot } from './inventoryLots.ts';

test('inventory lot services list and receive stock into a lot', async () => {
  const calls: Array<{ sql: string; params?: unknown[] }> = [];
  const db = {
    async query<T = unknown>(sql: string, params?: unknown[]) {
      calls.push({ sql, params });
      if (sql.includes('FROM inventory_lots l')) {
        return { rows: [{ id: 'lot-1', lot_number: 'LOT-1', quantity_on_hand: '5.00' }] as T[] };
      }
      if (sql.includes('FROM inventory_items') && sql.includes('is_active')) {
        return { rows: [{ id: 'item-1', clinic_id: 'clinic-1', quantity_on_hand: '10.00' }] as T[] };
      }
      if (sql.includes('INSERT INTO inventory_lots')) {
        return { rows: [{ id: 'lot-1' }] as T[] };
      }
      if (sql.includes('FROM inventory_lots l')) {
        return { rows: [{ id: 'lot-1', barcode_verified: true }] as T[] };
      }
      return { rows: [] as T[] };
    },
  };

  const list = await listInventoryLots(db)({
    clinicId: 'clinic-1',
    inventoryItemId: 'item-1',
    includeEmpty: true,
  });
  const received = await receiveInventoryLot(db)({
    inventoryItemId: 'item-1',
    lotNumber: 'LOT-1',
    expiresOn: '2026-12-31',
    quantity: 5,
    supplierName: 'Supplier',
  });

  assert.equal((list.rows[0] as { id: string }).id, 'lot-1');
  assert.equal((received as { id: string }).id, 'lot-1');
  assert.ok(calls.some((call) => /UPDATE inventory_items/.test(call.sql) && call.params?.[1] === 15));
  assert.ok(calls.some((call) => /INSERT INTO stock_movements/.test(call.sql) && call.params?.[2] === 'lot-1'));
});

test('receiveInventoryLot accepts GS1 barcode when GTIN and lot match', async () => {
  const calls: Array<{ sql: string; params?: unknown[] }> = [];
  const db = {
    async query<T = unknown>(sql: string, params?: unknown[]) {
      calls.push({ sql, params });
      if (sql.includes('FROM inventory_items') && sql.includes('is_active')) {
        return {
          rows: [
            {
              id: 'item-1',
              clinic_id: 'clinic-1',
              barcode: '01234567890128',
              barcode_required: true,
              quantity_on_hand: '10.00',
            },
          ] as T[],
        };
      }
      if (sql.includes('INSERT INTO inventory_lots')) {
        return { rows: [{ id: 'lot-1' }] as T[] };
      }
      if (sql.includes('FROM inventory_lots l')) {
        return { rows: [{ id: 'lot-1', barcode_verified: true }] as T[] };
      }
      return { rows: [] as T[] };
    },
  };

  const received = await receiveInventoryLot(db)({
    inventoryItemId: 'item-1',
    lotNumber: 'LOT-42',
    expiresOn: '2026-05-31',
    scannedBarcode: '(01)01234567890128(17)260531(10)LOT-42',
    requireBarcodeVerification: true,
    quantity: 5,
  });

  assert.equal((received as { id: string }).id, 'lot-1');
  assert.ok(calls.some((call) => /INSERT INTO inventory_lots/.test(call.sql) && call.params?.[8] === true));
});

import test from 'node:test';
import assert from 'node:assert/strict';

import { scanInventoryBarcode } from './inventoryBarcodes.ts';

test('scanInventoryBarcode records matched lot scan', async () => {
  const calls: Array<{ sql: string; params?: unknown[] }> = [];
  const db = {
    async query<T = unknown>(sql: string, params?: unknown[]) {
      calls.push({ sql, params });
      if (sql.includes('FROM (') && sql.includes('inventory_lots')) {
        return {
          rows: [
            {
              inventory_item_id: 'item-1',
              inventory_lot_id: 'lot-1',
              inventory_item_display_name: 'Amoxicillin',
              inventory_lot_number: 'LOT-1',
              inventory_lot_barcode: 'BC-LOT-1',
            },
          ] as T[],
        };
      }
      if (sql.includes('INSERT INTO inventory_barcode_scans')) {
        return { rows: [{ id: 'scan-1', matched: true }] as T[] };
      }
      return { rows: [] as T[] };
    },
  };

  const scan = await scanInventoryBarcode(db)({
    clinicId: 'clinic-1',
    barcode: 'BC-LOT-1',
    scanContext: 'dispensing',
    scannedByUserId: 'user-1',
  });

  assert.equal((scan as { id: string }).id, 'scan-1');
  assert.equal((scan as { inventory_lot_id: string }).inventory_lot_id, 'lot-1');
  assert.ok(calls.some((call) => /INSERT INTO inventory_barcode_scans/.test(call.sql)));
});

test('scanInventoryBarcode parses GS1 barcode and matches GTIN or lot number', async () => {
  const calls: Array<{ sql: string; params?: unknown[] }> = [];
  const db = {
    async query<T = unknown>(sql: string, params?: unknown[]) {
      calls.push({ sql, params });
      if (sql.includes('FROM (') && sql.includes('inventory_lots')) {
        assert.equal(params?.[2], '01234567890128');
        assert.equal(params?.[3], 'LOT-42');
        return {
          rows: [
            {
              inventory_item_id: 'item-1',
              inventory_lot_id: 'lot-42',
              inventory_item_display_name: 'Amoxicillin',
              inventory_item_barcode: '01234567890128',
              inventory_lot_number: 'LOT-42',
            },
          ] as T[],
        };
      }
      if (sql.includes('INSERT INTO inventory_barcode_scans')) {
        assert.equal(params?.[6], '01234567890128');
        assert.equal(params?.[7], 'LOT-42');
        assert.equal(params?.[8], '2026-05-31');
        return { rows: [{ id: 'scan-2', matched: true }] as T[] };
      }
      return { rows: [] as T[] };
    },
  };

  const scan = await scanInventoryBarcode(db)({
    clinicId: 'clinic-1',
    barcode: '(01)01234567890128(17)260531(10)LOT-42',
    scanContext: 'receiving',
  });

  assert.equal((scan as { gs1_gtin: string }).gs1_gtin, '01234567890128');
  assert.equal((scan as { gs1_lot_number: string }).gs1_lot_number, 'LOT-42');
  assert.equal((scan as { inventory_lot_id: string }).inventory_lot_id, 'lot-42');
});

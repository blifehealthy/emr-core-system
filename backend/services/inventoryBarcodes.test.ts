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

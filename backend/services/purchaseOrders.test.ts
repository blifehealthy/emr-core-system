import test from 'node:test';
import assert from 'node:assert/strict';
import { receivePurchaseOrder } from './purchaseOrders.ts';

test('receivePurchaseOrder receives into lot, stock movement, and received status', async () => {
  const calls: Array<{ sql: string; params?: unknown[] }> = [];
  const db = {
    async query<T = unknown>(sql: string, params?: unknown[]) {
      calls.push({ sql, params });
      if (sql.includes('FROM purchase_order_lines pol') && sql.includes('JOIN purchase_orders po')) {
        return {
          rows: [
            {
              purchase_order_id: 'po-1',
              clinic_id: 'clinic-1',
              supplier_id: 'supplier-1',
              supplier_display_name: 'Supplier',
              purchase_order_number: 'PO-1',
              inventory_item_id: 'item-1',
              ordered_quantity: '5',
              received_quantity: '1',
              quantity_on_hand: '10',
            },
          ] as T[],
        };
      }
      if (sql.includes('INSERT INTO inventory_lots')) {
        return { rows: [{ id: 'lot-1' }] as T[] };
      }
      if (sql.includes('SELECT') && sql.includes('FROM purchase_orders po')) {
        return {
          rows: [
            {
              id: 'po-1',
              status: 'received',
              lines: [{ id: 'line-1', received_quantity: '5' }],
            },
          ] as T[],
        };
      }
      return { rows: [] as T[] };
    },
  };

  const order = await receivePurchaseOrder(db)({
    purchaseOrderId: 'po-1',
    purchaseOrderLineId: 'line-1',
    lotNumber: 'LOT-1',
    quantity: 4,
    receivedByUserId: 'user-1',
  });

  assert.equal((order as { status: string }).status, 'received');
  assert.ok(calls.some((call) => /INSERT INTO inventory_lots/.test(call.sql)));
  assert.ok(calls.some((call) => /INSERT INTO stock_movements/.test(call.sql)));
  assert.ok(calls.some((call) => /UPDATE purchase_orders po/.test(call.sql)));
});

test('receivePurchaseOrder rejects over-receiving', async () => {
  const db = {
    async query<T = unknown>(sql: string) {
      if (sql.includes('FROM purchase_order_lines pol')) {
        return {
          rows: [
            {
              purchase_order_id: 'po-1',
              clinic_id: 'clinic-1',
              supplier_id: null,
              supplier_display_name: null,
              purchase_order_number: 'PO-1',
              inventory_item_id: 'item-1',
              ordered_quantity: '5',
              received_quantity: '4',
              quantity_on_hand: '10',
            },
          ] as T[],
        };
      }
      return { rows: [] as T[] };
    },
  };

  await assert.rejects(
    () =>
      receivePurchaseOrder(db)({
        purchaseOrderId: 'po-1',
        purchaseOrderLineId: 'line-1',
        lotNumber: 'LOT-1',
        quantity: 2,
      }),
    /Received quantity cannot exceed ordered quantity/
  );
});

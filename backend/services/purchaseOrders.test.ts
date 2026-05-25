import test from 'node:test';
import assert from 'node:assert/strict';
import {
  approvePurchaseOrder,
  receivePurchaseOrder,
  submitPurchaseOrder,
} from './purchaseOrders.ts';

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
              approval_status: 'approved',
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
              approval_status: 'approved',
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

test('receivePurchaseOrder requires approval before receiving', async () => {
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
              approval_status: 'pending_approval',
              inventory_item_id: 'item-1',
              ordered_quantity: '5',
              received_quantity: '0',
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
        quantity: 1,
      }),
    /Purchase order must be approved before receiving/
  );
});

test('submit and approve purchase order update approval state', async () => {
  const calls: string[] = [];
  const db = {
    async query<T = unknown>(sql: string) {
      calls.push(sql);
      if (sql.includes('SELECT step.id')) {
        return { rows: [{ id: 'step-1', required_role: 'admin' }] as T[] };
      }
      if (sql.includes('FROM purchase_order_approval_steps') && sql.includes("status = 'pending'")) {
        return { rows: [] as T[] };
      }
      if (sql.includes('UPDATE purchase_orders')) {
        return { rows: [{ id: 'po-1' }] as T[] };
      }
      if (sql.includes('FROM purchase_orders po')) {
        return { rows: [{ id: 'po-1', approval_status: 'approved', status: 'ordered' }] as T[] };
      }
      return { rows: [] as T[] };
    },
  };

  const submitted = await submitPurchaseOrder(db)({
    purchaseOrderId: 'po-1',
    submittedByUserId: 'user-1',
  });
  const approved = await approvePurchaseOrder(db)({
    purchaseOrderId: 'po-1',
    approvedByUserId: 'user-2',
  });

  assert.equal((submitted as { id: string }).id, 'po-1');
  assert.equal((approved as { approval_status: string }).approval_status, 'approved');
  assert.ok(calls.some((sql) => sql.includes("approval_status = 'pending_approval'")));
  assert.ok(calls.some((sql) => sql.includes("approval_status = 'approved'")));
});

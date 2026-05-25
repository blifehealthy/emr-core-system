import test from 'node:test';
import assert from 'node:assert/strict';
import { updateInvoice } from './updateInvoice.ts';

test('updateInvoice replaces editable line items and recalculates totals', async () => {
  const calls: Array<{ sql: string; params?: unknown[] }> = [];
  const service = updateInvoice({
    async query<T>(sql: string, params?: unknown[]) {
      calls.push({ sql, params });
      if (sql.includes('payment_count')) {
        return { rows: [{ id: 'invoice-1', status: 'draft', payment_count: '0', refund_count: '0' }] as T[] };
      }
      if (sql.includes('SELECT *') && sql.includes('FROM invoices')) {
        return { rows: [{ id: 'invoice-1', total_amount: '300.00' }] as T[] };
      }
      return { rows: [] as T[] };
    },
  });

  const invoice = await service({
    invoiceId: 'invoice-1',
    lineItems: [
      { description: 'Visit', quantity: 1, unitPriceAmount: 200 },
      { description: 'Medication', quantity: 2, unitPriceAmount: 50 },
    ],
  });

  assert.ok(calls.some((call) => /UPDATE invoice_line_items/.test(call.sql)));
  assert.equal(calls.filter((call) => /INSERT INTO invoice_line_items/.test(call.sql)).length, 2);
  assert.ok(calls.some((call) => /UPDATE invoices/.test(call.sql)));
  assert.equal((invoice as unknown as { id: string }).id, 'invoice-1');
});

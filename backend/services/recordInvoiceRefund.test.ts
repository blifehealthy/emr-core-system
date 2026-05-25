import test from 'node:test';
import assert from 'node:assert/strict';
import { recordInvoiceRefund } from './recordInvoiceRefund.ts';

test('recordInvoiceRefund updates refunded amount and invoice balance', async () => {
  const calls: Array<{ sql: string; params?: unknown[] }> = [];
  const service = recordInvoiceRefund({
    async query<T>(sql: string, params?: unknown[]) {
      calls.push({ sql, params });
      if (sql.includes('SELECT') && sql.includes('total_amount')) {
        return { rows: [{ total_amount: '1000.00', paid_amount: '1000.00', refunded_amount: '250.00' }] as T[] };
      }
      if (sql.includes('SELECT *') && sql.includes('FROM invoices')) {
        return { rows: [{ id: 'invoice-1', paid_amount: '750.00', refunded_amount: '250.00' }] as T[] };
      }
      return { rows: [] as T[] };
    },
  });

  const invoice = await service({
    invoiceId: 'invoice-1',
    refundNumber: 'REF-001',
    method: 'cash',
    amount: 250,
  });

  const update = calls.find((call) => /UPDATE invoices/.test(call.sql));
  assert.ok(update);
  assert.deepEqual(update.params, ['invoice-1', 750, 250, 250, 'partially_paid']);
  assert.equal((invoice as unknown as { id: string }).id, 'invoice-1');
});

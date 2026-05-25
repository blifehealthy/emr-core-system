import assert from 'node:assert/strict';
import test from 'node:test';

import { recordInvoicePayment } from './recordInvoicePayment.ts';

test('recordInvoicePayment updates invoice paid and balance amounts', async () => {
  const calls: Array<{ sql: string; params?: unknown[] }> = [];
  const service = recordInvoicePayment({
    async query<T = unknown>(sql: string, params?: unknown[]) {
      calls.push({ sql, params });
      if (sql.includes('SELECT') && sql.includes('total_amount')) {
        return { rows: [{ total_amount: '1000.00', paid_amount: '400.00', refunded_amount: '0.00' }] as T[] };
      }
      if (sql.includes('SELECT *') && sql.includes('FROM invoices')) {
        return { rows: [{ id: 'invoice-1', paid_amount: '400.00', balance_amount: '600.00' }] as T[] };
      }
      return { rows: [] as T[] };
    },
  });

  const invoice = await service({
    invoiceId: 'invoice-1',
    paymentNumber: 'PAY-001',
    method: 'cash',
    amount: 400,
  });

  const update = calls.find((call) => /UPDATE invoices/.test(call.sql));
  assert.ok(update);
  assert.deepEqual(update.params, ['invoice-1', 400, 600, 'partially_paid']);
  assert.equal((invoice as unknown as { id: string }).id, 'invoice-1');
});

import assert from 'node:assert/strict';
import test from 'node:test';

import { createInvoice } from './createInvoice.ts';

test('createInvoice inserts invoice totals and line items', async () => {
  const calls: Array<{ sql: string; params?: unknown[] }> = [];
  const service = createInvoice({
    async query<T = unknown>(sql: string, params?: unknown[]) {
      calls.push({ sql, params });
      if (sql.includes('INSERT INTO invoices')) {
        return { rows: [{ id: 'invoice-1' }] as T[] };
      }
      if (sql.includes('SELECT *') && sql.includes('FROM invoices')) {
        return { rows: [{ id: 'invoice-1', total_amount: '850.00' }] as T[] };
      }
      return { rows: [] as T[] };
    },
  });

  const invoice = await service({
    clinicId: 'clinic-1',
    patientId: 'patient-1',
    invoiceNumber: 'INV-001',
    lineItems: [
      {
        itemType: 'visit',
        description: 'Doctor visit',
        quantity: 1,
        unitPriceAmount: 800,
        discountAmount: 100,
        taxAmount: 50,
      },
      {
        itemType: 'medication',
        description: 'Medication',
        quantity: 2,
        unitPriceAmount: 50,
      },
    ],
  });

  assert.equal((invoice as unknown as { id: string }).id, 'invoice-1');
  assert.match(calls[0].sql, /INSERT INTO invoices/);
  assert.deepEqual(calls[0].params?.slice(8, 12), [900, 100, 50, 850]);
  assert.equal(calls.filter((call) => /INSERT INTO invoice_line_items/.test(call.sql)).length, 2);
});

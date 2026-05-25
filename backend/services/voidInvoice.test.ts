import test from 'node:test';
import assert from 'node:assert/strict';
import { voidInvoice } from './voidInvoice.ts';

test('voidInvoice marks invoice voided with reason', async () => {
  const calls: Array<{ sql: string; params?: unknown[] }> = [];
  const service = voidInvoice({
    async query<T>(sql: string, params?: unknown[]) {
      calls.push({ sql, params });
      if (sql.includes('UPDATE invoices')) return { rows: [{ id: 'invoice-1' }] as T[] };
      if (sql.includes('SELECT *') && sql.includes('FROM invoices')) {
        return { rows: [{ id: 'invoice-1', status: 'voided', void_reason: 'duplicate' }] as T[] };
      }
      return { rows: [] as T[] };
    },
  });

  const invoice = await service({ invoiceId: 'invoice-1', voidReason: 'duplicate' });

  assert.match(calls[0].sql, /status = 'voided'/);
  assert.deepEqual(calls[0].params, ['invoice-1', 'duplicate']);
  assert.equal((invoice as unknown as { status: string }).status, 'voided');
});

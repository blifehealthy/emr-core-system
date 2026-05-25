import test from 'node:test';
import assert from 'node:assert/strict';

import {
  createBillingNumberSequence,
  issueBillingNumber,
  listBillingNumberSequences,
} from './billingNumberSequences.ts';

test('billing number sequence services list, create, and issue numbers', async () => {
  const calls: Array<{ sql: string; params?: unknown[] }> = [];
  const db = {
    async query<T = unknown>(sql: string, params?: unknown[]) {
      calls.push({ sql, params });
      if (sql.includes('SELECT *')) {
        return { rows: [{ id: 'seq-1', document_type: 'receipt' }] as T[] };
      }
      if (sql.includes('INSERT INTO billing_number_sequences')) {
        return { rows: [{ id: 'seq-2', prefix: 'RCPT-', next_number: 1 }] as T[] };
      }
      if (sql.includes('SELECT id, prefix')) {
        return { rows: [{ id: 'seq-2', prefix: 'RCPT-', next_number: 7, padding: 4 }] as T[] };
      }
      return { rows: [] as T[] };
    },
  };

  const rows = await listBillingNumberSequences(db)({ clinicId: 'clinic-1' });
  const created = await createBillingNumberSequence(db)({
    clinicId: 'clinic-1',
    documentType: 'receipt',
    prefix: 'RCPT-',
  });
  const issued = await issueBillingNumber(db)({ clinicId: 'clinic-1', documentType: 'receipt' });

  assert.equal((rows[0] as { id: string }).id, 'seq-1');
  assert.equal((created as { id: string }).id, 'seq-2');
  assert.deepEqual(issued, { documentNumber: 'RCPT-0007' });
  assert.deepEqual(calls.at(-1)?.params, ['seq-2']);
});

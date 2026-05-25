import test from 'node:test';
import assert from 'node:assert/strict';
import { createInvoiceFromEncounter } from './createInvoiceFromEncounter.ts';

test('createInvoiceFromEncounter builds visit and prescription charges', async () => {
  const calls: Array<{ sql: string; params?: unknown[] }> = [];
  const service = createInvoiceFromEncounter({
    async query<T>(sql: string, params?: unknown[]) {
      calls.push({ sql, params });
      if (sql.includes('FROM encounters')) {
        return { rows: [{ id: 'encounter-1', patient_id: 'patient-1', clinic_id: 'clinic-1' }] as T[] };
      }
      if (sql.includes('FROM charge_templates')) {
        return { rows: [
          { code: 'VISIT', description: 'Doctor visit', item_type: 'visit', unit_price_amount: '500', tax_amount: '0' },
          { code: 'MEDICATION', description: 'Medication', item_type: 'medication', unit_price_amount: '100', tax_amount: '0' },
        ] as T[] };
      }
      if (sql.includes('FROM prescriptions')) {
        return { rows: [{ id: 'rx-1', medication_name: 'Amoxicillin' }] as T[] };
      }
      if (sql.includes('INSERT INTO invoices')) {
        return { rows: [{ id: 'invoice-1' }] as T[] };
      }
      if (sql.includes('SELECT *') && sql.includes('FROM invoices')) {
        return { rows: [{ id: 'invoice-1' }] as T[] };
      }
      return { rows: [] as T[] };
    },
  });

  const invoice = await service({
    clinicId: 'clinic-1',
    patientId: 'patient-1',
    encounterId: 'encounter-1',
    invoiceNumber: 'INV-1',
  });

  assert.equal(calls.filter((call) => /INSERT INTO invoice_line_items/.test(call.sql)).length, 2);
  assert.equal((invoice as unknown as { id: string }).id, 'invoice-1');
});

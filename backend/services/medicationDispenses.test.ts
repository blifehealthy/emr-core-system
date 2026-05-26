import test from 'node:test';
import assert from 'node:assert/strict';

import { dispensePrescription, listMedicationDispenses } from './medicationDispenses.ts';

test('medication dispense service reduces stock and records movement', async () => {
  const calls: Array<{ sql: string; params?: unknown[] }> = [];
  const db = {
    async query<T = unknown>(sql: string, params?: unknown[]) {
      calls.push({ sql, params });
      if (sql.includes('FROM medication_dispenses d')) {
        return { rows: [{ id: 'dispense-1' }] as T[] };
      }
      if (sql.includes('FROM prescriptions')) {
        return { rows: [{ id: 'rx-1', encounter_id: 'encounter-1' }] as T[] };
      }
      if (sql.includes('FROM inventory_items') && sql.includes('is_active')) {
        return { rows: [{ id: 'item-1', clinic_id: 'clinic-1', quantity_on_hand: '10.00' }] as T[] };
      }
      if (sql.includes('FROM inventory_lots l')) {
        return { rows: [] as T[] };
      }
      if (sql.includes('FROM inventory_lots')) {
        return { rows: [{ id: 'lot-1', quantity_on_hand: '3.00' }] as T[] };
      }
      if (sql.includes('INSERT INTO medication_dispenses')) {
        return { rows: [{ id: 'dispense-1' }] as T[] };
      }
      return { rows: [] as T[] };
    },
  };

  const list = await listMedicationDispenses(db)({ clinicId: 'clinic-1' });
  const dispense = await dispensePrescription(db)({
    prescriptionId: 'rx-1',
    inventoryItemId: 'item-1',
    inventoryLotId: 'lot-1',
    quantity: 2,
  });

  assert.equal((list.rows[0] as { id: string }).id, 'dispense-1');
  assert.equal((dispense as { id: string }).id, 'dispense-1');
  assert.ok(calls.some((call) => /UPDATE inventory_lots/.test(call.sql) && call.params?.[1] === 1));
  assert.ok(calls.some((call) => /UPDATE inventory_items/.test(call.sql) && call.params?.[1] === 8));
  assert.ok(calls.some((call) => /INSERT INTO stock_movements/.test(call.sql) && call.params?.[2] === 'lot-1'));
});

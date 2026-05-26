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

test('controlled medication dispense requires a different witness user and re-auth', async () => {
  const calls: Array<{ sql: string; params?: unknown[] }> = [];
  const db = {
    async query<T = unknown>(sql: string, params?: unknown[]) {
      calls.push({ sql, params });
      if (sql.includes('FROM prescriptions')) {
        return { rows: [{ id: 'rx-1', encounter_id: 'encounter-1' }] as T[] };
      }
      if (sql.includes('FROM inventory_items') && sql.includes('is_active')) {
        return {
          rows: [
            {
              id: 'item-1',
              clinic_id: 'clinic-1',
              barcode: null,
              barcode_required: false,
              is_controlled_substance: true,
              quantity_on_hand: '10.00',
            },
          ] as T[],
        };
      }
      if (sql.includes('FROM users')) {
        return { rows: [{ id: 'user-2' }] as T[] };
      }
      if (sql.includes('INSERT INTO medication_dispenses')) {
        return { rows: [{ id: 'dispense-1' }] as T[] };
      }
      if (sql.includes('FROM medication_dispenses d')) {
        return {
          rows: [
            {
              id: 'dispense-1',
              witness_reauth_method: 'login_code',
              witness_signature_hash: 'hmac-sha256:test',
            },
          ] as T[],
        };
      }
      return { rows: [] as T[] };
    },
  };
  const service = dispensePrescription(db, {
    witnessLoginCode: 'witness-code',
    witnessSignatureSecret: 'signature-secret',
    now: () => new Date('2026-05-26T10:00:00.000Z'),
  });

  await assert.rejects(
    () =>
      service({
        prescriptionId: 'rx-1',
        inventoryItemId: 'item-1',
        quantity: 1,
        dispensedByUserId: 'user-1',
      }),
    /requires witnessUserId/
  );

  await assert.rejects(
    () =>
      service({
        prescriptionId: 'rx-1',
        inventoryItemId: 'item-1',
        quantity: 1,
        dispensedByUserId: 'user-1',
        witnessUserId: 'user-1',
    }),
    /witness must be different/
  );

  await assert.rejects(
    () =>
      service({
        prescriptionId: 'rx-1',
        inventoryItemId: 'item-1',
        quantity: 1,
        dispensedByUserId: 'user-1',
        witnessUserId: 'user-2',
        witnessLoginCode: 'wrong-code',
      }),
    /requires valid witness re-auth/
  );

  const dispense = await service({
    prescriptionId: 'rx-1',
    inventoryItemId: 'item-1',
    quantity: 1,
    dispensedByUserId: 'user-1',
    witnessUserId: 'user-2',
    witnessLoginCode: 'witness-code',
    witnessNote: 'Second person checked',
  });

  assert.equal((dispense as { witness_reauth_method: string }).witness_reauth_method, 'login_code');
  const insertCall = calls.find((call) => /INSERT INTO medication_dispenses/.test(call.sql));
  assert.equal(insertCall?.params?.[12], 'user-2');
  assert.equal(insertCall?.params?.[13], '2026-05-26T10:00:00.000Z');
  assert.equal(insertCall?.params?.[14], 'login_code');
  assert.equal(insertCall?.params?.[15], '2026-05-26T10:00:00.000Z');
  assert.match(String(insertCall?.params?.[16]), /^hmac-sha256:/);
});

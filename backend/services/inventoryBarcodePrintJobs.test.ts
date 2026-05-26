import test from 'node:test';
import assert from 'node:assert/strict';

import {
  createInventoryBarcodePrintJob,
  renderBarcodePayload,
} from './inventoryBarcodePrintJobs.ts';

test('renderBarcodePayload creates ZPL and ESC/POS payloads', () => {
  const labels = [
    {
      type: 'ITEM',
      title: 'Amoxicillin 500mg',
      subtitle: 'AMOX-500',
      barcode: 'BC-AMOX-500',
      detail: 'QOH 10 tablet',
    },
  ];

  assert.match(renderBarcodePayload(labels, 'zpl'), /\^XA[\s\S]+\^BCN[\s\S]+BC-AMOX-500/);
  assert.match(renderBarcodePayload(labels, 'escpos'), /\[BARCODE:BC-AMOX-500\]/);
});

test('createInventoryBarcodePrintJob stores rendered payload', async () => {
  const calls: Array<{ sql: string; params?: unknown[] }> = [];
  const db = {
    async query<T = unknown>(sql: string, params?: unknown[]) {
      calls.push({ sql, params });
      if (sql.includes('INSERT INTO inventory_barcode_print_jobs')) {
        return { rows: [{ id: 'job-1', rendered_payload: params?.[7] }] as T[] };
      }
      return { rows: [] as T[] };
    },
  };

  const job = await createInventoryBarcodePrintJob(db)({
    clinicId: 'clinic-1',
    printerLanguage: 'zpl',
    requestedByUserId: 'user-1',
    labels: [{ title: 'Item', barcode: 'BC-1' }],
  });

  assert.equal((job as { id: string }).id, 'job-1');
  assert.ok(calls.some((call) => call.params?.[2] === 'zpl' && call.params?.[6] === 1));
  assert.match(String((job as { rendered_payload: string }).rendered_payload), /\^XA/);
});

test('createInventoryBarcodePrintJob uses active printer profile routing', async () => {
  const calls: Array<{ sql: string; params?: unknown[] }> = [];
  const db = {
    async query<T = unknown>(sql: string, params?: unknown[]) {
      calls.push({ sql, params });
      if (sql.includes('FROM inventory_printer_profiles')) {
        return {
          rows: [
            {
              id: 'profile-1',
              printer_language: 'escpos',
              connection_type: 'utility_bridge',
              endpoint_url: 'bridge://pharmacy-label',
            },
          ] as T[],
        };
      }
      if (sql.includes('INSERT INTO inventory_barcode_print_jobs')) {
        return {
          rows: [
            {
              id: 'job-2',
              printer_profile_id: params?.[1],
              printer_language: params?.[2],
              connection_type: params?.[3],
              delivery_status: params?.[4],
              target_endpoint: params?.[5],
            },
          ] as T[],
        };
      }
      return { rows: [] as T[] };
    },
  };

  const job = await createInventoryBarcodePrintJob(db)({
    clinicId: 'clinic-1',
    printerProfileId: 'profile-1',
    labels: [{ title: 'Item', barcode: 'BC-1' }],
  });

  assert.equal((job as { printer_profile_id: string }).printer_profile_id, 'profile-1');
  assert.equal((job as { printer_language: string }).printer_language, 'escpos');
  assert.equal((job as { connection_type: string }).connection_type, 'utility_bridge');
  assert.equal((job as { delivery_status: string }).delivery_status, 'queued');
  assert.equal((job as { target_endpoint: string }).target_endpoint, 'bridge://pharmacy-label');
});

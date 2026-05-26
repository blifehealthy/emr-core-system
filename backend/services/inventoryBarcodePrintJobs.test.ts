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
        return { rows: [{ id: 'job-1', rendered_payload: params?.[3] }] as T[] };
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
  assert.ok(calls.some((call) => call.params?.[1] === 'zpl' && call.params?.[2] === 1));
  assert.match(String((job as { rendered_payload: string }).rendered_payload), /\^XA/);
});

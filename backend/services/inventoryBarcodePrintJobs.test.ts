import test from 'node:test';
import assert from 'node:assert/strict';

import {
  createInventoryBarcodePrintJob,
  listInventoryBarcodePrintJobs,
  renderBarcodePayload,
  updateInventoryBarcodePrintJobDelivery,
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
        return { rows: [{ id: 'job-1', rendered_payload: params?.[8] }] as T[] };
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
  assert.ok(calls.some((call) => call.params?.[3] === 'zpl' && call.params?.[7] === 1));
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
              label_template_id: params?.[2],
              printer_language: params?.[3],
              connection_type: params?.[4],
              delivery_status: params?.[5],
              target_endpoint: params?.[6],
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

test('createInventoryBarcodePrintJob applies active label template fields', async () => {
  const db = {
    async query<T = unknown>(sql: string, params?: unknown[]) {
      if (sql.includes('FROM inventory_barcode_label_templates')) {
        return {
          rows: [
            {
              id: 'template-1',
              printer_language: 'zpl',
              enabled_fields: ['title', 'barcode', 'type'],
              header_text: 'BLife',
              footer_text: 'Store cold',
            },
          ] as T[],
        };
      }
      if (sql.includes('INSERT INTO inventory_barcode_print_jobs')) {
        return {
          rows: [
            {
              id: 'job-3',
              label_template_id: params?.[2],
              rendered_payload: params?.[8],
            },
          ] as T[],
        };
      }
      return { rows: [] as T[] };
    },
  };

  const job = await createInventoryBarcodePrintJob(db)({
    clinicId: 'clinic-1',
    labelTemplateId: 'template-1',
    labels: [{ type: 'ITEM', title: 'Item', subtitle: 'Hidden', barcode: 'BC-1', detail: 'Hidden' }],
  });

  assert.equal((job as { label_template_id: string }).label_template_id, 'template-1');
  assert.match(String((job as { rendered_payload: string }).rendered_payload), /BLife - Item/);
  assert.doesNotMatch(String((job as { rendered_payload: string }).rendered_payload), /Hidden/);
  assert.match(String((job as { rendered_payload: string }).rendered_payload), /ITEM \| Store cold/);
});

test('listInventoryBarcodePrintJobs filters bridge queue and paginates', async () => {
  const calls: Array<{ sql: string; params?: unknown[] }> = [];
  const db = {
    async query<T = unknown>(sql: string, params?: unknown[]) {
      calls.push({ sql, params });
      return {
        rows: [
          { id: 'job-1', delivery_status: 'queued' },
          { id: 'job-2', delivery_status: 'queued' },
        ] as T[],
      };
    },
  };

  const result = await listInventoryBarcodePrintJobs(db)({
    clinicId: 'clinic-1',
    printerProfileId: 'profile-1',
    connectionType: 'utility_bridge',
    deliveryStatus: 'queued',
    limit: 1,
  });

  assert.equal(result.rows.length, 1);
  assert.equal(result.meta.hasMore, true);
  assert.match(calls[0].sql, /printer_profile_id = \$2/);
  assert.match(calls[0].sql, /connection_type = \$3/);
  assert.match(calls[0].sql, /delivery_status = \$4/);
  assert.deepEqual(calls[0].params?.slice(0, 4), [
    'clinic-1',
    'profile-1',
    'utility_bridge',
    'queued',
  ]);
});

test('updateInventoryBarcodePrintJobDelivery records acknowledgement metadata', async () => {
  const calls: Array<{ sql: string; params?: unknown[] }> = [];
  const db = {
    async query<T = unknown>(sql: string, params?: unknown[]) {
      calls.push({ sql, params });
      return {
        rows: [
          {
            id: params?.[0],
            delivery_status: params?.[1],
            last_delivery_error: params?.[2],
            delivery_updated_by_user_id: params?.[3],
            delivered_at: params?.[4],
          },
        ] as T[],
      };
    },
  };

  const job = await updateInventoryBarcodePrintJobDelivery(db)({
    printJobId: 'job-1',
    deliveryStatus: 'failed',
    deliveryError: 'printer offline',
    updatedByUserId: 'user-1',
  });

  assert.equal((job as { delivery_status: string }).delivery_status, 'failed');
  assert.equal((job as { last_delivery_error: string }).last_delivery_error, 'printer offline');
  assert.equal((job as { delivery_updated_by_user_id: string }).delivery_updated_by_user_id, 'user-1');
  assert.match(calls[0].sql, /delivery_attempt_count = delivery_attempt_count \+ 1/);
});

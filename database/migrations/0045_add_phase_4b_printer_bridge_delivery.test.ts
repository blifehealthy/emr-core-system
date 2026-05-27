import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('0045 printer bridge delivery migration tracks queue acknowledgements', () => {
  const sql = readFileSync(
    'database/migrations/0045_add_phase_4b_printer_bridge_delivery.up.sql',
    'utf8'
  );

  assert.match(sql, /delivery_attempt_count INTEGER NOT NULL DEFAULT 0/);
  assert.match(sql, /last_delivery_error TEXT/);
  assert.match(sql, /delivered_at TIMESTAMPTZ/);
  assert.match(sql, /delivery_status IN \('exported', 'queued', 'printing', 'delivered', 'failed', 'cancelled'\)/);
  assert.match(sql, /idx_inventory_barcode_print_jobs_bridge_queue/);
});

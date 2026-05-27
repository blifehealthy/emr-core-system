import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('0048 print fallback recovery migration tracks degraded mode decisions', () => {
  const sql = readFileSync(
    'database/migrations/0048_add_phase_4f_print_fallback_recovery.up.sql',
    'utf8'
  );

  assert.match(sql, /fallback_status VARCHAR\(32\) NOT NULL DEFAULT 'none'/);
  assert.match(sql, /fallback_reason TEXT/);
  assert.match(sql, /retry_requested_at TIMESTAMPTZ/);
  assert.match(sql, /browser_export', 'manual_print', 'retry_queued/);
  assert.match(sql, /idx_inventory_barcode_print_jobs_fallback_recovery/);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

test('0031 adds Phase 3H barcode verification schema', () => {
  const sql = readFileSync(
    join(process.cwd(), 'database/migrations/0031_add_phase_3h_barcode_verification.up.sql'),
    'utf8'
  );

  assert.match(sql, /CREATE TYPE inventory_barcode_scan_context AS ENUM/);
  assert.match(sql, /ADD COLUMN barcode VARCHAR\(128\)/);
  assert.match(sql, /barcode_required BOOLEAN NOT NULL DEFAULT FALSE/);
  assert.match(sql, /received_barcode VARCHAR\(128\)/);
  assert.match(sql, /barcode_verified BOOLEAN NOT NULL DEFAULT FALSE/);
  assert.match(sql, /CREATE TABLE inventory_barcode_scans/);
  assert.match(sql, /scan_context inventory_barcode_scan_context/);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('0046 GS1 barcode parsing migration stores parsed scan metadata', () => {
  const sql = readFileSync(
    'database/migrations/0046_add_phase_4c_gs1_barcode_parsing.up.sql',
    'utf8'
  );

  assert.match(sql, /gs1_gtin VARCHAR\(14\)/);
  assert.match(sql, /gs1_lot_number VARCHAR\(120\)/);
  assert.match(sql, /gs1_expires_on DATE/);
  assert.match(sql, /gs1_serial_number VARCHAR\(120\)/);
  assert.match(sql, /idx_inventory_barcode_scans_gs1_gtin_active/);
});

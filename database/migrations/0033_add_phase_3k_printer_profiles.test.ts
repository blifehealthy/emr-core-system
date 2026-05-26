import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

test('0033 adds Phase 3K printer profile schema', () => {
  const sql = readFileSync(
    join(process.cwd(), 'database/migrations/0033_add_phase_3k_printer_profiles.up.sql'),
    'utf8'
  );

  assert.match(sql, /CREATE TYPE inventory_printer_connection_type AS ENUM/);
  assert.match(sql, /CREATE TABLE inventory_printer_profiles/);
  assert.match(sql, /printer_language inventory_barcode_print_language/);
  assert.match(sql, /connection_type inventory_printer_connection_type/);
  assert.match(sql, /ADD COLUMN printer_profile_id UUID/);
  assert.match(sql, /delivery_status VARCHAR\(32\) NOT NULL DEFAULT 'exported'/);
});

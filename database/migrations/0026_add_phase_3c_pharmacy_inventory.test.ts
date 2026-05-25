import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

test('0026 adds Phase 3C pharmacy inventory schema', () => {
  const sql = readFileSync(
    join(process.cwd(), 'database/migrations/0026_add_phase_3c_pharmacy_inventory.up.sql'),
    'utf8'
  );

  assert.match(sql, /CREATE TABLE inventory_items/);
  assert.match(sql, /drug_catalog_id UUID REFERENCES drug_catalog/);
  assert.match(sql, /CREATE TABLE medication_dispenses/);
  assert.match(sql, /CREATE TABLE stock_movements/);
  assert.match(sql, /CREATE TYPE stock_movement_type AS ENUM/);
});

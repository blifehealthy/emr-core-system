import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

test('Phase 3L inventory locations migration adds location routing to stock rows', () => {
  const sql = readFileSync(
    join(process.cwd(), 'database/migrations/0034_add_phase_3l_inventory_locations.up.sql'),
    'utf8'
  );

  assert.match(sql, /CREATE TABLE inventory_locations/);
  assert.match(sql, /uq_inventory_locations_clinic_default_active/);
  assert.match(sql, /ALTER TABLE inventory_lots[\s\S]+ADD COLUMN inventory_location_id/);
  assert.match(sql, /ALTER TABLE medication_dispenses[\s\S]+ADD COLUMN inventory_location_id/);
  assert.match(sql, /ALTER TABLE stock_movements[\s\S]+ADD COLUMN inventory_location_id/);
  assert.match(sql, /idx_stock_movements_location_active/);
});

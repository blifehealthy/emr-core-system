import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

test('0027 adds Phase 3D inventory lot and expiry schema', () => {
  const sql = readFileSync(
    join(process.cwd(), 'database/migrations/0027_add_phase_3d_inventory_lots.up.sql'),
    'utf8'
  );

  assert.match(sql, /CREATE TABLE inventory_lots/);
  assert.match(sql, /lot_number VARCHAR\(128\) NOT NULL/);
  assert.match(sql, /expires_on DATE/);
  assert.match(sql, /ADD COLUMN inventory_lot_id UUID REFERENCES inventory_lots/);
  assert.match(sql, /idx_inventory_lots_clinic_expiry_active/);
});

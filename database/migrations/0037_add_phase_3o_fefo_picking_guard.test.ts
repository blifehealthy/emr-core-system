import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

test('Phase 3O FEFO picking guard migration adds override audit fields', () => {
  const sql = readFileSync(
    join(process.cwd(), 'database/migrations/0037_add_phase_3o_fefo_picking_guard.up.sql'),
    'utf8'
  );

  assert.match(sql, /ALTER TABLE medication_dispenses/);
  assert.match(sql, /ADD COLUMN expiry_override_reason TEXT/);
  assert.match(sql, /ADD COLUMN fefo_override_reason TEXT/);
  assert.match(sql, /ADD COLUMN fefo_recommended_lot_id UUID REFERENCES inventory_lots/);
  assert.match(sql, /ALTER TABLE inventory_transfers/);
  assert.match(sql, /idx_medication_dispenses_fefo_recommended_lot_active/);
  assert.match(sql, /idx_inventory_transfers_fefo_recommended_lot_active/);
});

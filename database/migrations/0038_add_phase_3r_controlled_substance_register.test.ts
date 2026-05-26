import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('phase 3r migration adds controlled substance item flags', () => {
  const sql = readFileSync(
    'database/migrations/0038_add_phase_3r_controlled_substance_register.up.sql',
    'utf8'
  );

  assert.match(sql, /ALTER TABLE inventory_items/);
  assert.match(sql, /is_controlled_substance BOOLEAN NOT NULL DEFAULT FALSE/);
  assert.match(sql, /controlled_substance_schedule VARCHAR\(64\)/);
  assert.match(sql, /idx_inventory_items_controlled_active/);
});

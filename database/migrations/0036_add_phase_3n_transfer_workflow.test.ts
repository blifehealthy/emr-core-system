import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

test('Phase 3N transfer workflow migration adds transfer states and audit fields', () => {
  const sql = readFileSync(
    join(process.cwd(), 'database/migrations/0036_add_phase_3n_transfer_workflow.up.sql'),
    'utf8'
  );

  assert.match(sql, /ALTER TYPE inventory_transfer_status ADD VALUE IF NOT EXISTS 'pending'/);
  assert.match(sql, /ALTER TYPE inventory_transfer_status ADD VALUE IF NOT EXISTS 'in_transit'/);
  assert.match(sql, /ADD COLUMN inventory_lot_id UUID REFERENCES inventory_lots/);
  assert.match(sql, /ADD COLUMN approved_at TIMESTAMPTZ/);
  assert.match(sql, /ADD COLUMN received_at TIMESTAMPTZ/);
  assert.match(sql, /ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT now\(\)/);
  assert.match(sql, /CREATE TRIGGER update_inventory_transfers_updated_at/);
  assert.match(sql, /idx_inventory_transfers_status_active/);
});

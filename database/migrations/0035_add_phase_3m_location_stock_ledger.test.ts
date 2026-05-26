import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

test('Phase 3M location stock ledger migration adds stock and transfer tables', () => {
  const sql = readFileSync(
    join(process.cwd(), 'database/migrations/0035_add_phase_3m_location_stock_ledger.up.sql'),
    'utf8'
  );

  assert.match(sql, /CREATE TABLE inventory_location_stocks/);
  assert.match(sql, /uq_inventory_location_stocks_item_location_bin_active/);
  assert.match(sql, /CREATE TABLE inventory_transfers/);
  assert.match(sql, /from_inventory_location_id UUID NOT NULL REFERENCES inventory_locations/);
  assert.match(sql, /to_inventory_location_id UUID NOT NULL REFERENCES inventory_locations/);
  assert.match(sql, /CREATE TYPE inventory_transfer_status AS ENUM/);
});

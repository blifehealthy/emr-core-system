import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('phase 3v migration adds controlled substance reconciliations', () => {
  const sql = readFileSync(
    'database/migrations/0042_add_phase_3v_controlled_substance_reconciliations.up.sql',
    'utf8'
  );

  assert.match(sql, /CREATE TABLE IF NOT EXISTS controlled_substance_reconciliations/);
  assert.match(sql, /reconciliation_date DATE NOT NULL/);
  assert.match(sql, /controlled_item_count INTEGER NOT NULL DEFAULT 0/);
  assert.match(sql, /expected_quantity NUMERIC\(12, 2\) NOT NULL DEFAULT 0/);
  assert.match(sql, /variance_quantity NUMERIC\(12, 2\)/);
  assert.match(sql, /UNIQUE \(clinic_id, reconciliation_date\)/);
});

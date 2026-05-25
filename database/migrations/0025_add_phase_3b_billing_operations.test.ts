import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

test('0025 adds Phase 3B billing operations schema', () => {
  const sql = readFileSync(
    join(process.cwd(), 'database/migrations/0025_add_phase_3b_billing_operations.up.sql'),
    'utf8'
  );

  assert.match(sql, /CREATE TABLE billing_number_sequences/);
  assert.match(sql, /document_type TEXT NOT NULL CHECK/);
  assert.match(sql, /CREATE TYPE cashier_reconciliation_status AS ENUM/);
  assert.match(sql, /CREATE TABLE cashier_reconciliations/);
  assert.match(sql, /expected_cash_amount NUMERIC\(12, 2\)/);
});

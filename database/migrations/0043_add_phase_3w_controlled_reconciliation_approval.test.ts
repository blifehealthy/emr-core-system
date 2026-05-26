import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('0043 controlled reconciliation approval migration adds approval fields and status', () => {
  const sql = readFileSync(
    'database/migrations/0043_add_phase_3w_controlled_reconciliation_approval.up.sql',
    'utf8'
  );

  assert.match(sql, /pending_approval/);
  assert.match(sql, /approved_by_user_id UUID REFERENCES users\(id\)/);
  assert.match(sql, /approved_at TIMESTAMPTZ/);
  assert.match(sql, /approval_note TEXT/);
});

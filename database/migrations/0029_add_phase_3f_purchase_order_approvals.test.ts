import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

test('0029 adds Phase 3F purchase order approval schema', () => {
  const sql = readFileSync(
    join(process.cwd(), 'database/migrations/0029_add_phase_3f_purchase_order_approvals.up.sql'),
    'utf8'
  );

  assert.match(sql, /CREATE TYPE purchase_order_approval_status AS ENUM/);
  assert.match(sql, /ADD COLUMN approval_status purchase_order_approval_status/);
  assert.match(sql, /submitted_by_user_id UUID REFERENCES users/);
  assert.match(sql, /approved_by_user_id UUID REFERENCES users/);
  assert.match(sql, /rejection_reason TEXT/);
});

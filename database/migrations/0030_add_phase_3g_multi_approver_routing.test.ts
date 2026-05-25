import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

test('0030 adds Phase 3G approval policy and step schema', () => {
  const sql = readFileSync(
    join(process.cwd(), 'database/migrations/0030_add_phase_3g_multi_approver_routing.up.sql'),
    'utf8'
  );

  assert.match(sql, /CREATE TABLE purchase_order_approval_policies/);
  assert.match(sql, /CREATE TABLE purchase_order_approval_steps/);
  assert.match(sql, /CREATE TYPE purchase_order_approval_step_status AS ENUM/);
  assert.match(sql, /min_total_amount NUMERIC\(12, 2\)/);
  assert.match(sql, /approval_sequence INTEGER NOT NULL/);
  assert.match(sql, /required_role VARCHAR\(32\) NOT NULL/);
});

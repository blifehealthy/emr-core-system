import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';

const sql = readFileSync(
  join(process.cwd(), 'database/migrations/0018_add_prescription_safety_override.up.sql'),
  'utf8'
);

test('prescription safety override migration records reason and actor', () => {
  assert.match(sql, /ADD COLUMN safety_override_reason TEXT/);
  assert.match(sql, /ADD COLUMN safety_overridden_at TIMESTAMPTZ/);
  assert.match(sql, /safety_overridden_by_user_id UUID/);
  assert.match(sql, /safety_overridden_by_practitioner_id UUID/);
  assert.match(sql, /chk_prescriptions_safety_override_reason_present/);
});

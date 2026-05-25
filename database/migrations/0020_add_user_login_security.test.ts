import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';

const sql = readFileSync(
  join(process.cwd(), 'database/migrations/0020_add_user_login_security.up.sql'),
  'utf8'
);

test('user login security migration adds session hardening fields', () => {
  assert.match(sql, /ADD COLUMN last_login_at TIMESTAMPTZ/);
  assert.match(sql, /ADD COLUMN failed_login_count INTEGER NOT NULL DEFAULT 0/);
  assert.match(sql, /ADD COLUMN locked_until TIMESTAMPTZ/);
  assert.match(sql, /chk_users_failed_login_count_nonnegative/);
  assert.match(sql, /idx_users_locked_until/);
});

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';

const sql = readFileSync(
  join(process.cwd(), 'database/migrations/0021_add_user_oidc_subject.up.sql'),
  'utf8'
);

test('OIDC subject migration adds active unique user mapping', () => {
  assert.match(sql, /ADD COLUMN oidc_subject VARCHAR\(255\)/);
  assert.match(sql, /CREATE UNIQUE INDEX uq_users_oidc_subject_active/);
  assert.match(sql, /WHERE oidc_subject IS NOT NULL/);
});

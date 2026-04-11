import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const migrationPath = join(
  process.cwd(),
  'database',
  'migrations',
  '0005_add_users_and_practitioners.up.sql'
);

test('users and practitioners migration creates identity tables with role enum and triggers', () => {
  const sql = readFileSync(migrationPath, 'utf8');

  assert.match(sql, /CREATE TYPE app_user_role AS ENUM/);
  assert.match(sql, /CREATE TABLE users \(/);
  assert.match(sql, /CREATE TABLE practitioners \(/);
  assert.match(sql, /CREATE TRIGGER trg_users_set_updated_at/);
  assert.match(sql, /CREATE TRIGGER trg_practitioners_set_updated_at/);
});

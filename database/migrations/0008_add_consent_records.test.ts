import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const migrationPath = join(
  process.cwd(),
  'database',
  'migrations',
  '0008_add_consent_records.up.sql'
);

test('consent records migration creates table, enum, and trigger', () => {
  const sql = readFileSync(migrationPath, 'utf8');

  assert.match(sql, /CREATE TYPE consent_status AS ENUM/);
  assert.match(sql, /CREATE TABLE consent_records \(/);
  assert.match(sql, /captured_by_user_id UUID/);
  assert.match(sql, /CREATE TRIGGER trg_consent_records_set_updated_at/);
});

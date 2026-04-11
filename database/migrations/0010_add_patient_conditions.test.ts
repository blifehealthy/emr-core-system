import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const migrationPath = join(
  process.cwd(),
  'database',
  'migrations',
  '0010_add_patient_conditions.up.sql'
);

test('patient conditions migration creates table, enum, and trigger', () => {
  const sql = readFileSync(migrationPath, 'utf8');

  assert.match(sql, /CREATE TYPE patient_condition_status AS ENUM/);
  assert.match(sql, /CREATE TABLE patient_conditions \(/);
  assert.match(sql, /CREATE TRIGGER trg_patient_conditions_set_updated_at/);
});

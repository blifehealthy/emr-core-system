import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const migrationPath = join(
  process.cwd(),
  'database',
  'migrations',
  '0011_add_patient_medications.up.sql'
);

test('patient medications migration creates table, enum, and trigger', () => {
  const sql = readFileSync(migrationPath, 'utf8');

  assert.match(sql, /CREATE TYPE patient_medication_status AS ENUM/);
  assert.match(sql, /CREATE TABLE patient_medications \(/);
  assert.match(sql, /CREATE TRIGGER trg_patient_medications_set_updated_at/);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const migrationPath = join(
  process.cwd(),
  'database',
  'migrations',
  '0003_add_diagnoses_and_vital_signs.up.sql'
);

const queryPath = join(
  process.cwd(),
  'backend',
  'queries',
  'getPatientWithEncountersAndSOAP.sql'
);

test('diagnoses and vital_signs migration adds soft delete support and updated_at triggers', () => {
  const sql = readFileSync(migrationPath, 'utf8');

  assert.match(sql, /CREATE TABLE diagnoses \(/);
  assert.match(sql, /CREATE TABLE vital_signs \(/);
  assert.match(sql, /deleted_at TIMESTAMPTZ/);
  assert.match(sql, /CREATE TRIGGER trg_diagnoses_set_updated_at/);
  assert.match(sql, /CREATE TRIGGER trg_vital_signs_set_updated_at/);
});

test('patient read query filters deleted diagnoses and vital signs', () => {
  const sql = readFileSync(queryPath, 'utf8');

  assert.match(sql, /d\.deleted_at IS NULL/);
  assert.match(sql, /vs\.deleted_at IS NULL/);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const migrationPath = join(
  process.cwd(),
  'database',
  'migrations',
  '0006_add_prescriptions.up.sql'
);
const patientReadQueryPath = join(
  process.cwd(),
  'backend',
  'queries',
  'getPatientWithEncountersAndSOAP.sql'
);

test('prescriptions migration creates table, enum, and trigger', () => {
  const sql = readFileSync(migrationPath, 'utf8');

  assert.match(sql, /CREATE TYPE prescription_status AS ENUM/);
  assert.match(sql, /CREATE TABLE prescriptions \(/);
  assert.match(sql, /CREATE TRIGGER trg_prescriptions_set_updated_at/);
});

test('patient read query filters deleted prescriptions', () => {
  const sql = readFileSync(patientReadQueryPath, 'utf8');

  assert.match(sql, /LEFT JOIN prescriptions pr/);
  assert.match(sql, /pr\.deleted_at IS NULL/);
});

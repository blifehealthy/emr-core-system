import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const sql = readFileSync(
  join(process.cwd(), 'database/migrations/0012_add_patient_flags.up.sql'),
  'utf8'
);

test('patient flags migration creates status and severity enums plus table', () => {
  assert.match(sql, /CREATE TYPE patient_flag_status AS ENUM/);
  assert.match(sql, /CREATE TYPE patient_flag_severity AS ENUM/);
  assert.match(sql, /CREATE TABLE patient_flags \(/);
  assert.match(sql, /FOREIGN KEY \(patient_id\)/);
  assert.match(sql, /CREATE TRIGGER trg_patient_flags_set_updated_at/);
});

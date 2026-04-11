import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const migrationPath = join(
  process.cwd(),
  'database',
  'migrations',
  '0007_add_appointments.up.sql'
);

test('appointments migration creates table, enum, and encounter foreign key', () => {
  const sql = readFileSync(migrationPath, 'utf8');

  assert.match(sql, /CREATE TYPE appointment_status AS ENUM/);
  assert.match(sql, /CREATE TABLE appointments \(/);
  assert.match(sql, /CREATE TRIGGER trg_appointments_set_updated_at/);
  assert.match(sql, /ALTER TABLE encounters/);
  assert.match(sql, /ADD CONSTRAINT fk_encounters_appointment/);
});

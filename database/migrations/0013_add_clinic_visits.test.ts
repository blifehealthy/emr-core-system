import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const sql = readFileSync(
  join(process.cwd(), 'database', 'migrations', '0013_add_clinic_visits.up.sql'),
  'utf8'
);

test('clinic visits migration creates queue lifecycle table', () => {
  assert.match(sql, /CREATE TYPE clinic_visit_status AS ENUM/);
  assert.match(sql, /CREATE TABLE clinic_visits \(/);
  assert.match(sql, /appointment_id UUID/);
  assert.match(sql, /encounter_id UUID/);
  assert.match(sql, /queue_label VARCHAR/);
  assert.match(sql, /CREATE INDEX idx_clinic_visits_queue_active/);
  assert.match(sql, /CREATE TRIGGER trg_clinic_visits_set_updated_at/);
});

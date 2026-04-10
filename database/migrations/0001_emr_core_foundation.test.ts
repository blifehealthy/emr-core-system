import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const migrationPath = join(
  process.cwd(),
  'database',
  'migrations',
  '0001_emr_core_foundation.up.sql'
);

const queryPath = join(
  process.cwd(),
  'backend',
  'queries',
  'getPatientWithEncountersAndSOAP.sql'
);

test('soap_notes migration includes soft delete support and note type enforcement trigger', () => {
  const sql = readFileSync(migrationPath, 'utf8');

  assert.match(sql, /CREATE TABLE soap_notes \(/);
  assert.match(sql, /deleted_at TIMESTAMPTZ/);
  assert.match(sql, /chk_soap_notes_deleted_after_created/);
  assert.match(sql, /CREATE TRIGGER trg_soap_notes_enforce_note_type/);
});

test('patient read query filters deleted soap notes', () => {
  const sql = readFileSync(queryPath, 'utf8');

  assert.match(sql, /sn\.deleted_at IS NULL/);
});

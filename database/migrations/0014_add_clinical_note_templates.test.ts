import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const sql = readFileSync(
  join(process.cwd(), 'database', 'migrations', '0014_add_clinical_note_templates.up.sql'),
  'utf8'
);

test('clinical note templates migration creates clinic-managed SOAP templates', () => {
  assert.match(sql, /CREATE TABLE clinical_note_templates \(/);
  assert.match(sql, /template_key VARCHAR/);
  assert.match(sql, /subjective TEXT/);
  assert.match(sql, /objective TEXT/);
  assert.match(sql, /assessment TEXT/);
  assert.match(sql, /plan TEXT/);
  assert.match(sql, /uq_clinical_note_templates_key_active/);
  assert.match(sql, /CREATE TRIGGER trg_clinical_note_templates_set_updated_at/);
});

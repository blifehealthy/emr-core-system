import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';

const sql = readFileSync(
  join(process.cwd(), 'database/migrations/0017_add_drug_catalog_and_safety_warnings.up.sql'),
  'utf8'
);

test('drug catalog migration adds catalog and prescription warning snapshot', () => {
  assert.match(sql, /CREATE TABLE drug_catalog \(/);
  assert.match(sql, /allergen_tags TEXT\[\] NOT NULL DEFAULT '\{\}'/);
  assert.match(sql, /ALTER TABLE prescriptions/);
  assert.match(sql, /ADD COLUMN drug_catalog_id UUID/);
  assert.match(sql, /ADD COLUMN safety_warnings JSONB NOT NULL DEFAULT '\[\]'::jsonb/);
  assert.match(sql, /chk_prescriptions_safety_warnings_array/);
});

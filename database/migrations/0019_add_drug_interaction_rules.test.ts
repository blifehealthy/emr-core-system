import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';

const sql = readFileSync(
  join(process.cwd(), 'database/migrations/0019_add_drug_interaction_rules.up.sql'),
  'utf8'
);

test('drug interaction rules migration creates clinic-scoped safety rules', () => {
  assert.match(sql, /CREATE TABLE drug_interaction_rules \(/);
  assert.match(sql, /primary_drug_catalog_id UUID/);
  assert.match(sql, /interacting_rxnorm_code VARCHAR\(64\)/);
  assert.match(sql, /severity VARCHAR\(32\) NOT NULL DEFAULT 'warning'/);
  assert.match(sql, /chk_drug_interaction_rules_primary_present/);
  assert.match(sql, /trg_drug_interaction_rules_set_updated_at/);
});

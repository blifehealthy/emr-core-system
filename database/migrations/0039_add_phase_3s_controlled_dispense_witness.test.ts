import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('phase 3s migration adds controlled dispense witness fields', () => {
  const sql = readFileSync(
    'database/migrations/0039_add_phase_3s_controlled_dispense_witness.up.sql',
    'utf8'
  );

  assert.match(sql, /ALTER TABLE medication_dispenses/);
  assert.match(sql, /witness_user_id UUID REFERENCES users\(id\)/);
  assert.match(sql, /witnessed_at TIMESTAMPTZ/);
  assert.match(sql, /witness_note TEXT/);
  assert.match(sql, /idx_medication_dispenses_witness_active/);
});

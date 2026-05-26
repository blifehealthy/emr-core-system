import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('phase 3t migration adds controlled witness re-auth signature fields', () => {
  const sql = readFileSync(
    'database/migrations/0040_add_phase_3t_controlled_witness_reauth.up.sql',
    'utf8'
  );

  assert.match(sql, /ALTER TABLE medication_dispenses/);
  assert.match(sql, /witness_reauth_method TEXT/);
  assert.match(sql, /witness_reauthenticated_at TIMESTAMPTZ/);
  assert.match(sql, /witness_signature_hash TEXT/);
  assert.match(sql, /idx_medication_dispenses_witness_reauth_active/);
});

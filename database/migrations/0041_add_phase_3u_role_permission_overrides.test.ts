import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('phase 3u migration adds role permission overrides', () => {
  const sql = readFileSync(
    'database/migrations/0041_add_phase_3u_role_permission_overrides.up.sql',
    'utf8'
  );

  assert.match(sql, /CREATE TABLE IF NOT EXISTS role_permission_overrides/);
  assert.match(sql, /clinic_id UUID NOT NULL REFERENCES clinics\(id\)/);
  assert.match(sql, /permission_key VARCHAR\(96\) NOT NULL/);
  assert.match(sql, /is_allowed BOOLEAN NOT NULL/);
  assert.match(sql, /UNIQUE \(clinic_id, role, permission_key\)/);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const sql = readFileSync(
  join(process.cwd(), 'database', 'migrations', '0015_add_clinic_settings.up.sql'),
  'utf8'
);

test('clinic settings migration creates branding settings table', () => {
  assert.match(sql, /CREATE TABLE clinic_settings \(/);
  assert.match(sql, /display_name VARCHAR/);
  assert.match(sql, /prescription_footer TEXT/);
  assert.match(sql, /FOREIGN KEY \(clinic_id\)/);
  assert.match(sql, /CREATE TRIGGER trg_clinic_settings_set_updated_at/);
});

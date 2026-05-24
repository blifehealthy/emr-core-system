import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const sql = readFileSync(
  join(process.cwd(), 'database', 'migrations', '0016_add_clinic_logo_asset.up.sql'),
  'utf8'
);

test('clinic logo asset migration links branding to file assets', () => {
  assert.match(sql, /ADD COLUMN logo_file_asset_id UUID/);
  assert.match(sql, /REFERENCES file_assets \(id\)/);
  assert.match(sql, /ON DELETE SET NULL/);
});

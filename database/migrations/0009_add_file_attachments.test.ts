import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const migrationPath = join(
  process.cwd(),
  'database',
  'migrations',
  '0009_add_file_attachments.up.sql'
);

test('file attachments migration creates file assets and attachment links', () => {
  const sql = readFileSync(migrationPath, 'utf8');

  assert.match(sql, /CREATE TYPE attachment_target_type AS ENUM/);
  assert.match(sql, /CREATE TABLE file_assets \(/);
  assert.match(sql, /CREATE TABLE attachment_links \(/);
  assert.match(sql, /CREATE TRIGGER trg_file_assets_set_updated_at/);
  assert.match(sql, /CREATE TRIGGER trg_attachment_links_set_updated_at/);
});

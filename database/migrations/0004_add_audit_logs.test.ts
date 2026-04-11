import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const migrationPath = join(
  process.cwd(),
  'database',
  'migrations',
  '0004_add_audit_logs.up.sql'
);

test('audit_logs migration creates audit table with entity and actor indexes', () => {
  const sql = readFileSync(migrationPath, 'utf8');

  assert.match(sql, /CREATE TABLE audit_logs \(/);
  assert.match(sql, /metadata JSONB NOT NULL DEFAULT '\{\}'::jsonb/);
  assert.match(sql, /CREATE INDEX idx_audit_logs_entity/);
  assert.match(sql, /CREATE INDEX idx_audit_logs_actor_user/);
});

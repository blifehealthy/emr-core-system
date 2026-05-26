import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

test('0032 adds Phase 3J barcode print job schema', () => {
  const sql = readFileSync(
    join(process.cwd(), 'database/migrations/0032_add_phase_3j_barcode_print_jobs.up.sql'),
    'utf8'
  );

  assert.match(sql, /CREATE TYPE inventory_barcode_print_language AS ENUM/);
  assert.match(sql, /CREATE TABLE inventory_barcode_print_jobs/);
  assert.match(sql, /printer_language inventory_barcode_print_language/);
  assert.match(sql, /rendered_payload TEXT NOT NULL/);
  assert.match(sql, /label_count INTEGER NOT NULL/);
});

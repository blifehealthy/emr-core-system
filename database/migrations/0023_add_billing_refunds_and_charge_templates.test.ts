import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

test('0023 adds invoice refunds and charge templates', () => {
  const sql = readFileSync(
    join(process.cwd(), 'database/migrations/0023_add_billing_refunds_and_charge_templates.up.sql'),
    'utf8'
  );

  assert.match(sql, /ADD COLUMN refunded_amount NUMERIC\(12, 2\)/);
  assert.match(sql, /CREATE TABLE invoice_refunds/);
  assert.match(sql, /CREATE TABLE charge_templates/);
  assert.match(sql, /REFERENCES invoices\(id\) ON DELETE CASCADE/);
  assert.match(sql, /invoice_line_item_type NOT NULL DEFAULT 'procedure'/);
});

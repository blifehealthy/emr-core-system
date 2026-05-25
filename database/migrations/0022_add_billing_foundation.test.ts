import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';

const sql = readFileSync(
  join(process.cwd(), 'database/migrations/0022_add_billing_foundation.up.sql'),
  'utf8'
);

test('billing migration adds invoice, line item, and payment foundation', () => {
  assert.match(sql, /CREATE TYPE invoice_status AS ENUM/);
  assert.match(sql, /CREATE TABLE invoices/);
  assert.match(sql, /CREATE TABLE invoice_line_items/);
  assert.match(sql, /CREATE TABLE invoice_payments/);
  assert.match(sql, /uq_invoices_clinic_number_active/);
  assert.match(sql, /chk_invoice_payments_amount_positive/);
});

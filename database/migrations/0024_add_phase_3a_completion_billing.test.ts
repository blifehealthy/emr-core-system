import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

test('0024 completes Phase 3A billing schema with receipts and claims', () => {
  const sql = readFileSync(
    join(process.cwd(), 'database/migrations/0024_add_phase_3a_completion_billing.up.sql'),
    'utf8'
  );

  assert.match(sql, /ADD COLUMN receipt_number VARCHAR\(64\)/);
  assert.match(sql, /ADD COLUMN tax_invoice_number VARCHAR\(64\)/);
  assert.match(sql, /CREATE TYPE insurance_claim_status AS ENUM/);
  assert.match(sql, /CREATE TABLE insurance_claims/);
  assert.match(sql, /REFERENCES invoices\(id\) ON DELETE CASCADE/);
});

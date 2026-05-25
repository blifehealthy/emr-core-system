import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

test('0028 adds Phase 3E supplier and purchase order schema', () => {
  const sql = readFileSync(
    join(process.cwd(), 'database/migrations/0028_add_phase_3e_procurement.up.sql'),
    'utf8'
  );

  assert.match(sql, /CREATE TABLE suppliers/);
  assert.match(sql, /CREATE TABLE purchase_orders/);
  assert.match(sql, /CREATE TABLE purchase_order_lines/);
  assert.match(sql, /CREATE TYPE purchase_order_status AS ENUM/);
  assert.match(sql, /ADD COLUMN supplier_id UUID REFERENCES suppliers/);
  assert.match(sql, /purchase_order_line_id UUID REFERENCES purchase_order_lines/);
});

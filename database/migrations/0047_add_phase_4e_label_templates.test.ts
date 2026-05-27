import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('0047 label templates migration adds clinic label template management', () => {
  const sql = readFileSync(
    'database/migrations/0047_add_phase_4e_label_templates.up.sql',
    'utf8'
  );

  assert.match(sql, /CREATE TYPE inventory_barcode_label_template_type AS ENUM/);
  assert.match(sql, /CREATE TABLE inventory_barcode_label_templates/);
  assert.match(sql, /enabled_fields JSONB NOT NULL/);
  assert.match(sql, /uq_inventory_barcode_label_templates_clinic_type_default_active/);
  assert.match(sql, /ADD COLUMN label_template_id UUID REFERENCES inventory_barcode_label_templates/);
});

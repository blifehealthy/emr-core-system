ALTER TABLE inventory_barcode_print_jobs
  DROP COLUMN IF EXISTS label_template_id;

DROP TRIGGER IF EXISTS update_inventory_barcode_label_templates_updated_at
  ON inventory_barcode_label_templates;

DROP TABLE IF EXISTS inventory_barcode_label_templates;
DROP TYPE IF EXISTS inventory_barcode_label_template_type;

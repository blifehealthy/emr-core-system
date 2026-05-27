CREATE TYPE inventory_barcode_label_template_type AS ENUM ('item', 'lot', 'bin', 'generic');

CREATE TABLE inventory_barcode_label_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  template_name VARCHAR(160) NOT NULL,
  template_type inventory_barcode_label_template_type NOT NULL DEFAULT 'generic',
  printer_language inventory_barcode_print_language NOT NULL DEFAULT 'zpl',
  width_mm NUMERIC(8, 2),
  height_mm NUMERIC(8, 2),
  enabled_fields JSONB NOT NULL DEFAULT '["title","subtitle","barcode","detail"]'::jsonb,
  header_text TEXT,
  footer_text TEXT,
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE UNIQUE INDEX uq_inventory_barcode_label_templates_clinic_name_active
  ON inventory_barcode_label_templates (clinic_id, template_name)
  WHERE deleted_at IS NULL;

CREATE UNIQUE INDEX uq_inventory_barcode_label_templates_clinic_type_default_active
  ON inventory_barcode_label_templates (clinic_id, template_type)
  WHERE is_default IS TRUE AND is_active IS TRUE AND deleted_at IS NULL;

CREATE INDEX idx_inventory_barcode_label_templates_clinic_active
  ON inventory_barcode_label_templates (clinic_id, template_type, is_active, template_name)
  WHERE deleted_at IS NULL;

CREATE TRIGGER update_inventory_barcode_label_templates_updated_at
BEFORE UPDATE ON inventory_barcode_label_templates
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

ALTER TABLE inventory_barcode_print_jobs
  ADD COLUMN label_template_id UUID REFERENCES inventory_barcode_label_templates(id) ON DELETE SET NULL;

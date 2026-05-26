CREATE TYPE inventory_barcode_print_language AS ENUM ('html', 'zpl', 'escpos');

CREATE TABLE inventory_barcode_print_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  printer_language inventory_barcode_print_language NOT NULL DEFAULT 'html',
  label_count INTEGER NOT NULL CHECK (label_count > 0),
  rendered_payload TEXT NOT NULL,
  requested_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_inventory_barcode_print_jobs_clinic_active
  ON inventory_barcode_print_jobs (clinic_id, requested_at DESC)
  WHERE deleted_at IS NULL;

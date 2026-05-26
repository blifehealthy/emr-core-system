CREATE TYPE inventory_barcode_scan_context AS ENUM ('lookup', 'receiving', 'dispensing');

ALTER TABLE inventory_items
  ADD COLUMN barcode VARCHAR(128),
  ADD COLUMN barcode_required BOOLEAN NOT NULL DEFAULT FALSE;

CREATE UNIQUE INDEX uq_inventory_items_clinic_barcode_active
  ON inventory_items (clinic_id, barcode)
  WHERE barcode IS NOT NULL AND deleted_at IS NULL;

ALTER TABLE inventory_lots
  ADD COLUMN barcode VARCHAR(128),
  ADD COLUMN received_barcode VARCHAR(128),
  ADD COLUMN barcode_verified BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN barcode_verified_at TIMESTAMPTZ,
  ADD COLUMN barcode_verified_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL;

CREATE UNIQUE INDEX uq_inventory_lots_clinic_barcode_active
  ON inventory_lots (clinic_id, barcode)
  WHERE barcode IS NOT NULL AND deleted_at IS NULL;

ALTER TABLE medication_dispenses
  ADD COLUMN scanned_barcode VARCHAR(128),
  ADD COLUMN barcode_verified BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN barcode_verified_at TIMESTAMPTZ;

ALTER TABLE stock_movements
  ADD COLUMN scanned_barcode VARCHAR(128),
  ADD COLUMN barcode_verified BOOLEAN NOT NULL DEFAULT FALSE;

CREATE TABLE inventory_barcode_scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  barcode VARCHAR(128) NOT NULL,
  scan_context inventory_barcode_scan_context NOT NULL DEFAULT 'lookup',
  inventory_item_id UUID REFERENCES inventory_items(id) ON DELETE SET NULL,
  inventory_lot_id UUID REFERENCES inventory_lots(id) ON DELETE SET NULL,
  matched BOOLEAN NOT NULL DEFAULT FALSE,
  scanned_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  scanned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_inventory_barcode_scans_clinic_active
  ON inventory_barcode_scans (clinic_id, scanned_at DESC)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_inventory_barcode_scans_barcode_active
  ON inventory_barcode_scans (clinic_id, barcode, scanned_at DESC)
  WHERE deleted_at IS NULL;

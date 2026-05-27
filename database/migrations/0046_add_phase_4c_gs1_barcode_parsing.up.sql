ALTER TABLE inventory_barcode_scans
  ADD COLUMN gs1_gtin VARCHAR(14),
  ADD COLUMN gs1_lot_number VARCHAR(120),
  ADD COLUMN gs1_expires_on DATE,
  ADD COLUMN gs1_serial_number VARCHAR(120);

CREATE INDEX idx_inventory_barcode_scans_gs1_gtin_active
  ON inventory_barcode_scans (clinic_id, gs1_gtin, scanned_at DESC)
  WHERE gs1_gtin IS NOT NULL AND deleted_at IS NULL;

CREATE INDEX idx_inventory_barcode_scans_gs1_lot_active
  ON inventory_barcode_scans (clinic_id, gs1_lot_number, scanned_at DESC)
  WHERE gs1_lot_number IS NOT NULL AND deleted_at IS NULL;

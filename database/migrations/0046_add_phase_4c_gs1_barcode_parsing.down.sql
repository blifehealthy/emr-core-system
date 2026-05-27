DROP INDEX IF EXISTS idx_inventory_barcode_scans_gs1_lot_active;
DROP INDEX IF EXISTS idx_inventory_barcode_scans_gs1_gtin_active;

ALTER TABLE inventory_barcode_scans
  DROP COLUMN IF EXISTS gs1_serial_number,
  DROP COLUMN IF EXISTS gs1_expires_on,
  DROP COLUMN IF EXISTS gs1_lot_number,
  DROP COLUMN IF EXISTS gs1_gtin;

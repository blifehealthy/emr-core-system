DROP INDEX IF EXISTS idx_inventory_barcode_scans_barcode_active;
DROP INDEX IF EXISTS idx_inventory_barcode_scans_clinic_active;
DROP TABLE IF EXISTS inventory_barcode_scans;

ALTER TABLE stock_movements
  DROP COLUMN IF EXISTS barcode_verified,
  DROP COLUMN IF EXISTS scanned_barcode;

ALTER TABLE medication_dispenses
  DROP COLUMN IF EXISTS barcode_verified_at,
  DROP COLUMN IF EXISTS barcode_verified,
  DROP COLUMN IF EXISTS scanned_barcode;

DROP INDEX IF EXISTS uq_inventory_lots_clinic_barcode_active;

ALTER TABLE inventory_lots
  DROP COLUMN IF EXISTS barcode_verified_by_user_id,
  DROP COLUMN IF EXISTS barcode_verified_at,
  DROP COLUMN IF EXISTS barcode_verified,
  DROP COLUMN IF EXISTS received_barcode,
  DROP COLUMN IF EXISTS barcode;

DROP INDEX IF EXISTS uq_inventory_items_clinic_barcode_active;

ALTER TABLE inventory_items
  DROP COLUMN IF EXISTS barcode_required,
  DROP COLUMN IF EXISTS barcode;

DROP TYPE IF EXISTS inventory_barcode_scan_context;

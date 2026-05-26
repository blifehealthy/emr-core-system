DROP INDEX IF EXISTS idx_stock_movements_location_active;
ALTER TABLE stock_movements
  DROP COLUMN IF EXISTS bin_label,
  DROP COLUMN IF EXISTS inventory_location_id;

DROP INDEX IF EXISTS idx_medication_dispenses_location_active;
ALTER TABLE medication_dispenses
  DROP COLUMN IF EXISTS inventory_location_id;

DROP INDEX IF EXISTS idx_inventory_lots_location_active;
ALTER TABLE inventory_lots
  DROP COLUMN IF EXISTS bin_label,
  DROP COLUMN IF EXISTS inventory_location_id;

DROP TRIGGER IF EXISTS update_inventory_locations_updated_at ON inventory_locations;
DROP INDEX IF EXISTS idx_inventory_locations_clinic_active;
DROP INDEX IF EXISTS uq_inventory_locations_clinic_default_active;
DROP INDEX IF EXISTS uq_inventory_locations_clinic_code_active;
DROP TABLE IF EXISTS inventory_locations;

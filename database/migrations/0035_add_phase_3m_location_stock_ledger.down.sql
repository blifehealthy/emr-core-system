DROP INDEX IF EXISTS idx_inventory_transfers_item_active;
DROP INDEX IF EXISTS idx_inventory_transfers_clinic_active;
DROP TABLE IF EXISTS inventory_transfers;

DROP TRIGGER IF EXISTS update_inventory_location_stocks_updated_at ON inventory_location_stocks;
DROP INDEX IF EXISTS idx_inventory_location_stocks_item_active;
DROP INDEX IF EXISTS idx_inventory_location_stocks_clinic_location_active;
DROP INDEX IF EXISTS uq_inventory_location_stocks_item_location_bin_active;
DROP TABLE IF EXISTS inventory_location_stocks;

DROP TYPE IF EXISTS inventory_transfer_status;

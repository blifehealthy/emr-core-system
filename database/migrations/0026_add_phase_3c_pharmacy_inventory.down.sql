DROP TABLE IF EXISTS stock_movements;

DROP TRIGGER IF EXISTS update_medication_dispenses_updated_at ON medication_dispenses;
DROP TABLE IF EXISTS medication_dispenses;

DROP TRIGGER IF EXISTS update_inventory_items_updated_at ON inventory_items;
DROP TABLE IF EXISTS inventory_items;

DROP TYPE IF EXISTS medication_dispense_status;
DROP TYPE IF EXISTS stock_movement_type;

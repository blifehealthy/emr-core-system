DROP INDEX IF EXISTS idx_stock_movements_lot_active;
ALTER TABLE stock_movements
  DROP COLUMN IF EXISTS inventory_lot_id;

DROP INDEX IF EXISTS idx_medication_dispenses_lot_active;
ALTER TABLE medication_dispenses
  DROP COLUMN IF EXISTS inventory_lot_id;

DROP TRIGGER IF EXISTS update_inventory_lots_updated_at ON inventory_lots;
DROP TABLE IF EXISTS inventory_lots;

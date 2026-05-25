DROP INDEX IF EXISTS idx_inventory_lots_purchase_order_active;
DROP INDEX IF EXISTS idx_inventory_lots_supplier_active;

ALTER TABLE inventory_lots
  DROP COLUMN IF EXISTS purchase_order_line_id,
  DROP COLUMN IF EXISTS purchase_order_id,
  DROP COLUMN IF EXISTS supplier_id;

DROP TRIGGER IF EXISTS update_purchase_order_lines_updated_at ON purchase_order_lines;
DROP TABLE IF EXISTS purchase_order_lines;

DROP TRIGGER IF EXISTS update_purchase_orders_updated_at ON purchase_orders;
DROP TABLE IF EXISTS purchase_orders;

DROP TRIGGER IF EXISTS update_suppliers_updated_at ON suppliers;
DROP TABLE IF EXISTS suppliers;

DROP TYPE IF EXISTS purchase_order_status;
DROP TYPE IF EXISTS supplier_status;

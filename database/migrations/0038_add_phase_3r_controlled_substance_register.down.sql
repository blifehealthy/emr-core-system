DROP INDEX IF EXISTS idx_inventory_items_controlled_active;

ALTER TABLE inventory_items
  DROP COLUMN IF EXISTS controlled_substance_schedule,
  DROP COLUMN IF EXISTS is_controlled_substance;

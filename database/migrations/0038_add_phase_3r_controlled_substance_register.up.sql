ALTER TABLE inventory_items
  ADD COLUMN IF NOT EXISTS is_controlled_substance BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS controlled_substance_schedule VARCHAR(64);

CREATE INDEX IF NOT EXISTS idx_inventory_items_controlled_active
  ON inventory_items (clinic_id, is_controlled_substance, display_name)
  WHERE deleted_at IS NULL;

DROP INDEX IF EXISTS idx_inventory_transfers_status_active;
DROP INDEX IF EXISTS idx_inventory_transfers_lot_active;

DROP TRIGGER IF EXISTS update_inventory_transfers_updated_at ON inventory_transfers;

ALTER TABLE inventory_transfers
  DROP COLUMN IF EXISTS updated_at,
  DROP COLUMN IF EXISTS cancellation_reason,
  DROP COLUMN IF EXISTS cancelled_by_user_id,
  DROP COLUMN IF EXISTS cancelled_at,
  DROP COLUMN IF EXISTS received_by_user_id,
  DROP COLUMN IF EXISTS received_at,
  DROP COLUMN IF EXISTS approved_by_user_id,
  DROP COLUMN IF EXISTS approved_at,
  DROP COLUMN IF EXISTS requested_by_user_id,
  DROP COLUMN IF EXISTS requested_at,
  DROP COLUMN IF EXISTS inventory_lot_id;

-- PostgreSQL cannot remove enum values without recreating the type.

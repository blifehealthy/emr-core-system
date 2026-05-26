DROP INDEX IF EXISTS idx_inventory_transfers_fefo_recommended_lot_active;
DROP INDEX IF EXISTS idx_medication_dispenses_fefo_recommended_lot_active;

ALTER TABLE inventory_transfers
  DROP COLUMN IF EXISTS fefo_recommended_lot_id,
  DROP COLUMN IF EXISTS fefo_override_reason,
  DROP COLUMN IF EXISTS expiry_override_reason;

ALTER TABLE medication_dispenses
  DROP COLUMN IF EXISTS fefo_recommended_lot_id,
  DROP COLUMN IF EXISTS fefo_override_reason,
  DROP COLUMN IF EXISTS expiry_override_reason;

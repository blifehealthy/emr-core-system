ALTER TABLE medication_dispenses
  ADD COLUMN expiry_override_reason TEXT,
  ADD COLUMN fefo_override_reason TEXT,
  ADD COLUMN fefo_recommended_lot_id UUID REFERENCES inventory_lots(id) ON DELETE SET NULL;

ALTER TABLE inventory_transfers
  ADD COLUMN expiry_override_reason TEXT,
  ADD COLUMN fefo_override_reason TEXT,
  ADD COLUMN fefo_recommended_lot_id UUID REFERENCES inventory_lots(id) ON DELETE SET NULL;

CREATE INDEX idx_medication_dispenses_fefo_recommended_lot_active
  ON medication_dispenses (fefo_recommended_lot_id, dispensed_at DESC)
  WHERE fefo_recommended_lot_id IS NOT NULL AND deleted_at IS NULL;

CREATE INDEX idx_inventory_transfers_fefo_recommended_lot_active
  ON inventory_transfers (fefo_recommended_lot_id, transferred_at DESC)
  WHERE fefo_recommended_lot_id IS NOT NULL AND deleted_at IS NULL;

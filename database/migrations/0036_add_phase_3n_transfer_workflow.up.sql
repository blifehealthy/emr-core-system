ALTER TYPE inventory_transfer_status ADD VALUE IF NOT EXISTS 'pending';
ALTER TYPE inventory_transfer_status ADD VALUE IF NOT EXISTS 'in_transit';

ALTER TABLE inventory_transfers
  ADD COLUMN inventory_lot_id UUID REFERENCES inventory_lots(id) ON DELETE SET NULL,
  ADD COLUMN requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ADD COLUMN requested_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN approved_at TIMESTAMPTZ,
  ADD COLUMN approved_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN received_at TIMESTAMPTZ,
  ADD COLUMN received_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN cancelled_at TIMESTAMPTZ,
  ADD COLUMN cancelled_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN cancellation_reason TEXT,
  ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

CREATE TRIGGER update_inventory_transfers_updated_at
BEFORE UPDATE ON inventory_transfers
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE INDEX idx_inventory_transfers_lot_active
  ON inventory_transfers (inventory_lot_id, transferred_at DESC)
  WHERE inventory_lot_id IS NOT NULL AND deleted_at IS NULL;

CREATE INDEX idx_inventory_transfers_status_active
  ON inventory_transfers (clinic_id, status, transferred_at DESC)
  WHERE deleted_at IS NULL;

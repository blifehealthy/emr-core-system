CREATE TABLE inventory_lots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  inventory_item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE RESTRICT,
  lot_number VARCHAR(128) NOT NULL,
  expires_on DATE,
  received_quantity NUMERIC(12, 2) NOT NULL CHECK (received_quantity > 0),
  quantity_on_hand NUMERIC(12, 2) NOT NULL CHECK (quantity_on_hand >= 0),
  received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  supplier_name VARCHAR(255),
  reference_number VARCHAR(128),
  received_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE UNIQUE INDEX uq_inventory_lots_item_lot_active
  ON inventory_lots (inventory_item_id, lot_number)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_inventory_lots_clinic_expiry_active
  ON inventory_lots (clinic_id, expires_on, quantity_on_hand)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_inventory_lots_item_active
  ON inventory_lots (inventory_item_id, expires_on, quantity_on_hand)
  WHERE deleted_at IS NULL;

CREATE TRIGGER update_inventory_lots_updated_at
BEFORE UPDATE ON inventory_lots
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

ALTER TABLE medication_dispenses
  ADD COLUMN inventory_lot_id UUID REFERENCES inventory_lots(id) ON DELETE SET NULL;

CREATE INDEX idx_medication_dispenses_lot_active
  ON medication_dispenses (inventory_lot_id, dispensed_at DESC)
  WHERE inventory_lot_id IS NOT NULL AND deleted_at IS NULL;

ALTER TABLE stock_movements
  ADD COLUMN inventory_lot_id UUID REFERENCES inventory_lots(id) ON DELETE SET NULL;

CREATE INDEX idx_stock_movements_lot_active
  ON stock_movements (inventory_lot_id, moved_at DESC)
  WHERE inventory_lot_id IS NOT NULL AND deleted_at IS NULL;

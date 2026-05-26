CREATE TYPE inventory_transfer_status AS ENUM ('completed', 'cancelled');

CREATE TABLE inventory_location_stocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  inventory_item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE RESTRICT,
  inventory_location_id UUID NOT NULL REFERENCES inventory_locations(id) ON DELETE RESTRICT,
  bin_label VARCHAR(128),
  quantity_on_hand NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (quantity_on_hand >= 0),
  reorder_level NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (reorder_level >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE UNIQUE INDEX uq_inventory_location_stocks_item_location_bin_active
  ON inventory_location_stocks (
    inventory_item_id,
    inventory_location_id,
    COALESCE(bin_label, '')
  )
  WHERE deleted_at IS NULL;

CREATE INDEX idx_inventory_location_stocks_clinic_location_active
  ON inventory_location_stocks (clinic_id, inventory_location_id, quantity_on_hand)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_inventory_location_stocks_item_active
  ON inventory_location_stocks (inventory_item_id, quantity_on_hand)
  WHERE deleted_at IS NULL;

CREATE TRIGGER update_inventory_location_stocks_updated_at
BEFORE UPDATE ON inventory_location_stocks
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TABLE inventory_transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  inventory_item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE RESTRICT,
  from_inventory_location_id UUID NOT NULL REFERENCES inventory_locations(id) ON DELETE RESTRICT,
  to_inventory_location_id UUID NOT NULL REFERENCES inventory_locations(id) ON DELETE RESTRICT,
  from_bin_label VARCHAR(128),
  to_bin_label VARCHAR(128),
  quantity NUMERIC(12, 2) NOT NULL CHECK (quantity > 0),
  status inventory_transfer_status NOT NULL DEFAULT 'completed',
  transferred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  transferred_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_inventory_transfers_clinic_active
  ON inventory_transfers (clinic_id, transferred_at DESC)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_inventory_transfers_item_active
  ON inventory_transfers (inventory_item_id, transferred_at DESC)
  WHERE deleted_at IS NULL;

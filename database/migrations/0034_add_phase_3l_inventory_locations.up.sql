CREATE TABLE inventory_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  location_code VARCHAR(64) NOT NULL,
  display_name VARCHAR(160) NOT NULL,
  location_type VARCHAR(64) NOT NULL DEFAULT 'pharmacy',
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE UNIQUE INDEX uq_inventory_locations_clinic_code_active
  ON inventory_locations (clinic_id, location_code)
  WHERE deleted_at IS NULL;

CREATE UNIQUE INDEX uq_inventory_locations_clinic_default_active
  ON inventory_locations (clinic_id)
  WHERE is_default IS TRUE AND is_active IS TRUE AND deleted_at IS NULL;

CREATE INDEX idx_inventory_locations_clinic_active
  ON inventory_locations (clinic_id, is_active, display_name)
  WHERE deleted_at IS NULL;

CREATE TRIGGER update_inventory_locations_updated_at
BEFORE UPDATE ON inventory_locations
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

ALTER TABLE inventory_lots
  ADD COLUMN inventory_location_id UUID REFERENCES inventory_locations(id) ON DELETE SET NULL,
  ADD COLUMN bin_label VARCHAR(128);

CREATE INDEX idx_inventory_lots_location_active
  ON inventory_lots (inventory_location_id, expires_on, quantity_on_hand)
  WHERE inventory_location_id IS NOT NULL AND deleted_at IS NULL;

ALTER TABLE medication_dispenses
  ADD COLUMN inventory_location_id UUID REFERENCES inventory_locations(id) ON DELETE SET NULL;

CREATE INDEX idx_medication_dispenses_location_active
  ON medication_dispenses (inventory_location_id, dispensed_at DESC)
  WHERE inventory_location_id IS NOT NULL AND deleted_at IS NULL;

ALTER TABLE stock_movements
  ADD COLUMN inventory_location_id UUID REFERENCES inventory_locations(id) ON DELETE SET NULL,
  ADD COLUMN bin_label VARCHAR(128);

CREATE INDEX idx_stock_movements_location_active
  ON stock_movements (inventory_location_id, moved_at DESC)
  WHERE inventory_location_id IS NOT NULL AND deleted_at IS NULL;

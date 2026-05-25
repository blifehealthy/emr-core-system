CREATE TYPE stock_movement_type AS ENUM ('adjustment_in', 'adjustment_out', 'dispense', 'return');
CREATE TYPE medication_dispense_status AS ENUM ('dispensed', 'voided');

CREATE TABLE inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  drug_catalog_id UUID REFERENCES drug_catalog(id) ON DELETE SET NULL,
  item_code VARCHAR(64) NOT NULL,
  display_name VARCHAR(255) NOT NULL,
  unit VARCHAR(64) NOT NULL DEFAULT 'unit',
  quantity_on_hand NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (quantity_on_hand >= 0),
  reorder_level NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (reorder_level >= 0),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE UNIQUE INDEX uq_inventory_items_clinic_code_active
  ON inventory_items (clinic_id, item_code)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_inventory_items_clinic_active
  ON inventory_items (clinic_id, is_active, display_name)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_inventory_items_drug_catalog_active
  ON inventory_items (drug_catalog_id)
  WHERE drug_catalog_id IS NOT NULL AND deleted_at IS NULL;

CREATE TRIGGER update_inventory_items_updated_at
BEFORE UPDATE ON inventory_items
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TABLE medication_dispenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  prescription_id UUID NOT NULL REFERENCES prescriptions(id) ON DELETE CASCADE,
  inventory_item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE RESTRICT,
  status medication_dispense_status NOT NULL DEFAULT 'dispensed',
  quantity NUMERIC(12, 2) NOT NULL CHECK (quantity > 0),
  dispensed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  dispensed_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_medication_dispenses_prescription_active
  ON medication_dispenses (prescription_id, dispensed_at DESC)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_medication_dispenses_clinic_active
  ON medication_dispenses (clinic_id, dispensed_at DESC)
  WHERE deleted_at IS NULL;

CREATE TRIGGER update_medication_dispenses_updated_at
BEFORE UPDATE ON medication_dispenses
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TABLE stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  inventory_item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE RESTRICT,
  prescription_id UUID REFERENCES prescriptions(id) ON DELETE SET NULL,
  medication_dispense_id UUID REFERENCES medication_dispenses(id) ON DELETE SET NULL,
  movement_type stock_movement_type NOT NULL,
  quantity NUMERIC(12, 2) NOT NULL CHECK (quantity > 0),
  quantity_before NUMERIC(12, 2) NOT NULL CHECK (quantity_before >= 0),
  quantity_after NUMERIC(12, 2) NOT NULL CHECK (quantity_after >= 0),
  reason TEXT,
  performed_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  moved_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_stock_movements_item_active
  ON stock_movements (inventory_item_id, moved_at DESC)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_stock_movements_clinic_active
  ON stock_movements (clinic_id, moved_at DESC)
  WHERE deleted_at IS NULL;

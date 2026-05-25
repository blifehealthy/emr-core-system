CREATE TYPE supplier_status AS ENUM ('active', 'inactive');
CREATE TYPE purchase_order_status AS ENUM (
  'draft',
  'ordered',
  'partially_received',
  'received',
  'cancelled'
);

CREATE TABLE suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  supplier_code VARCHAR(64) NOT NULL,
  display_name VARCHAR(255) NOT NULL,
  contact_name VARCHAR(255),
  phone_number VARCHAR(64),
  email VARCHAR(255),
  address TEXT,
  status supplier_status NOT NULL DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE UNIQUE INDEX uq_suppliers_clinic_code_active
  ON suppliers (clinic_id, supplier_code)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_suppliers_clinic_status_active
  ON suppliers (clinic_id, status, display_name)
  WHERE deleted_at IS NULL;

CREATE TRIGGER update_suppliers_updated_at
BEFORE UPDATE ON suppliers
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TABLE purchase_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  purchase_order_number VARCHAR(64) NOT NULL,
  status purchase_order_status NOT NULL DEFAULT 'draft',
  ordered_at TIMESTAMPTZ,
  expected_at DATE,
  received_at TIMESTAMPTZ,
  created_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE UNIQUE INDEX uq_purchase_orders_clinic_number_active
  ON purchase_orders (clinic_id, purchase_order_number)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_purchase_orders_clinic_status_active
  ON purchase_orders (clinic_id, status, created_at DESC)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_purchase_orders_supplier_active
  ON purchase_orders (supplier_id, created_at DESC)
  WHERE supplier_id IS NOT NULL AND deleted_at IS NULL;

CREATE TRIGGER update_purchase_orders_updated_at
BEFORE UPDATE ON purchase_orders
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TABLE purchase_order_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_order_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
  inventory_item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE RESTRICT,
  description VARCHAR(255) NOT NULL,
  ordered_quantity NUMERIC(12, 2) NOT NULL CHECK (ordered_quantity > 0),
  received_quantity NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (received_quantity >= 0),
  unit_price_amount NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (unit_price_amount >= 0),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_purchase_order_lines_order_active
  ON purchase_order_lines (purchase_order_id)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_purchase_order_lines_inventory_item_active
  ON purchase_order_lines (inventory_item_id)
  WHERE deleted_at IS NULL;

CREATE TRIGGER update_purchase_order_lines_updated_at
BEFORE UPDATE ON purchase_order_lines
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

ALTER TABLE inventory_lots
  ADD COLUMN supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  ADD COLUMN purchase_order_id UUID REFERENCES purchase_orders(id) ON DELETE SET NULL,
  ADD COLUMN purchase_order_line_id UUID REFERENCES purchase_order_lines(id) ON DELETE SET NULL;

CREATE INDEX idx_inventory_lots_supplier_active
  ON inventory_lots (supplier_id, received_at DESC)
  WHERE supplier_id IS NOT NULL AND deleted_at IS NULL;

CREATE INDEX idx_inventory_lots_purchase_order_active
  ON inventory_lots (purchase_order_id, received_at DESC)
  WHERE purchase_order_id IS NOT NULL AND deleted_at IS NULL;

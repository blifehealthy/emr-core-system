CREATE TYPE purchase_order_approval_step_status AS ENUM (
  'pending',
  'approved',
  'rejected',
  'skipped'
);

CREATE TABLE purchase_order_approval_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  policy_name VARCHAR(255) NOT NULL,
  min_total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (min_total_amount >= 0),
  max_total_amount NUMERIC(12, 2) CHECK (max_total_amount IS NULL OR max_total_amount >= min_total_amount),
  approval_sequence INTEGER NOT NULL CHECK (approval_sequence > 0),
  required_role VARCHAR(32) NOT NULL DEFAULT 'admin'
    CHECK (required_role IN ('doctor', 'nurse', 'admin')),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_purchase_order_approval_policies_clinic_active
  ON purchase_order_approval_policies (clinic_id, is_active, min_total_amount, approval_sequence)
  WHERE deleted_at IS NULL;

CREATE TRIGGER update_purchase_order_approval_policies_updated_at
BEFORE UPDATE ON purchase_order_approval_policies
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TABLE purchase_order_approval_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_order_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
  policy_id UUID REFERENCES purchase_order_approval_policies(id) ON DELETE SET NULL,
  approval_sequence INTEGER NOT NULL CHECK (approval_sequence > 0),
  required_role VARCHAR(32) NOT NULL DEFAULT 'admin'
    CHECK (required_role IN ('doctor', 'nurse', 'admin')),
  status purchase_order_approval_step_status NOT NULL DEFAULT 'pending',
  approved_at TIMESTAMPTZ,
  approved_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  rejected_at TIMESTAMPTZ,
  rejected_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  rejection_reason TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_purchase_order_approval_steps_order_active
  ON purchase_order_approval_steps (purchase_order_id, approval_sequence)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_purchase_order_approval_steps_status_active
  ON purchase_order_approval_steps (status, required_role, created_at DESC)
  WHERE deleted_at IS NULL;

CREATE TRIGGER update_purchase_order_approval_steps_updated_at
BEFORE UPDATE ON purchase_order_approval_steps
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

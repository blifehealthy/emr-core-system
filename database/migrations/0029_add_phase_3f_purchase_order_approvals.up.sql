CREATE TYPE purchase_order_approval_status AS ENUM (
  'draft',
  'pending_approval',
  'approved',
  'rejected'
);

ALTER TABLE purchase_orders
  ADD COLUMN approval_status purchase_order_approval_status NOT NULL DEFAULT 'draft',
  ADD COLUMN submitted_at TIMESTAMPTZ,
  ADD COLUMN submitted_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN approved_at TIMESTAMPTZ,
  ADD COLUMN approved_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN rejected_at TIMESTAMPTZ,
  ADD COLUMN rejected_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN rejection_reason TEXT;

CREATE INDEX idx_purchase_orders_approval_status_active
  ON purchase_orders (clinic_id, approval_status, created_at DESC)
  WHERE deleted_at IS NULL;

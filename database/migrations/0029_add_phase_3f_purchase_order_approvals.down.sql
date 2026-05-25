DROP INDEX IF EXISTS idx_purchase_orders_approval_status_active;

ALTER TABLE purchase_orders
  DROP COLUMN IF EXISTS rejection_reason,
  DROP COLUMN IF EXISTS rejected_by_user_id,
  DROP COLUMN IF EXISTS rejected_at,
  DROP COLUMN IF EXISTS approved_by_user_id,
  DROP COLUMN IF EXISTS approved_at,
  DROP COLUMN IF EXISTS submitted_by_user_id,
  DROP COLUMN IF EXISTS submitted_at,
  DROP COLUMN IF EXISTS approval_status;

DROP TYPE IF EXISTS purchase_order_approval_status;

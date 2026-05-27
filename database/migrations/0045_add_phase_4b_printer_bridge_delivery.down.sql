DROP INDEX IF EXISTS idx_inventory_barcode_print_jobs_bridge_queue;

ALTER TABLE inventory_barcode_print_jobs
  DROP CONSTRAINT IF EXISTS inventory_barcode_print_jobs_delivery_status_check;

ALTER TABLE inventory_barcode_print_jobs
  DROP COLUMN IF EXISTS delivered_at,
  DROP COLUMN IF EXISTS delivery_updated_at,
  DROP COLUMN IF EXISTS delivery_updated_by_user_id,
  DROP COLUMN IF EXISTS last_delivery_error,
  DROP COLUMN IF EXISTS delivery_attempt_count;

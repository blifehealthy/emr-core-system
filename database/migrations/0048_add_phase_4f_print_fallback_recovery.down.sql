DROP INDEX IF EXISTS idx_inventory_barcode_print_jobs_fallback_recovery;

ALTER TABLE inventory_barcode_print_jobs
  DROP CONSTRAINT IF EXISTS inventory_barcode_print_jobs_fallback_status_check;

ALTER TABLE inventory_barcode_print_jobs
  DROP COLUMN IF EXISTS retry_requested_at,
  DROP COLUMN IF EXISTS retry_requested_by_user_id,
  DROP COLUMN IF EXISTS fallback_requested_at,
  DROP COLUMN IF EXISTS fallback_requested_by_user_id,
  DROP COLUMN IF EXISTS fallback_reason,
  DROP COLUMN IF EXISTS fallback_status;

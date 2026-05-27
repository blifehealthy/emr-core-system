ALTER TABLE inventory_barcode_print_jobs
  ADD COLUMN fallback_status VARCHAR(32) NOT NULL DEFAULT 'none',
  ADD COLUMN fallback_reason TEXT,
  ADD COLUMN fallback_requested_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN fallback_requested_at TIMESTAMPTZ,
  ADD COLUMN retry_requested_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN retry_requested_at TIMESTAMPTZ;

ALTER TABLE inventory_barcode_print_jobs
  ADD CONSTRAINT inventory_barcode_print_jobs_fallback_status_check
  CHECK (fallback_status IN ('none', 'browser_export', 'manual_print', 'retry_queued'));

CREATE INDEX idx_inventory_barcode_print_jobs_fallback_recovery
  ON inventory_barcode_print_jobs (clinic_id, fallback_status, delivery_status, requested_at)
  WHERE deleted_at IS NULL;

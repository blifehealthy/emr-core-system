ALTER TABLE inventory_barcode_print_jobs
  ADD COLUMN delivery_attempt_count INTEGER NOT NULL DEFAULT 0 CHECK (delivery_attempt_count >= 0),
  ADD COLUMN last_delivery_error TEXT,
  ADD COLUMN delivery_updated_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN delivery_updated_at TIMESTAMPTZ,
  ADD COLUMN delivered_at TIMESTAMPTZ;

ALTER TABLE inventory_barcode_print_jobs
  ADD CONSTRAINT inventory_barcode_print_jobs_delivery_status_check
  CHECK (delivery_status IN ('exported', 'queued', 'printing', 'delivered', 'failed', 'cancelled'));

CREATE INDEX idx_inventory_barcode_print_jobs_bridge_queue
  ON inventory_barcode_print_jobs (clinic_id, delivery_status, connection_type, requested_at)
  WHERE deleted_at IS NULL;

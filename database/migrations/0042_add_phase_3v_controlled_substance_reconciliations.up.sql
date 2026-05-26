CREATE TABLE IF NOT EXISTS controlled_substance_reconciliations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  reconciliation_date DATE NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'open'
    CHECK (status IN ('open', 'closed', 'cancelled')),
  controlled_item_count INTEGER NOT NULL DEFAULT 0,
  expected_quantity NUMERIC(12, 2) NOT NULL DEFAULT 0,
  counted_quantity NUMERIC(12, 2),
  variance_quantity NUMERIC(12, 2),
  variance_reason TEXT,
  opened_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  closed_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  opened_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  closed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  UNIQUE (clinic_id, reconciliation_date)
);

CREATE INDEX IF NOT EXISTS idx_controlled_substance_reconciliations_clinic_status_active
  ON controlled_substance_reconciliations (clinic_id, status, reconciliation_date DESC)
  WHERE deleted_at IS NULL;

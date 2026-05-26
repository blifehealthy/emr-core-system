ALTER TABLE controlled_substance_reconciliations
  DROP CONSTRAINT IF EXISTS controlled_substance_reconciliations_status_check;

ALTER TABLE controlled_substance_reconciliations
  ADD CONSTRAINT controlled_substance_reconciliations_status_check
  CHECK (status IN ('open', 'pending_approval', 'closed', 'cancelled'));

ALTER TABLE controlled_substance_reconciliations
  ADD COLUMN IF NOT EXISTS approved_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS approval_note TEXT;

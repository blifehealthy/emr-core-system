ALTER TABLE controlled_substance_reconciliations
  DROP COLUMN IF EXISTS approval_note,
  DROP COLUMN IF EXISTS approved_at,
  DROP COLUMN IF EXISTS approved_by_user_id;

ALTER TABLE controlled_substance_reconciliations
  DROP CONSTRAINT IF EXISTS controlled_substance_reconciliations_status_check;

ALTER TABLE controlled_substance_reconciliations
  ADD CONSTRAINT controlled_substance_reconciliations_status_check
  CHECK (status IN ('open', 'closed', 'cancelled'));

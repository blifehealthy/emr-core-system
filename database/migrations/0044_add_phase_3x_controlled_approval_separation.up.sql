ALTER TABLE controlled_substance_reconciliations
  DROP CONSTRAINT IF EXISTS controlled_substance_reconciliations_approver_not_closer;

ALTER TABLE controlled_substance_reconciliations
  ADD CONSTRAINT controlled_substance_reconciliations_approver_not_closer
  CHECK (
    approved_by_user_id IS NULL
    OR closed_by_user_id IS NULL
    OR approved_by_user_id <> closed_by_user_id
  );

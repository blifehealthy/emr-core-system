DROP INDEX IF EXISTS idx_medication_dispenses_witness_active;

ALTER TABLE medication_dispenses
  DROP COLUMN IF EXISTS witness_note,
  DROP COLUMN IF EXISTS witnessed_at,
  DROP COLUMN IF EXISTS witness_user_id;

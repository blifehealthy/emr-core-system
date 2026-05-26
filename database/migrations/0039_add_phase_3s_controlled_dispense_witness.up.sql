ALTER TABLE medication_dispenses
  ADD COLUMN IF NOT EXISTS witness_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS witnessed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS witness_note TEXT;

CREATE INDEX IF NOT EXISTS idx_medication_dispenses_witness_active
  ON medication_dispenses (witness_user_id, dispensed_at DESC)
  WHERE witness_user_id IS NOT NULL AND deleted_at IS NULL;

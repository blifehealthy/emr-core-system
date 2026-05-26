ALTER TABLE medication_dispenses
  ADD COLUMN IF NOT EXISTS witness_reauth_method TEXT,
  ADD COLUMN IF NOT EXISTS witness_reauthenticated_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS witness_signature_hash TEXT;

CREATE INDEX IF NOT EXISTS idx_medication_dispenses_witness_reauth_active
  ON medication_dispenses (witness_reauthenticated_at DESC)
  WHERE witness_reauthenticated_at IS NOT NULL AND deleted_at IS NULL;

DROP INDEX IF EXISTS idx_medication_dispenses_witness_reauth_active;

ALTER TABLE medication_dispenses
  DROP COLUMN IF EXISTS witness_signature_hash,
  DROP COLUMN IF EXISTS witness_reauthenticated_at,
  DROP COLUMN IF EXISTS witness_reauth_method;

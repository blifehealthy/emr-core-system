ALTER TABLE prescriptions
    DROP CONSTRAINT IF EXISTS chk_prescriptions_safety_override_reason_present,
    DROP CONSTRAINT IF EXISTS fk_prescriptions_safety_override_practitioner,
    DROP CONSTRAINT IF EXISTS fk_prescriptions_safety_override_user,
    DROP COLUMN IF EXISTS safety_overridden_by_practitioner_id,
    DROP COLUMN IF EXISTS safety_overridden_by_user_id,
    DROP COLUMN IF EXISTS safety_overridden_at,
    DROP COLUMN IF EXISTS safety_override_reason;

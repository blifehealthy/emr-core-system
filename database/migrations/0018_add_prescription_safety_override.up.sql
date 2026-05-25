ALTER TABLE prescriptions
    ADD COLUMN safety_override_reason TEXT,
    ADD COLUMN safety_overridden_at TIMESTAMPTZ,
    ADD COLUMN safety_overridden_by_user_id UUID,
    ADD COLUMN safety_overridden_by_practitioner_id UUID,
    ADD CONSTRAINT fk_prescriptions_safety_override_user
        FOREIGN KEY (safety_overridden_by_user_id)
        REFERENCES users (id)
        ON DELETE SET NULL,
    ADD CONSTRAINT fk_prescriptions_safety_override_practitioner
        FOREIGN KEY (safety_overridden_by_practitioner_id)
        REFERENCES practitioners (id)
        ON DELETE SET NULL,
    ADD CONSTRAINT chk_prescriptions_safety_override_reason_present
        CHECK (
            safety_overridden_at IS NULL
            OR NULLIF(BTRIM(safety_override_reason), '') IS NOT NULL
        );

CREATE TYPE consent_status AS ENUM (
    'granted',
    'revoked',
    'expired',
    'declined'
);

CREATE TABLE consent_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL,
    patient_id UUID NOT NULL,
    consent_type VARCHAR(100) NOT NULL,
    status consent_status NOT NULL DEFAULT 'granted',
    granted_at TIMESTAMPTZ,
    revoked_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    captured_by_user_id UUID,
    document_reference VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    CONSTRAINT fk_consent_records_clinic
        FOREIGN KEY (clinic_id)
        REFERENCES clinics (id)
        ON DELETE RESTRICT,
    CONSTRAINT fk_consent_records_patient
        FOREIGN KEY (patient_id)
        REFERENCES patients (id)
        ON DELETE RESTRICT,
    CONSTRAINT fk_consent_records_captured_by_user
        FOREIGN KEY (captured_by_user_id)
        REFERENCES users (id)
        ON DELETE SET NULL,
    CONSTRAINT chk_consent_records_deleted_after_created
        CHECK (deleted_at IS NULL OR deleted_at >= created_at),
    CONSTRAINT chk_consent_records_revoked_after_granted
        CHECK (revoked_at IS NULL OR granted_at IS NULL OR revoked_at >= granted_at),
    CONSTRAINT chk_consent_records_expires_after_granted
        CHECK (expires_at IS NULL OR granted_at IS NULL OR expires_at >= granted_at)
);

CREATE INDEX idx_consent_records_patient_created_at_active
    ON consent_records (patient_id, created_at DESC)
    WHERE deleted_at IS NULL;

CREATE INDEX idx_consent_records_clinic_status_active
    ON consent_records (clinic_id, status, created_at DESC)
    WHERE deleted_at IS NULL;

CREATE INDEX idx_consent_records_captured_by_user_active
    ON consent_records (captured_by_user_id, created_at DESC)
    WHERE deleted_at IS NULL
      AND captured_by_user_id IS NOT NULL;

CREATE TRIGGER trg_consent_records_set_updated_at
BEFORE UPDATE ON consent_records
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

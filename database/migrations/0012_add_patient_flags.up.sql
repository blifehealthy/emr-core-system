CREATE TYPE patient_flag_status AS ENUM (
    'active',
    'inactive',
    'resolved',
    'entered_in_error'
);

CREATE TYPE patient_flag_severity AS ENUM (
    'info',
    'caution',
    'critical'
);

CREATE TABLE patient_flags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL,
    flag_type VARCHAR(100) NOT NULL,
    label VARCHAR(255) NOT NULL,
    description TEXT,
    severity patient_flag_severity NOT NULL DEFAULT 'caution',
    status patient_flag_status NOT NULL DEFAULT 'active',
    source VARCHAR(100),
    starts_at TIMESTAMPTZ,
    ends_at TIMESTAMPTZ,
    created_by_user_id UUID,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    CONSTRAINT fk_patient_flags_patient
        FOREIGN KEY (patient_id)
        REFERENCES patients (id)
        ON DELETE CASCADE,
    CONSTRAINT fk_patient_flags_created_by_user
        FOREIGN KEY (created_by_user_id)
        REFERENCES users (id)
        ON DELETE SET NULL,
    CONSTRAINT chk_patient_flags_deleted_after_created
        CHECK (deleted_at IS NULL OR deleted_at >= created_at),
    CONSTRAINT chk_patient_flags_end_after_start
        CHECK (ends_at IS NULL OR starts_at IS NULL OR ends_at >= starts_at)
);

CREATE INDEX idx_patient_flags_patient_active
    ON patient_flags (patient_id, created_at DESC)
    WHERE deleted_at IS NULL;

CREATE INDEX idx_patient_flags_patient_status_active
    ON patient_flags (patient_id, status, created_at DESC)
    WHERE deleted_at IS NULL;

CREATE INDEX idx_patient_flags_patient_severity_active
    ON patient_flags (patient_id, severity, created_at DESC)
    WHERE deleted_at IS NULL;

CREATE TRIGGER trg_patient_flags_set_updated_at
BEFORE UPDATE ON patient_flags
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

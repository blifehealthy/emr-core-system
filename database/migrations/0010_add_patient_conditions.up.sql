CREATE TYPE patient_condition_status AS ENUM (
    'active',
    'resolved',
    'inactive',
    'entered_in_error'
);

CREATE TABLE patient_conditions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL,
    condition_code VARCHAR(64),
    coding_system VARCHAR(64),
    condition_name VARCHAR(255) NOT NULL,
    clinical_status patient_condition_status NOT NULL DEFAULT 'active',
    onset_date DATE,
    abatement_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    CONSTRAINT fk_patient_conditions_patient
        FOREIGN KEY (patient_id)
        REFERENCES patients (id)
        ON DELETE CASCADE,
    CONSTRAINT chk_patient_conditions_deleted_after_created
        CHECK (deleted_at IS NULL OR deleted_at >= created_at),
    CONSTRAINT chk_patient_conditions_abatement_after_onset
        CHECK (abatement_date IS NULL OR onset_date IS NULL OR abatement_date >= onset_date)
);

CREATE INDEX idx_patient_conditions_patient_active
    ON patient_conditions (patient_id, created_at DESC)
    WHERE deleted_at IS NULL;

CREATE INDEX idx_patient_conditions_patient_status_active
    ON patient_conditions (patient_id, clinical_status, created_at DESC)
    WHERE deleted_at IS NULL;

CREATE TRIGGER trg_patient_conditions_set_updated_at
BEFORE UPDATE ON patient_conditions
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

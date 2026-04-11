CREATE TYPE patient_medication_status AS ENUM (
    'active',
    'completed',
    'stopped',
    'on_hold',
    'entered_in_error'
);

CREATE TABLE patient_medications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL,
    prescribed_by_practitioner_id UUID,
    medication_name VARCHAR(255) NOT NULL,
    rxnorm_code VARCHAR(64),
    dosage TEXT,
    route VARCHAR(64),
    frequency VARCHAR(128),
    instructions TEXT,
    status patient_medication_status NOT NULL DEFAULT 'active',
    start_date DATE,
    end_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    CONSTRAINT fk_patient_medications_patient
        FOREIGN KEY (patient_id)
        REFERENCES patients (id)
        ON DELETE CASCADE,
    CONSTRAINT fk_patient_medications_practitioner
        FOREIGN KEY (prescribed_by_practitioner_id)
        REFERENCES practitioners (id)
        ON DELETE SET NULL,
    CONSTRAINT chk_patient_medications_deleted_after_created
        CHECK (deleted_at IS NULL OR deleted_at >= created_at),
    CONSTRAINT chk_patient_medications_date_order
        CHECK (end_date IS NULL OR start_date IS NULL OR end_date >= start_date)
);

CREATE INDEX idx_patient_medications_patient_active
    ON patient_medications (patient_id, created_at DESC)
    WHERE deleted_at IS NULL;

CREATE INDEX idx_patient_medications_patient_status_active
    ON patient_medications (patient_id, status, created_at DESC)
    WHERE deleted_at IS NULL;

CREATE TRIGGER trg_patient_medications_set_updated_at
BEFORE UPDATE ON patient_medications
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

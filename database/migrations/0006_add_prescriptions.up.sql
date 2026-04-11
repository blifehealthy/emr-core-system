CREATE TYPE prescription_status AS ENUM (
    'active',
    'completed',
    'cancelled'
);

CREATE TABLE prescriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    encounter_id UUID NOT NULL,
    clinical_note_id UUID,
    prescribed_by_practitioner_id UUID,
    medication_name VARCHAR(255) NOT NULL,
    rxnorm_code VARCHAR(64),
    dosage TEXT,
    route VARCHAR(64),
    frequency VARCHAR(128),
    duration_text VARCHAR(128),
    instructions TEXT,
    status prescription_status NOT NULL DEFAULT 'active',
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    CONSTRAINT fk_prescriptions_encounter
        FOREIGN KEY (encounter_id)
        REFERENCES encounters (id)
        ON DELETE CASCADE,
    CONSTRAINT fk_prescriptions_clinical_note
        FOREIGN KEY (clinical_note_id)
        REFERENCES clinical_notes (id)
        ON DELETE SET NULL,
    CONSTRAINT fk_prescriptions_practitioner
        FOREIGN KEY (prescribed_by_practitioner_id)
        REFERENCES practitioners (id)
        ON DELETE SET NULL,
    CONSTRAINT chk_prescriptions_deleted_after_created
        CHECK (deleted_at IS NULL OR deleted_at >= created_at),
    CONSTRAINT chk_prescriptions_date_order
        CHECK (end_date IS NULL OR start_date IS NULL OR end_date >= start_date)
);

CREATE INDEX idx_prescriptions_encounter_active
    ON prescriptions (encounter_id, created_at DESC)
    WHERE deleted_at IS NULL;

CREATE INDEX idx_prescriptions_note_active
    ON prescriptions (clinical_note_id)
    WHERE clinical_note_id IS NOT NULL
      AND deleted_at IS NULL;

CREATE TRIGGER trg_prescriptions_set_updated_at
BEFORE UPDATE ON prescriptions
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

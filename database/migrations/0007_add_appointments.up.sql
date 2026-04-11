CREATE TYPE appointment_status AS ENUM (
    'pending',
    'confirmed',
    'checked_in',
    'completed',
    'cancelled',
    'no_show'
);

CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL,
    patient_id UUID NOT NULL,
    practitioner_id UUID,
    appointment_number VARCHAR(64) NOT NULL,
    status appointment_status NOT NULL DEFAULT 'pending',
    scheduled_start_at TIMESTAMPTZ NOT NULL,
    scheduled_end_at TIMESTAMPTZ,
    reason TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    CONSTRAINT fk_appointments_clinic
        FOREIGN KEY (clinic_id)
        REFERENCES clinics (id)
        ON DELETE RESTRICT,
    CONSTRAINT fk_appointments_patient
        FOREIGN KEY (patient_id)
        REFERENCES patients (id)
        ON DELETE RESTRICT,
    CONSTRAINT fk_appointments_practitioner
        FOREIGN KEY (practitioner_id)
        REFERENCES practitioners (id)
        ON DELETE SET NULL,
    CONSTRAINT chk_appointments_deleted_after_created
        CHECK (deleted_at IS NULL OR deleted_at >= created_at),
    CONSTRAINT chk_appointments_end_after_start
        CHECK (scheduled_end_at IS NULL OR scheduled_end_at >= scheduled_start_at)
);

CREATE UNIQUE INDEX uq_appointments_clinic_number_active
    ON appointments (clinic_id, appointment_number)
    WHERE deleted_at IS NULL;

CREATE INDEX idx_appointments_clinic_start_active
    ON appointments (clinic_id, scheduled_start_at DESC)
    WHERE deleted_at IS NULL;

CREATE INDEX idx_appointments_patient_start_active
    ON appointments (patient_id, scheduled_start_at DESC)
    WHERE deleted_at IS NULL;

CREATE INDEX idx_appointments_practitioner_start_active
    ON appointments (practitioner_id, scheduled_start_at DESC)
    WHERE deleted_at IS NULL
      AND practitioner_id IS NOT NULL;

CREATE INDEX idx_appointments_status_start_active
    ON appointments (status, scheduled_start_at DESC)
    WHERE deleted_at IS NULL;

CREATE TRIGGER trg_appointments_set_updated_at
BEFORE UPDATE ON appointments
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

ALTER TABLE encounters
    ADD CONSTRAINT fk_encounters_appointment
    FOREIGN KEY (appointment_id)
    REFERENCES appointments (id)
    ON DELETE SET NULL;

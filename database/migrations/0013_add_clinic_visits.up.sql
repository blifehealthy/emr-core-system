CREATE TYPE clinic_visit_status AS ENUM (
    'waiting',
    'in_room',
    'with_doctor',
    'completed',
    'discharged',
    'cancelled'
);

CREATE TABLE clinic_visits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL,
    patient_id UUID NOT NULL,
    appointment_id UUID,
    encounter_id UUID,
    practitioner_id UUID,
    visit_number VARCHAR(64) NOT NULL,
    status clinic_visit_status NOT NULL DEFAULT 'waiting',
    queue_label VARCHAR(64),
    room_name VARCHAR(120),
    checked_in_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    called_at TIMESTAMPTZ,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    discharged_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    CONSTRAINT fk_clinic_visits_clinic
        FOREIGN KEY (clinic_id)
        REFERENCES clinics (id)
        ON DELETE RESTRICT,
    CONSTRAINT fk_clinic_visits_patient
        FOREIGN KEY (patient_id)
        REFERENCES patients (id)
        ON DELETE RESTRICT,
    CONSTRAINT fk_clinic_visits_appointment
        FOREIGN KEY (appointment_id)
        REFERENCES appointments (id)
        ON DELETE SET NULL,
    CONSTRAINT fk_clinic_visits_encounter
        FOREIGN KEY (encounter_id)
        REFERENCES encounters (id)
        ON DELETE SET NULL,
    CONSTRAINT fk_clinic_visits_practitioner
        FOREIGN KEY (practitioner_id)
        REFERENCES practitioners (id)
        ON DELETE SET NULL,
    CONSTRAINT chk_clinic_visits_deleted_after_created
        CHECK (deleted_at IS NULL OR deleted_at >= created_at)
);

CREATE UNIQUE INDEX uq_clinic_visits_clinic_number_active
    ON clinic_visits (clinic_id, visit_number)
    WHERE deleted_at IS NULL;

CREATE INDEX idx_clinic_visits_queue_active
    ON clinic_visits (clinic_id, status, checked_in_at ASC)
    WHERE deleted_at IS NULL;

CREATE INDEX idx_clinic_visits_appointment_active
    ON clinic_visits (appointment_id)
    WHERE deleted_at IS NULL
      AND appointment_id IS NOT NULL;

CREATE TRIGGER trg_clinic_visits_set_updated_at
BEFORE UPDATE ON clinic_visits
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

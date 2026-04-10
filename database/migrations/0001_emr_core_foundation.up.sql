CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE patient_sex_at_birth AS ENUM (
    'female',
    'male',
    'intersex',
    'unknown'
);

CREATE TYPE allergy_severity AS ENUM (
    'mild',
    'moderate',
    'severe',
    'unknown'
);

CREATE TYPE allergy_status AS ENUM (
    'active',
    'inactive',
    'entered_in_error'
);

CREATE TYPE encounter_status AS ENUM (
    'draft',
    'in_progress',
    'completed',
    'signed',
    'cancelled'
);

CREATE TYPE encounter_class AS ENUM (
    'outpatient',
    'inpatient',
    'emergency',
    'telemedicine',
    'other'
);

CREATE TYPE clinical_note_type AS ENUM (
    'soap',
    'triage',
    'progress',
    'discharge',
    'other'
);

CREATE TYPE clinical_note_status AS ENUM (
    'draft',
    'final',
    'amended',
    'voided'
);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION enforce_soap_note_type()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM clinical_notes
        WHERE id = NEW.clinical_note_id
          AND note_type = 'soap'
    ) THEN
        RAISE EXCEPTION 'soap_notes.clinical_note_id must reference a clinical_notes row with note_type = soap';
    END IF;

    RETURN NEW;
END;
$$;

CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL,
    medical_record_number VARCHAR(64) NOT NULL,
    national_id VARCHAR(32),
    first_name VARCHAR(120) NOT NULL,
    middle_name VARCHAR(120),
    last_name VARCHAR(120) NOT NULL,
    preferred_name VARCHAR(120),
    date_of_birth DATE,
    sex_at_birth patient_sex_at_birth NOT NULL DEFAULT 'unknown',
    phone_number VARCHAR(32),
    email VARCHAR(255),
    blood_type VARCHAR(4),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    CONSTRAINT uq_patients_national_id UNIQUE (national_id),
    CONSTRAINT chk_patients_deleted_after_created
        CHECK (deleted_at IS NULL OR deleted_at >= created_at),
    CONSTRAINT chk_patients_email_format
        CHECK (
            email IS NULL
            OR email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'
        )
);

CREATE TABLE patient_allergies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL,
    allergen_name VARCHAR(255) NOT NULL,
    allergen_category VARCHAR(100),
    reaction TEXT,
    severity allergy_severity NOT NULL DEFAULT 'unknown',
    status allergy_status NOT NULL DEFAULT 'active',
    criticality VARCHAR(32),
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_occurrence_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    CONSTRAINT fk_patient_allergies_patient
        FOREIGN KEY (patient_id)
        REFERENCES patients (id)
        ON DELETE CASCADE,
    CONSTRAINT chk_patient_allergies_deleted_after_created
        CHECK (deleted_at IS NULL OR deleted_at >= created_at),
    CONSTRAINT chk_patient_allergies_last_occurrence
        CHECK (last_occurrence_at IS NULL OR last_occurrence_at <= NOW())
);

CREATE TABLE encounters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    encounter_number VARCHAR(64) NOT NULL,
    patient_id UUID NOT NULL,
    status encounter_status NOT NULL DEFAULT 'draft',
    encounter_class encounter_class NOT NULL DEFAULT 'outpatient',
    appointment_id UUID,
    attending_practitioner_id UUID,
    chief_complaint TEXT,
    triage_summary TEXT,
    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    CONSTRAINT uq_encounters_encounter_number UNIQUE (encounter_number),
    CONSTRAINT fk_encounters_patient
        FOREIGN KEY (patient_id)
        REFERENCES patients (id)
        ON DELETE RESTRICT,
    CONSTRAINT chk_encounters_deleted_after_created
        CHECK (deleted_at IS NULL OR deleted_at >= created_at),
    CONSTRAINT chk_encounters_ended_after_started
        CHECK (ended_at IS NULL OR started_at IS NULL OR ended_at >= started_at)
);

CREATE TABLE clinical_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    encounter_id UUID NOT NULL,
    note_type clinical_note_type NOT NULL,
    status clinical_note_status NOT NULL DEFAULT 'draft',
    title VARCHAR(255),
    note_text TEXT,
    authored_by_practitioner_id UUID,
    authored_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    finalized_at TIMESTAMPTZ,
    signed_at TIMESTAMPTZ,
    amendment_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    CONSTRAINT fk_clinical_notes_encounter
        FOREIGN KEY (encounter_id)
        REFERENCES encounters (id)
        ON DELETE CASCADE,
    CONSTRAINT chk_clinical_notes_deleted_after_created
        CHECK (deleted_at IS NULL OR deleted_at >= created_at),
    CONSTRAINT chk_clinical_notes_finalized_after_authored
        CHECK (finalized_at IS NULL OR finalized_at >= authored_at),
    CONSTRAINT chk_clinical_notes_signed_after_authored
        CHECK (signed_at IS NULL OR signed_at >= authored_at)
);

CREATE TABLE soap_notes (
    clinical_note_id UUID PRIMARY KEY,
    subjective TEXT,
    objective TEXT,
    assessment TEXT,
    plan TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    CONSTRAINT fk_soap_notes_clinical_note
        FOREIGN KEY (clinical_note_id)
        REFERENCES clinical_notes (id)
        ON DELETE CASCADE,
    CONSTRAINT chk_soap_notes_deleted_after_created
        CHECK (deleted_at IS NULL OR deleted_at >= created_at),
    CONSTRAINT chk_soap_notes_has_content
        CHECK (
            COALESCE(NULLIF(BTRIM(subjective), ''), NULL) IS NOT NULL
            OR COALESCE(NULLIF(BTRIM(objective), ''), NULL) IS NOT NULL
            OR COALESCE(NULLIF(BTRIM(assessment), ''), NULL) IS NOT NULL
            OR COALESCE(NULLIF(BTRIM(plan), ''), NULL) IS NOT NULL
        )
);

CREATE UNIQUE INDEX uq_patients_clinic_medical_record_number_active
    ON patients (clinic_id, medical_record_number)
    WHERE deleted_at IS NULL;

CREATE INDEX idx_patients_active_name
    ON patients (last_name, first_name)
    WHERE deleted_at IS NULL;

CREATE INDEX idx_patient_allergies_patient_active
    ON patient_allergies (patient_id, recorded_at DESC)
    WHERE deleted_at IS NULL;

CREATE INDEX idx_encounters_patient_active
    ON encounters (patient_id, started_at DESC)
    WHERE deleted_at IS NULL;

CREATE INDEX idx_encounters_patient_created_at_active
    ON encounters (patient_id, created_at DESC)
    WHERE deleted_at IS NULL;

CREATE UNIQUE INDEX uq_encounters_appointment_id
    ON encounters (appointment_id)
    WHERE appointment_id IS NOT NULL;

CREATE INDEX idx_clinical_notes_encounter_id_active
    ON clinical_notes (encounter_id)
    WHERE deleted_at IS NULL;

CREATE INDEX idx_clinical_notes_encounter_active
    ON clinical_notes (encounter_id, authored_at DESC)
    WHERE deleted_at IS NULL;

CREATE INDEX idx_clinical_notes_type_status
    ON clinical_notes (note_type, status)
    WHERE deleted_at IS NULL;

CREATE INDEX idx_soap_notes_active
    ON soap_notes (clinical_note_id)
    WHERE deleted_at IS NULL;

CREATE TRIGGER trg_patients_set_updated_at
BEFORE UPDATE ON patients
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_patient_allergies_set_updated_at
BEFORE UPDATE ON patient_allergies
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_encounters_set_updated_at
BEFORE UPDATE ON encounters
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_clinical_notes_set_updated_at
BEFORE UPDATE ON clinical_notes
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_soap_notes_set_updated_at
BEFORE UPDATE ON soap_notes
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_soap_notes_enforce_note_type
BEFORE INSERT OR UPDATE ON soap_notes
FOR EACH ROW
EXECUTE FUNCTION enforce_soap_note_type();

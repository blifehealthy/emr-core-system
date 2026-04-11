CREATE TYPE diagnosis_type AS ENUM (
    'working',
    'final',
    'differential',
    'ruled_out'
);

CREATE TYPE diagnosis_status AS ENUM (
    'active',
    'resolved',
    'entered_in_error'
);

CREATE TABLE diagnoses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    encounter_id UUID NOT NULL,
    clinical_note_id UUID,
    diagnosis_code VARCHAR(32),
    coding_system VARCHAR(32),
    diagnosis_name VARCHAR(255) NOT NULL,
    diagnosis_type diagnosis_type NOT NULL DEFAULT 'working',
    status diagnosis_status NOT NULL DEFAULT 'active',
    sequence_number INTEGER,
    diagnosed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolution_note TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    CONSTRAINT fk_diagnoses_encounter
        FOREIGN KEY (encounter_id)
        REFERENCES encounters (id)
        ON DELETE CASCADE,
    CONSTRAINT fk_diagnoses_clinical_note
        FOREIGN KEY (clinical_note_id)
        REFERENCES clinical_notes (id)
        ON DELETE SET NULL,
    CONSTRAINT chk_diagnoses_deleted_after_created
        CHECK (deleted_at IS NULL OR deleted_at >= created_at),
    CONSTRAINT chk_diagnoses_sequence_positive
        CHECK (sequence_number IS NULL OR sequence_number > 0),
    CONSTRAINT chk_diagnoses_code_and_system_pair
        CHECK (
            (diagnosis_code IS NULL AND coding_system IS NULL)
            OR (diagnosis_code IS NOT NULL AND coding_system IS NOT NULL)
        )
);

CREATE TABLE vital_signs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    encounter_id UUID NOT NULL,
    clinical_note_id UUID,
    measured_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    measured_by_practitioner_id UUID,
    body_temperature_c NUMERIC(4,1),
    heart_rate_bpm INTEGER,
    respiratory_rate_bpm INTEGER,
    systolic_bp_mmhg INTEGER,
    diastolic_bp_mmhg INTEGER,
    oxygen_saturation_pct NUMERIC(5,2),
    weight_kg NUMERIC(6,2),
    height_cm NUMERIC(6,2),
    bmi NUMERIC(5,2),
    pain_score INTEGER,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    CONSTRAINT fk_vital_signs_encounter
        FOREIGN KEY (encounter_id)
        REFERENCES encounters (id)
        ON DELETE CASCADE,
    CONSTRAINT fk_vital_signs_clinical_note
        FOREIGN KEY (clinical_note_id)
        REFERENCES clinical_notes (id)
        ON DELETE SET NULL,
    CONSTRAINT chk_vital_signs_deleted_after_created
        CHECK (deleted_at IS NULL OR deleted_at >= created_at),
    CONSTRAINT chk_vital_signs_body_temperature
        CHECK (body_temperature_c IS NULL OR body_temperature_c BETWEEN 25.0 AND 45.0),
    CONSTRAINT chk_vital_signs_heart_rate
        CHECK (heart_rate_bpm IS NULL OR heart_rate_bpm BETWEEN 1 AND 300),
    CONSTRAINT chk_vital_signs_respiratory_rate
        CHECK (respiratory_rate_bpm IS NULL OR respiratory_rate_bpm BETWEEN 1 AND 120),
    CONSTRAINT chk_vital_signs_blood_pressure_pair
        CHECK (
            (systolic_bp_mmhg IS NULL AND diastolic_bp_mmhg IS NULL)
            OR (systolic_bp_mmhg IS NOT NULL AND diastolic_bp_mmhg IS NOT NULL)
        ),
    CONSTRAINT chk_vital_signs_systolic_bp
        CHECK (systolic_bp_mmhg IS NULL OR systolic_bp_mmhg BETWEEN 40 AND 300),
    CONSTRAINT chk_vital_signs_diastolic_bp
        CHECK (diastolic_bp_mmhg IS NULL OR diastolic_bp_mmhg BETWEEN 20 AND 200),
    CONSTRAINT chk_vital_signs_oxygen_saturation
        CHECK (oxygen_saturation_pct IS NULL OR oxygen_saturation_pct BETWEEN 0 AND 100),
    CONSTRAINT chk_vital_signs_weight
        CHECK (weight_kg IS NULL OR weight_kg > 0),
    CONSTRAINT chk_vital_signs_height
        CHECK (height_cm IS NULL OR height_cm > 0),
    CONSTRAINT chk_vital_signs_bmi
        CHECK (bmi IS NULL OR bmi > 0),
    CONSTRAINT chk_vital_signs_pain_score
        CHECK (pain_score IS NULL OR pain_score BETWEEN 0 AND 10),
    CONSTRAINT chk_vital_signs_has_measurement
        CHECK (
            body_temperature_c IS NOT NULL
            OR heart_rate_bpm IS NOT NULL
            OR respiratory_rate_bpm IS NOT NULL
            OR systolic_bp_mmhg IS NOT NULL
            OR diastolic_bp_mmhg IS NOT NULL
            OR oxygen_saturation_pct IS NOT NULL
            OR weight_kg IS NOT NULL
            OR height_cm IS NOT NULL
            OR bmi IS NOT NULL
            OR pain_score IS NOT NULL
        )
);

CREATE INDEX idx_diagnoses_encounter_active
    ON diagnoses (encounter_id, diagnosed_at DESC)
    WHERE deleted_at IS NULL;

CREATE INDEX idx_diagnoses_note_active
    ON diagnoses (clinical_note_id)
    WHERE clinical_note_id IS NOT NULL
      AND deleted_at IS NULL;

CREATE INDEX idx_diagnoses_code_active
    ON diagnoses (diagnosis_code, coding_system)
    WHERE diagnosis_code IS NOT NULL
      AND deleted_at IS NULL;

CREATE INDEX idx_vital_signs_encounter_active
    ON vital_signs (encounter_id, measured_at DESC)
    WHERE deleted_at IS NULL;

CREATE INDEX idx_vital_signs_note_active
    ON vital_signs (clinical_note_id)
    WHERE clinical_note_id IS NOT NULL
      AND deleted_at IS NULL;

CREATE TRIGGER trg_diagnoses_set_updated_at
BEFORE UPDATE ON diagnoses
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_vital_signs_set_updated_at
BEFORE UPDATE ON vital_signs
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

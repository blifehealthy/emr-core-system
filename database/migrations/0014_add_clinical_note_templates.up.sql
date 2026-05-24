CREATE TABLE clinical_note_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL,
    template_key VARCHAR(120) NOT NULL,
    title VARCHAR(240) NOT NULL,
    category VARCHAR(120),
    subjective TEXT,
    objective TEXT,
    assessment TEXT,
    plan TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    CONSTRAINT fk_clinical_note_templates_clinic
        FOREIGN KEY (clinic_id)
        REFERENCES clinics (id)
        ON DELETE RESTRICT,
    CONSTRAINT chk_clinical_note_templates_deleted_after_created
        CHECK (deleted_at IS NULL OR deleted_at >= created_at)
);

CREATE UNIQUE INDEX uq_clinical_note_templates_key_active
    ON clinical_note_templates (clinic_id, template_key)
    WHERE deleted_at IS NULL;

CREATE INDEX idx_clinical_note_templates_clinic_active
    ON clinical_note_templates (clinic_id, is_active, title)
    WHERE deleted_at IS NULL;

CREATE TRIGGER trg_clinical_note_templates_set_updated_at
BEFORE UPDATE ON clinical_note_templates
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

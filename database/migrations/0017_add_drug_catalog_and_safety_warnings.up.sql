CREATE TABLE drug_catalog (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL,
    medication_name VARCHAR(255) NOT NULL,
    rxnorm_code VARCHAR(64),
    generic_name VARCHAR(255),
    strength VARCHAR(128),
    dosage_form VARCHAR(128),
    route VARCHAR(64),
    allergen_tags TEXT[] NOT NULL DEFAULT '{}',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    CONSTRAINT fk_drug_catalog_clinic
        FOREIGN KEY (clinic_id)
        REFERENCES clinics (id)
        ON DELETE CASCADE,
    CONSTRAINT chk_drug_catalog_deleted_after_created
        CHECK (deleted_at IS NULL OR deleted_at >= created_at)
);

CREATE UNIQUE INDEX uq_drug_catalog_clinic_rxnorm_active
    ON drug_catalog (clinic_id, rxnorm_code)
    WHERE rxnorm_code IS NOT NULL
      AND deleted_at IS NULL;

CREATE INDEX idx_drug_catalog_clinic_active
    ON drug_catalog (clinic_id, medication_name)
    WHERE deleted_at IS NULL;

CREATE TRIGGER trg_drug_catalog_set_updated_at
BEFORE UPDATE ON drug_catalog
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

ALTER TABLE prescriptions
    ADD COLUMN drug_catalog_id UUID,
    ADD COLUMN safety_warnings JSONB NOT NULL DEFAULT '[]'::jsonb,
    ADD CONSTRAINT fk_prescriptions_drug_catalog
        FOREIGN KEY (drug_catalog_id)
        REFERENCES drug_catalog (id)
        ON DELETE SET NULL,
    ADD CONSTRAINT chk_prescriptions_safety_warnings_array
        CHECK (jsonb_typeof(safety_warnings) = 'array');

CREATE INDEX idx_prescriptions_drug_catalog
    ON prescriptions (drug_catalog_id)
    WHERE drug_catalog_id IS NOT NULL
      AND deleted_at IS NULL;

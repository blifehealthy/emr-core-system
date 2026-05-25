CREATE TABLE drug_interaction_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL,
    primary_drug_catalog_id UUID,
    interacting_drug_catalog_id UUID,
    primary_rxnorm_code VARCHAR(64),
    interacting_rxnorm_code VARCHAR(64),
    primary_medication_name VARCHAR(255),
    interacting_medication_name VARCHAR(255),
    severity VARCHAR(32) NOT NULL DEFAULT 'warning',
    description TEXT NOT NULL,
    recommendation TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    CONSTRAINT fk_drug_interaction_rules_clinic
        FOREIGN KEY (clinic_id)
        REFERENCES clinics (id)
        ON DELETE CASCADE,
    CONSTRAINT fk_drug_interaction_rules_primary_catalog
        FOREIGN KEY (primary_drug_catalog_id)
        REFERENCES drug_catalog (id)
        ON DELETE SET NULL,
    CONSTRAINT fk_drug_interaction_rules_interacting_catalog
        FOREIGN KEY (interacting_drug_catalog_id)
        REFERENCES drug_catalog (id)
        ON DELETE SET NULL,
    CONSTRAINT chk_drug_interaction_rules_severity
        CHECK (severity IN ('info', 'warning', 'critical')),
    CONSTRAINT chk_drug_interaction_rules_primary_present
        CHECK (
            primary_drug_catalog_id IS NOT NULL
            OR NULLIF(BTRIM(primary_rxnorm_code), '') IS NOT NULL
            OR NULLIF(BTRIM(primary_medication_name), '') IS NOT NULL
        ),
    CONSTRAINT chk_drug_interaction_rules_interacting_present
        CHECK (
            interacting_drug_catalog_id IS NOT NULL
            OR NULLIF(BTRIM(interacting_rxnorm_code), '') IS NOT NULL
            OR NULLIF(BTRIM(interacting_medication_name), '') IS NOT NULL
        ),
    CONSTRAINT chk_drug_interaction_rules_deleted_after_created
        CHECK (deleted_at IS NULL OR deleted_at >= created_at)
);

CREATE INDEX idx_drug_interaction_rules_clinic_active
    ON drug_interaction_rules (clinic_id, is_active, created_at DESC)
    WHERE deleted_at IS NULL;

CREATE TRIGGER trg_drug_interaction_rules_set_updated_at
BEFORE UPDATE ON drug_interaction_rules
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

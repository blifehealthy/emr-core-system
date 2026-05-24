CREATE TABLE clinic_settings (
    clinic_id UUID PRIMARY KEY,
    display_name VARCHAR(240) NOT NULL,
    address TEXT,
    phone_number VARCHAR(80),
    email VARCHAR(240),
    website VARCHAR(240),
    logo_url TEXT,
    prescription_footer TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    CONSTRAINT fk_clinic_settings_clinic
        FOREIGN KEY (clinic_id)
        REFERENCES clinics (id)
        ON DELETE CASCADE,
    CONSTRAINT chk_clinic_settings_deleted_after_created
        CHECK (deleted_at IS NULL OR deleted_at >= created_at)
);

CREATE TRIGGER trg_clinic_settings_set_updated_at
BEFORE UPDATE ON clinic_settings
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TYPE attachment_target_type AS ENUM (
    'patient',
    'encounter',
    'clinical_note',
    'consent_record'
);

CREATE TABLE file_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL,
    storage_key VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    mime_type VARCHAR(255),
    byte_size BIGINT NOT NULL,
    checksum_sha256 VARCHAR(128),
    uploaded_by_user_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    CONSTRAINT fk_file_assets_clinic
        FOREIGN KEY (clinic_id)
        REFERENCES clinics (id)
        ON DELETE RESTRICT,
    CONSTRAINT fk_file_assets_uploaded_by_user
        FOREIGN KEY (uploaded_by_user_id)
        REFERENCES users (id)
        ON DELETE SET NULL,
    CONSTRAINT chk_file_assets_deleted_after_created
        CHECK (deleted_at IS NULL OR deleted_at >= created_at),
    CONSTRAINT chk_file_assets_byte_size_non_negative
        CHECK (byte_size >= 0)
);

CREATE TABLE attachment_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_asset_id UUID NOT NULL,
    target_type attachment_target_type NOT NULL,
    target_id UUID NOT NULL,
    label VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    CONSTRAINT fk_attachment_links_file_asset
        FOREIGN KEY (file_asset_id)
        REFERENCES file_assets (id)
        ON DELETE CASCADE,
    CONSTRAINT chk_attachment_links_deleted_after_created
        CHECK (deleted_at IS NULL OR deleted_at >= created_at)
);

CREATE INDEX idx_file_assets_clinic_created_at_active
    ON file_assets (clinic_id, created_at DESC)
    WHERE deleted_at IS NULL;

CREATE INDEX idx_file_assets_uploaded_by_user_active
    ON file_assets (uploaded_by_user_id, created_at DESC)
    WHERE deleted_at IS NULL
      AND uploaded_by_user_id IS NOT NULL;

CREATE UNIQUE INDEX uq_file_assets_storage_key_active
    ON file_assets (storage_key)
    WHERE deleted_at IS NULL;

CREATE INDEX idx_attachment_links_target_active
    ON attachment_links (target_type, target_id, created_at DESC)
    WHERE deleted_at IS NULL;

CREATE INDEX idx_attachment_links_file_asset_active
    ON attachment_links (file_asset_id, created_at DESC)
    WHERE deleted_at IS NULL;

CREATE TRIGGER trg_file_assets_set_updated_at
BEFORE UPDATE ON file_assets
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_attachment_links_set_updated_at
BEFORE UPDATE ON attachment_links
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

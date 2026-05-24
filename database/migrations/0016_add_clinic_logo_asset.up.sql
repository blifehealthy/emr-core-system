ALTER TABLE clinic_settings
    ADD COLUMN logo_file_asset_id UUID,
    ADD CONSTRAINT fk_clinic_settings_logo_file_asset
        FOREIGN KEY (logo_file_asset_id)
        REFERENCES file_assets (id)
        ON DELETE SET NULL;

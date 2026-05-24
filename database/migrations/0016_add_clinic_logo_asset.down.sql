ALTER TABLE clinic_settings
    DROP CONSTRAINT IF EXISTS fk_clinic_settings_logo_file_asset,
    DROP COLUMN IF EXISTS logo_file_asset_id;

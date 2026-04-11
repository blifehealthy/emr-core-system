DROP TRIGGER IF EXISTS trg_attachment_links_set_updated_at ON attachment_links;
DROP TRIGGER IF EXISTS trg_file_assets_set_updated_at ON file_assets;

DROP INDEX IF EXISTS idx_attachment_links_file_asset_active;
DROP INDEX IF EXISTS idx_attachment_links_target_active;
DROP INDEX IF EXISTS uq_file_assets_storage_key_active;
DROP INDEX IF EXISTS idx_file_assets_uploaded_by_user_active;
DROP INDEX IF EXISTS idx_file_assets_clinic_created_at_active;

DROP TABLE IF EXISTS attachment_links;
DROP TABLE IF EXISTS file_assets;
DROP TYPE IF EXISTS attachment_target_type;

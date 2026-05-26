DROP INDEX IF EXISTS idx_inventory_barcode_print_jobs_profile_active;

ALTER TABLE inventory_barcode_print_jobs
  DROP COLUMN IF EXISTS target_endpoint,
  DROP COLUMN IF EXISTS delivery_status,
  DROP COLUMN IF EXISTS connection_type,
  DROP COLUMN IF EXISTS printer_profile_id;

DROP TRIGGER IF EXISTS update_inventory_printer_profiles_updated_at ON inventory_printer_profiles;
DROP INDEX IF EXISTS idx_inventory_printer_profiles_clinic_active;
DROP INDEX IF EXISTS uq_inventory_printer_profiles_clinic_default_active;
DROP INDEX IF EXISTS uq_inventory_printer_profiles_clinic_name_active;
DROP TABLE IF EXISTS inventory_printer_profiles;
DROP TYPE IF EXISTS inventory_printer_connection_type;

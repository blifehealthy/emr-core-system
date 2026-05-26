CREATE TYPE inventory_printer_connection_type AS ENUM ('browser', 'network', 'utility_bridge');

CREATE TABLE inventory_printer_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  profile_name VARCHAR(160) NOT NULL,
  printer_language inventory_barcode_print_language NOT NULL DEFAULT 'zpl',
  connection_type inventory_printer_connection_type NOT NULL DEFAULT 'browser',
  endpoint_url TEXT,
  location_name VARCHAR(160),
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE UNIQUE INDEX uq_inventory_printer_profiles_clinic_name_active
  ON inventory_printer_profiles (clinic_id, profile_name)
  WHERE deleted_at IS NULL;

CREATE UNIQUE INDEX uq_inventory_printer_profiles_clinic_default_active
  ON inventory_printer_profiles (clinic_id)
  WHERE is_default IS TRUE AND is_active IS TRUE AND deleted_at IS NULL;

CREATE INDEX idx_inventory_printer_profiles_clinic_active
  ON inventory_printer_profiles (clinic_id, is_active, profile_name)
  WHERE deleted_at IS NULL;

CREATE TRIGGER update_inventory_printer_profiles_updated_at
BEFORE UPDATE ON inventory_printer_profiles
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

ALTER TABLE inventory_barcode_print_jobs
  ADD COLUMN printer_profile_id UUID REFERENCES inventory_printer_profiles(id) ON DELETE SET NULL,
  ADD COLUMN connection_type inventory_printer_connection_type,
  ADD COLUMN delivery_status VARCHAR(32) NOT NULL DEFAULT 'exported',
  ADD COLUMN target_endpoint TEXT;

CREATE INDEX idx_inventory_barcode_print_jobs_profile_active
  ON inventory_barcode_print_jobs (printer_profile_id, requested_at DESC)
  WHERE printer_profile_id IS NOT NULL AND deleted_at IS NULL;

DROP TRIGGER IF EXISTS trg_consent_records_set_updated_at ON consent_records;

DROP INDEX IF EXISTS idx_consent_records_captured_by_user_active;
DROP INDEX IF EXISTS idx_consent_records_clinic_status_active;
DROP INDEX IF EXISTS idx_consent_records_patient_created_at_active;

DROP TABLE IF EXISTS consent_records;
DROP TYPE IF EXISTS consent_status;

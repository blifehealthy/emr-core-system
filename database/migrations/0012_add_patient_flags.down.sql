DROP TRIGGER IF EXISTS trg_patient_flags_set_updated_at ON patient_flags;
DROP INDEX IF EXISTS idx_patient_flags_patient_severity_active;
DROP INDEX IF EXISTS idx_patient_flags_patient_status_active;
DROP INDEX IF EXISTS idx_patient_flags_patient_active;
DROP TABLE IF EXISTS patient_flags;
DROP TYPE IF EXISTS patient_flag_severity;
DROP TYPE IF EXISTS patient_flag_status;

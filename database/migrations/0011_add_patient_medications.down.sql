DROP TRIGGER IF EXISTS trg_patient_medications_set_updated_at ON patient_medications;
DROP INDEX IF EXISTS idx_patient_medications_patient_status_active;
DROP INDEX IF EXISTS idx_patient_medications_patient_active;
DROP TABLE IF EXISTS patient_medications;
DROP TYPE IF EXISTS patient_medication_status;

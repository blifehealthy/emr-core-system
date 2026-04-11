DROP TRIGGER IF EXISTS trg_patient_conditions_set_updated_at ON patient_conditions;
DROP INDEX IF EXISTS idx_patient_conditions_patient_status_active;
DROP INDEX IF EXISTS idx_patient_conditions_patient_active;
DROP TABLE IF EXISTS patient_conditions;
DROP TYPE IF EXISTS patient_condition_status;

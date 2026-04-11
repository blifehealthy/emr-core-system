ALTER TABLE encounters
    DROP CONSTRAINT IF EXISTS fk_encounters_appointment;

DROP TRIGGER IF EXISTS trg_appointments_set_updated_at ON appointments;

DROP INDEX IF EXISTS idx_appointments_status_start_active;
DROP INDEX IF EXISTS idx_appointments_practitioner_start_active;
DROP INDEX IF EXISTS idx_appointments_patient_start_active;
DROP INDEX IF EXISTS idx_appointments_clinic_start_active;
DROP INDEX IF EXISTS uq_appointments_clinic_number_active;

DROP TABLE IF EXISTS appointments;
DROP TYPE IF EXISTS appointment_status;

ALTER TABLE patients
ADD CONSTRAINT fk_patients_clinic
    FOREIGN KEY (clinic_id)
    REFERENCES clinics (id)
    ON DELETE RESTRICT;

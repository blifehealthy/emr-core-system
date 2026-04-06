DROP TRIGGER IF EXISTS trg_soap_notes_enforce_note_type ON soap_notes;
DROP TRIGGER IF EXISTS trg_soap_notes_set_updated_at ON soap_notes;
DROP TRIGGER IF EXISTS trg_clinical_notes_set_updated_at ON clinical_notes;
DROP TRIGGER IF EXISTS trg_encounters_set_updated_at ON encounters;
DROP TRIGGER IF EXISTS trg_patient_allergies_set_updated_at ON patient_allergies;
DROP TRIGGER IF EXISTS trg_patients_set_updated_at ON patients;

DROP TABLE IF EXISTS soap_notes;
DROP TABLE IF EXISTS clinical_notes;
DROP TABLE IF EXISTS encounters;
DROP TABLE IF EXISTS patient_allergies;
DROP TABLE IF EXISTS patients;

DROP FUNCTION IF EXISTS enforce_soap_note_type();
DROP FUNCTION IF EXISTS set_updated_at();

DROP TYPE IF EXISTS clinical_note_status;
DROP TYPE IF EXISTS clinical_note_type;
DROP TYPE IF EXISTS encounter_class;
DROP TYPE IF EXISTS encounter_status;
DROP TYPE IF EXISTS allergy_status;
DROP TYPE IF EXISTS allergy_severity;
DROP TYPE IF EXISTS patient_sex_at_birth;

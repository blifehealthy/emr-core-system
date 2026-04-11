DROP TRIGGER IF EXISTS trg_vital_signs_set_updated_at ON vital_signs;
DROP TRIGGER IF EXISTS trg_diagnoses_set_updated_at ON diagnoses;

DROP TABLE IF EXISTS vital_signs;
DROP TABLE IF EXISTS diagnoses;

DROP TYPE IF EXISTS diagnosis_status;
DROP TYPE IF EXISTS diagnosis_type;

DROP INDEX IF EXISTS idx_prescriptions_drug_catalog;

ALTER TABLE prescriptions
    DROP CONSTRAINT IF EXISTS chk_prescriptions_safety_warnings_array,
    DROP CONSTRAINT IF EXISTS fk_prescriptions_drug_catalog,
    DROP COLUMN IF EXISTS safety_warnings,
    DROP COLUMN IF EXISTS drug_catalog_id;

DROP TABLE IF EXISTS drug_catalog;

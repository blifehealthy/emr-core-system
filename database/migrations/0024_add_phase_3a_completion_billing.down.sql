DROP TRIGGER IF EXISTS update_insurance_claims_updated_at ON insurance_claims;
DROP TABLE IF EXISTS insurance_claims;
DROP TYPE IF EXISTS insurance_claim_status;

DROP INDEX IF EXISTS uq_invoices_clinic_tax_invoice_number_active;
DROP INDEX IF EXISTS uq_invoices_clinic_receipt_number_active;

ALTER TABLE invoices
  DROP COLUMN IF EXISTS receipt_issued_at,
  DROP COLUMN IF EXISTS tax_invoice_number,
  DROP COLUMN IF EXISTS receipt_number;

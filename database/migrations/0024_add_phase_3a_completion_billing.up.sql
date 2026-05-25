ALTER TABLE invoices
  ADD COLUMN receipt_number VARCHAR(64),
  ADD COLUMN tax_invoice_number VARCHAR(64),
  ADD COLUMN receipt_issued_at TIMESTAMPTZ;

CREATE UNIQUE INDEX uq_invoices_clinic_receipt_number_active
  ON invoices (clinic_id, receipt_number)
  WHERE receipt_number IS NOT NULL AND deleted_at IS NULL;

CREATE UNIQUE INDEX uq_invoices_clinic_tax_invoice_number_active
  ON invoices (clinic_id, tax_invoice_number)
  WHERE tax_invoice_number IS NOT NULL AND deleted_at IS NULL;

CREATE TYPE insurance_claim_status AS ENUM (
  'draft',
  'submitted',
  'accepted',
  'rejected',
  'paid',
  'cancelled'
);

CREATE TABLE insurance_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE RESTRICT,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE RESTRICT,
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  claim_number VARCHAR(64) NOT NULL,
  status insurance_claim_status NOT NULL DEFAULT 'draft',
  insurer_name VARCHAR(255) NOT NULL,
  policy_number VARCHAR(120),
  approved_amount NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (approved_amount >= 0),
  paid_amount NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (paid_amount >= 0),
  submitted_at TIMESTAMPTZ,
  adjudicated_at TIMESTAMPTZ,
  rejection_reason TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE UNIQUE INDEX uq_insurance_claims_clinic_number_active
  ON insurance_claims (clinic_id, claim_number)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_insurance_claims_invoice_active
  ON insurance_claims (invoice_id)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_insurance_claims_clinic_status_active
  ON insurance_claims (clinic_id, status, created_at DESC)
  WHERE deleted_at IS NULL;

CREATE TRIGGER update_insurance_claims_updated_at
  BEFORE UPDATE ON insurance_claims
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

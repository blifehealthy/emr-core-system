CREATE TYPE cashier_reconciliation_status AS ENUM ('open', 'closed', 'cancelled');

CREATE TABLE billing_number_sequences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL CHECK (document_type IN ('invoice', 'receipt', 'tax_invoice', 'claim')),
  prefix TEXT NOT NULL,
  next_number INTEGER NOT NULL DEFAULT 1 CHECK (next_number > 0),
  padding INTEGER NOT NULL DEFAULT 6 CHECK (padding BETWEEN 1 AND 12),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE UNIQUE INDEX uq_billing_number_sequences_clinic_type_active
  ON billing_number_sequences (clinic_id, document_type)
  WHERE is_active = TRUE AND deleted_at IS NULL;

CREATE TRIGGER update_billing_number_sequences_updated_at
BEFORE UPDATE ON billing_number_sequences
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TABLE cashier_reconciliations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  reconciliation_date DATE NOT NULL,
  status cashier_reconciliation_status NOT NULL DEFAULT 'open',
  opening_cash_amount NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (opening_cash_amount >= 0),
  expected_cash_amount NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (expected_cash_amount >= 0),
  counted_cash_amount NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (counted_cash_amount >= 0),
  variance_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  opened_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  closed_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  opened_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  closed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE UNIQUE INDEX uq_cashier_reconciliations_clinic_date_active
  ON cashier_reconciliations (clinic_id, reconciliation_date)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_cashier_reconciliations_clinic_status_active
  ON cashier_reconciliations (clinic_id, status, reconciliation_date DESC)
  WHERE deleted_at IS NULL;

CREATE TRIGGER update_cashier_reconciliations_updated_at
BEFORE UPDATE ON cashier_reconciliations
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

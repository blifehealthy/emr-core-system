ALTER TABLE invoices
  ADD COLUMN refunded_amount NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (refunded_amount >= 0);

CREATE TABLE invoice_refunds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  refund_number TEXT NOT NULL,
  method payment_method NOT NULL,
  amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  refunded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  refunded_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  reference_number TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE UNIQUE INDEX uq_invoice_refunds_number_active
  ON invoice_refunds (refund_number)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_invoice_refunds_invoice_active
  ON invoice_refunds (invoice_id)
  WHERE deleted_at IS NULL;

CREATE TRIGGER update_invoice_refunds_updated_at
  BEFORE UPDATE ON invoice_refunds
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

CREATE TABLE charge_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  description TEXT NOT NULL,
  item_type invoice_line_item_type NOT NULL DEFAULT 'procedure',
  unit_price_amount NUMERIC(12, 2) NOT NULL CHECK (unit_price_amount >= 0),
  tax_amount NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (tax_amount >= 0),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE UNIQUE INDEX uq_charge_templates_clinic_code_active
  ON charge_templates (clinic_id, code)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_charge_templates_clinic_active
  ON charge_templates (clinic_id, is_active)
  WHERE deleted_at IS NULL;

CREATE TRIGGER update_charge_templates_updated_at
  BEFORE UPDATE ON charge_templates
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

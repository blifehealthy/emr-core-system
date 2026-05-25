DROP TRIGGER IF EXISTS update_charge_templates_updated_at ON charge_templates;
DROP TABLE IF EXISTS charge_templates;

DROP TRIGGER IF EXISTS update_invoice_refunds_updated_at ON invoice_refunds;
DROP TABLE IF EXISTS invoice_refunds;

ALTER TABLE invoices
  DROP COLUMN IF EXISTS refunded_amount;

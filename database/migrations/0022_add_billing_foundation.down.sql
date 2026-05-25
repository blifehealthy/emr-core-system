DROP TRIGGER IF EXISTS trg_invoice_payments_set_updated_at ON invoice_payments;
DROP TRIGGER IF EXISTS trg_invoice_line_items_set_updated_at ON invoice_line_items;
DROP TRIGGER IF EXISTS trg_invoices_set_updated_at ON invoices;

DROP INDEX IF EXISTS idx_invoice_payments_invoice_active;
DROP INDEX IF EXISTS idx_invoice_line_items_invoice_active;
DROP INDEX IF EXISTS idx_invoices_patient_active;
DROP INDEX IF EXISTS idx_invoices_clinic_status_active;
DROP INDEX IF EXISTS uq_invoice_payments_number_active;
DROP INDEX IF EXISTS uq_invoices_clinic_number_active;

DROP TABLE IF EXISTS invoice_payments;
DROP TABLE IF EXISTS invoice_line_items;
DROP TABLE IF EXISTS invoices;

DROP TYPE IF EXISTS payment_method;
DROP TYPE IF EXISTS invoice_line_item_type;
DROP TYPE IF EXISTS invoice_status;

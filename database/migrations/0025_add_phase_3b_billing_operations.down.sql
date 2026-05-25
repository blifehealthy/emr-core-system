DROP TRIGGER IF EXISTS update_cashier_reconciliations_updated_at ON cashier_reconciliations;
DROP TABLE IF EXISTS cashier_reconciliations;

DROP TRIGGER IF EXISTS update_billing_number_sequences_updated_at ON billing_number_sequences;
DROP TABLE IF EXISTS billing_number_sequences;

DROP TYPE IF EXISTS cashier_reconciliation_status;

CREATE TYPE invoice_status AS ENUM (
    'draft',
    'issued',
    'partially_paid',
    'paid',
    'voided'
);

CREATE TYPE invoice_line_item_type AS ENUM (
    'visit',
    'procedure',
    'medication',
    'lab',
    'discount',
    'other'
);

CREATE TYPE payment_method AS ENUM (
    'cash',
    'card',
    'bank_transfer',
    'qr',
    'insurance',
    'other'
);

CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL,
    patient_id UUID NOT NULL,
    appointment_id UUID,
    visit_id UUID,
    encounter_id UUID,
    invoice_number VARCHAR(64) NOT NULL,
    status invoice_status NOT NULL DEFAULT 'draft',
    currency CHAR(3) NOT NULL DEFAULT 'THB',
    subtotal_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    discount_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    tax_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    paid_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    balance_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    issued_at TIMESTAMPTZ,
    due_at TIMESTAMPTZ,
    notes TEXT,
    void_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    CONSTRAINT fk_invoices_clinic
        FOREIGN KEY (clinic_id)
        REFERENCES clinics (id)
        ON DELETE RESTRICT,
    CONSTRAINT fk_invoices_patient
        FOREIGN KEY (patient_id)
        REFERENCES patients (id)
        ON DELETE RESTRICT,
    CONSTRAINT fk_invoices_appointment
        FOREIGN KEY (appointment_id)
        REFERENCES appointments (id)
        ON DELETE SET NULL,
    CONSTRAINT fk_invoices_visit
        FOREIGN KEY (visit_id)
        REFERENCES clinic_visits (id)
        ON DELETE SET NULL,
    CONSTRAINT fk_invoices_encounter
        FOREIGN KEY (encounter_id)
        REFERENCES encounters (id)
        ON DELETE SET NULL,
    CONSTRAINT chk_invoices_amounts_non_negative
        CHECK (
            subtotal_amount >= 0
            AND discount_amount >= 0
            AND tax_amount >= 0
            AND total_amount >= 0
            AND paid_amount >= 0
            AND balance_amount >= 0
        ),
    CONSTRAINT chk_invoices_currency_upper
        CHECK (currency = UPPER(currency)),
    CONSTRAINT chk_invoices_deleted_after_created
        CHECK (deleted_at IS NULL OR deleted_at >= created_at)
);

CREATE TABLE invoice_line_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL,
    item_type invoice_line_item_type NOT NULL DEFAULT 'other',
    description VARCHAR(255) NOT NULL,
    reference_type VARCHAR(64),
    reference_id UUID,
    quantity NUMERIC(10, 2) NOT NULL DEFAULT 1,
    unit_price_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    discount_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    tax_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    line_total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    CONSTRAINT fk_invoice_line_items_invoice
        FOREIGN KEY (invoice_id)
        REFERENCES invoices (id)
        ON DELETE CASCADE,
    CONSTRAINT chk_invoice_line_item_amounts_non_negative
        CHECK (
            quantity > 0
            AND unit_price_amount >= 0
            AND discount_amount >= 0
            AND tax_amount >= 0
            AND line_total_amount >= 0
        ),
    CONSTRAINT chk_invoice_line_items_deleted_after_created
        CHECK (deleted_at IS NULL OR deleted_at >= created_at)
);

CREATE TABLE invoice_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL,
    payment_number VARCHAR(64) NOT NULL,
    method payment_method NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    paid_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    received_by_user_id UUID,
    reference_number VARCHAR(120),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    CONSTRAINT fk_invoice_payments_invoice
        FOREIGN KEY (invoice_id)
        REFERENCES invoices (id)
        ON DELETE CASCADE,
    CONSTRAINT fk_invoice_payments_received_by_user
        FOREIGN KEY (received_by_user_id)
        REFERENCES users (id)
        ON DELETE SET NULL,
    CONSTRAINT chk_invoice_payments_amount_positive
        CHECK (amount > 0),
    CONSTRAINT chk_invoice_payments_deleted_after_created
        CHECK (deleted_at IS NULL OR deleted_at >= created_at)
);

CREATE UNIQUE INDEX uq_invoices_clinic_number_active
    ON invoices (clinic_id, invoice_number)
    WHERE deleted_at IS NULL;

CREATE UNIQUE INDEX uq_invoice_payments_number_active
    ON invoice_payments (payment_number)
    WHERE deleted_at IS NULL;

CREATE INDEX idx_invoices_clinic_status_active
    ON invoices (clinic_id, status, created_at DESC)
    WHERE deleted_at IS NULL;

CREATE INDEX idx_invoices_patient_active
    ON invoices (patient_id, created_at DESC)
    WHERE deleted_at IS NULL;

CREATE INDEX idx_invoice_line_items_invoice_active
    ON invoice_line_items (invoice_id)
    WHERE deleted_at IS NULL;

CREATE INDEX idx_invoice_payments_invoice_active
    ON invoice_payments (invoice_id, paid_at DESC)
    WHERE deleted_at IS NULL;

CREATE TRIGGER trg_invoices_set_updated_at
BEFORE UPDATE ON invoices
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_invoice_line_items_set_updated_at
BEFORE UPDATE ON invoice_line_items
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_invoice_payments_set_updated_at
BEFORE UPDATE ON invoice_payments
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

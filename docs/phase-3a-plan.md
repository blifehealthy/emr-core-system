# Phase 3A Plan

Phase 3A starts the billing and payment foundation after Phase 2 pilot-readiness
scope closure.

## Status

Phase 3A has started. The first implementation slice adds invoice, invoice line
item, and payment foundations with API support for a basic cashier workflow.

## Completed In This Pass

- Added billing schema:
  - `invoices`
  - `invoice_line_items`
  - `invoice_payments`
- Added invoice status model:
  - `draft`
  - `issued`
  - `partially_paid`
  - `paid`
  - `voided`
- Added payment methods:
  - `cash`
  - `card`
  - `bank_transfer`
  - `qr`
  - `insurance`
  - `other`
- Added invoice services:
  - create invoice with line items
  - get invoice with line items and payments
  - list invoices by clinic/patient/status
  - record invoice payment and update paid/balance/status
- Added API routes:
  - `GET /api/invoices?clinicId=...&patientId=...&status=...&limit=...&offset=...`
  - `GET /api/invoices/:id`
  - `POST /api/invoices`
  - `POST /api/invoices/:id/payments`
- Added billing permissions:
  - billing read: doctor, nurse, admin
  - billing write: admin
- Added audit logs for invoice creation and payment recording.
- Expanded API smoke to create an invoice, record a payment, and list partially
  paid invoices.

## Current Limitations

- No billing frontend yet.
- No receipt print/export yet.
- No void/refund workflow yet.
- No automated charge generation from prescriptions or visit templates yet.
- No insurance claim lifecycle beyond a payment method enum.

## Recommended Next Phase 3A Batch

1. Add frontend cashier tab for invoices and payment recording.
2. Add receipt/print export.
3. Add invoice void/refund controls with audit.
4. Add optional charge templates for common visit/procedure fees.

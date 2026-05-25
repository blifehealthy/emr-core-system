# Phase 3A Plan

Phase 3A starts the billing and payment foundation after Phase 2 pilot-readiness
scope closure.

## Status

Phase 3A has a usable cashier foundation. It includes invoice/payment APIs,
refund and void actions, charge templates for common fees, and a frontend
cashier tab with receipt printing.

## Completed In This Pass

- Added billing schema:
  - `invoices`
  - `invoice_line_items`
  - `invoice_payments`
  - `invoice_refunds`
  - `charge_templates`
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
  - record refund and recalculate paid/refunded/balance values
  - void invoice with reason
  - list/create/update charge templates
- Added API routes:
  - `GET /api/invoices?clinicId=...&patientId=...&status=...&limit=...&offset=...`
  - `GET /api/invoices/:id`
  - `POST /api/invoices`
  - `POST /api/invoices/:id/payments`
  - `POST /api/invoices/:id/refunds`
  - `PATCH /api/invoices/:id/void`
  - `GET /api/charge-templates?clinicId=...&active=...`
  - `POST /api/charge-templates`
  - `PATCH /api/charge-templates/:id`
- Added billing permissions:
  - billing read: doctor, nurse, admin
  - billing write: admin
- Added audit logs for invoice creation, payment recording, refund recording,
  invoice voiding, and charge template changes.
- Added frontend Cashier tab:
  - invoice search by clinic/patient/status
  - invoice creation from charge templates or manual line item
  - payment/refund/void controls
  - invoice detail expansion
  - receipt print view
- Expanded API smoke to create a charge template and invoice, record a payment
  and refund, list partially paid invoices, and void an invoice.

## Current Limitations

- No multi-line invoice editor yet; the first UI supports one line item per
  invoice creation.
- No automated charge generation from prescriptions or visit templates yet.
- No insurance claim lifecycle beyond a payment method enum.

## Recommended Next Phase 3A Batch

1. Add multi-line invoice editing before issue/final payment.
2. Add automated charge capture from visit type, procedure, prescription, and
   lab orders.
3. Add receipt numbering/tax invoice policy fields.
4. Add insurance claim lifecycle beyond payment method tagging.

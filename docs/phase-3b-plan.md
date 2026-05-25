# Phase 3B Plan

Phase 3B turns the Phase 3A cashier workflow into a more complete accounting
operations surface.

## Scope

- Billing summary report for a clinic and date range.
- CSV export for accounting handoff.
- Clinic-managed billing number sequences for invoice, receipt, tax invoice,
  and claim numbers.
- Cashier reconciliation records for opening cash, expected cash, counted cash,
  and variance.
- Frontend Cashier tab controls for report metrics, number sequence actions,
  and cash reconciliation.

## Acceptance

- Billing report endpoints return JSON and CSV for the same date range.
- Number sequence creation and number issuing are audited.
- Cashier reconciliation can be opened and closed, with expected cash calculated
  from same-day cash payments.
- API smoke covers the Phase 3B reporting, numbering, and reconciliation paths.

## Out Of Scope

- Statutory tax invoice format certification.
- Direct accounting system integration.
- Payer clearinghouse submission.
- Multi-cashier drawer balancing.

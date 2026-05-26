# Phase 3P Plan: Pharmacy Override Review Report

## Goal

Give clinic owners and pharmacy leads a review surface for expiry and FEFO
overrides introduced in Phase 3O.

## Scope

- Add a date-range pharmacy override report API.
- Include dispense and transfer override events in one report.
- Provide totals by override type, event type, item, and recent event details.
- Add CSV export for audit/review meetings.
- Show override counts in the operations dashboard.

## Out Of Scope

- Approval workflow for override events.
- Notification routing.
- Controlled-substance register.
- External BI/accounting exports.

## Acceptance Criteria

- `GET /api/reports/pharmacy-overrides` returns override aggregates.
- `GET /api/reports/pharmacy-overrides.csv` exports the same report.
- Dashboard loads the report with the same date range as daily operations.
- API smoke verifies JSON and CSV report endpoints after creating override rows.

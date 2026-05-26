# Phase 3R Plan: Controlled Substance Register

## Goal

Give clinic owners and pharmacy leads a first controlled-substance register for
reviewing controlled item receiving, dispensing, and transfer activity.

## Scope

- Add controlled-substance flags to inventory items.
- Support optional controlled schedule/category on inventory items.
- Add `GET /api/reports/controlled-substances`.
- Add `GET /api/reports/controlled-substances.csv`.
- Combine controlled item events from:
  - inventory lot receiving
  - prescription dispensing
  - inventory transfers
- Show controlled-substance totals and recent events in the operations dashboard.
- Add API, service, migration, frontend smoke, and API smoke coverage.

## Out Of Scope

- Jurisdiction-specific narcotic forms.
- Witness/co-sign workflow.
- Regulatory e-submission.
- Per-role custom permission editor.

## Acceptance Criteria

- Inventory items can be marked as controlled substances.
- Controlled item receiving, dispensing, and transfer rows appear in the register.
- JSON and CSV report endpoints return date-range results.
- Operations dashboard shows controlled item totals and register activity.
- API smoke verifies the register after creating controlled item activity.

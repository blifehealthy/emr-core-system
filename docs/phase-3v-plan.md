# Phase 3V Plan: Controlled Substance Reconciliation

## Goal

Add a controlled-drug reconciliation workflow so pharmacy and clinic owners can
open a count round, snapshot expected controlled-stock quantity, close the round
with counted quantity, and review any variance.

## Scope

- Add `controlled_substance_reconciliations` with clinic/date/status, expected
  quantity, counted quantity, variance, users, timestamps, and notes.
- Snapshot expected quantity from active controlled inventory items when a round
  is opened.
- Add APIs to list, open, and close controlled-drug reconciliation rounds.
- Show open reconciliation rounds in the Operations dashboard controlled
  substance panel.
- Add API smoke, frontend workflow smoke, service/API/migration tests, and docs.

## Out Of Scope

- Per-lot physical counting.
- Dual-approval for variance sign-off.
- Barcode scan counting during reconciliation.
- External regulatory submission.

## Acceptance Criteria

- Admin can open one reconciliation round per clinic/date.
- Expected quantity is captured at open time from active controlled inventory.
- Admin can close an open round with counted quantity and variance reason.
- Closed rounds store counted quantity and variance quantity.
- Operations dashboard can list open rounds and close them.
- API smoke covers open/list/close through the real API.

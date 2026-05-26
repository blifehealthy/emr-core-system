# Phase 3W Plan: Controlled Reconciliation Variance Approval

## Goal

Add an approval step for controlled-drug reconciliation rounds that close with a
non-zero variance, so clinic owners or pharmacy leads can review the reason
before the round becomes fully closed.

## Scope

- Extend controlled reconciliation status with `pending_approval`.
- Add approval user, approval timestamp, and approval note fields.
- Change close behavior so zero variance closes immediately and non-zero
  variance moves to pending approval.
- Add an approve API and audit event.
- Add Operations dashboard action for pending approval rounds.
- Add migration, service/API/frontend smoke coverage, and UAT docs.

## Out Of Scope

- Enforcing a different approving user from the closer.
- Per-lot controlled-drug counting.
- Dual-signature or witness re-authentication for reconciliation approval.
- Regulatory export.

## Acceptance Criteria

- Closing with zero variance returns `closed`.
- Closing with non-zero variance returns `pending_approval`.
- Pending approval rounds can be approved with approval note and approver.
- Approval writes an audit log action.
- Operations dashboard can approve pending variance rounds.

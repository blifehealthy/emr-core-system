# Phase 3X Plan: Controlled Reconciliation Approver Separation

## Goal

Strengthen controlled-drug reconciliation governance by requiring the variance
approver to be different from the user who closed the count round.

## Scope

- Enforce approver/closer separation in the reconciliation approval service.
- Add a database check constraint to prevent same-user approval records.
- Return a clear conflict response when the closer tries to approve their own
  variance.
- Ignore spoofed approval user IDs from the request body and use the resolved
  actor user.
- Add API smoke coverage for self-approval rejection and separate-user approval.
- Update UAT and clinician-facing docs.

## Out Of Scope

- Per-user permission groups beyond existing route permissions.
- Re-authentication or witness signature for variance approval.
- Per-lot physical count workflow.
- Multi-step approval routing.

## Acceptance Criteria

- A pending variance cannot be approved by the same user who closed the round.
- A different authorized user can approve the pending variance.
- The response for self-approval is a `409` conflict with a clear message.
- Database constraints protect against same-user approver/closer records.
- API smoke and full test suite pass.

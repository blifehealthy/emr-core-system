# Phase 2G Plan

Phase 2G closes the production identity operations layer for the current Phase 2
scope. It focuses on audit visibility and operator runbooks around auth,
authorization, provider keys, and readiness failures.

## Status

Phase 2G is ready for clinician/operator review.

## Completed In This Pass

- API responses with `401` now write `security_event` audit logs with action
  `auth_failed`.
- API responses with `403` now write `security_event` audit logs with action
  `authorization_failed`.
- Security audit metadata includes method, path, status, error, OIDC subject,
  and role when available.
- Security audit failures are intentionally non-blocking so the original API
  response is preserved.
- `/api/auth/sessions` keeps its existing dedicated login audit behavior.
- Added tests for bearer authentication failure audit and role authorization
  failure audit.
- Added operator runbook:
  - `docs/identity-security-operations-runbook.md`
- Thai clinician/operator summary added:
  - `docs/phase-2g-clinician-summary-th.md`
- Thai UAT checklist added:
  - `docs/phase-2g-uat-checklist-th.md`

## Operational Outcomes

- Admin/operators can search audit logs for `security_event` records.
- Repeated missing/invalid bearer tokens can be investigated.
- Repeated role denial events can be investigated.
- Provider key rotation and MFA incidents now have a documented response path.

## Remaining Follow-Ups

- Run Phase 2G UAT with the selected identity provider and deployment operator.
- Add deployment platform alerts from real logs/metrics after hosting is chosen.
- Run a tabletop incident drill before pilot go-live.

## Recommended Next Phase

Start the Phase 2 pilot closure pass:

- run Phase 2A-2G UAT checklists
- fix issues found by clinicians/operators
- produce pilot go/no-go summary
- freeze Phase 2 scope before Phase 3 planning

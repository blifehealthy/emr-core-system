# Phase 4A Plan: Production Readiness And Ops Drill

## Goal

Turn the Phase 3 feature-complete system into a pilot-ready operational package
with explicit readiness evidence, named owners, and repeatable deployment,
backup, restore, rollback, and incident drills.

## Scope

- Add an automated ops-drill readiness gate: `npm run ops:check`.
- Document required evidence flags and owner fields for go-live.
- Update monitoring/backup and production readiness runbooks.
- Add a Phase 4A UAT/operator checklist.
- Add a Phase 4A closure summary for clinic owners and operators.
- Keep Phase 4A focused on operations; no new clinical/business feature scope.

## Out Of Scope

- New pharmacy, billing, or patient communication features.
- Provider-specific infrastructure implementation.
- Live monitoring vendor integration.
- Live backup provider setup.
- Hardware printer bridge implementation.

## Acceptance Criteria

- Operators can run `npm run ops:check`.
- Strict ops check fails when required drill evidence or owners are missing.
- Strict ops check passes when all evidence and owners are recorded.
- Docs clearly state what must be done before pilot go-live.
- Phase 4A verification includes TypeScript, targeted ops tests, full test
  suite, and docs updates.

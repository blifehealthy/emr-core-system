# Phase 3T Plan: Controlled Witness Re-authentication

## Goal

Upgrade the Phase 3S controlled-dispense witness step from user-id capture to
explicit witness re-authentication with audit-friendly signature metadata.

## Scope

- Require a configured witness login code for controlled-substance dispensing.
- Require `witnessLoginCode` alongside `witnessUserId` for controlled items.
- Verify the witness user is active and belongs to the same clinic as the controlled item.
- Store witness re-auth method, re-auth time, and a non-secret signature hash.
- Keep non-controlled dispensing unchanged.
- Add frontend prompt, migration, service tests, API smoke, frontend smoke, and documentation coverage.

## Out Of Scope

- Per-user passwords.
- Biometric or hardware-token signatures.
- Jurisdiction-specific controlled-drug submission formats.
- Configurable per-drug witness thresholds.

## Acceptance Criteria

- Non-controlled dispense still works without witness re-auth.
- Controlled dispense without witness login code is rejected.
- Controlled dispense with an invalid witness login code is rejected.
- Controlled dispense with an inactive or cross-clinic witness is rejected.
- Controlled dispense with a valid different witness stores re-auth and signature metadata.
- Controlled-substance register events include witness re-auth metadata for dispense rows.

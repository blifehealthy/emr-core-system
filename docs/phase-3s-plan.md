# Phase 3S Plan: Controlled Dispense Witness

## Goal

Add a witness/co-sign foundation for controlled-substance dispensing so the
controlled register from Phase 3R has accountable review metadata.

## Scope

- Add witness fields to medication dispense rows.
- Require `witnessUserId` when dispensing an inventory item marked as a controlled substance.
- Block the same user from being both dispenser and witness.
- Store witness time and optional witness note.
- Surface witness prompts in the Pharmacy inventory dispense flow.
- Include witness metadata in controlled-substance register events.
- Add migration, service, frontend smoke, API smoke, and documentation coverage.

## Out Of Scope

- Digital signatures.
- Password re-authentication for the witness.
- Jurisdiction-specific controlled-drug submission forms.
- Configurable per-drug witness policies.

## Acceptance Criteria

- Non-controlled dispense still works without witness.
- Controlled dispense without witness is rejected.
- Controlled dispense with the same dispenser and witness is rejected.
- Controlled dispense with a different witness succeeds and stores witness metadata.
- Controlled substance register recent events include witness metadata for dispense rows.

# Handoff Next

## Current State

- Current branch: `codex/emr-core-soap-read-write`
- PR #3 is already merged into this branch
- Recent local commits after merge:
  - `c2a720e` Harden API DTOs for users practitioners and SOAP notes
  - `beff924` Align updateUser patch semantics
- Latest small unpushed work in this round:
  - added SOAP note service tests for read + soft delete

## Already Done

- patient detail read now includes prescriptions
- diagnosis / vital sign / prescription CRUD-style API flows exist
- SOAP / diagnosis / vital sign / prescription response shaping is hardened through DTO mapping
- user / practitioner response shaping is also hardened
- actor resolution now prefers DB-backed identity instead of trusting `x-user-role`
- PATCH semantics were fixed for:
  - diagnosis
  - vital sign
  - prescription
  - practitioner
  - SOAP note
  - user
- local verification already completed in prior rounds:
  - `npm test`
  - `npm run api:smoke`

## New Tests Added In This Round

- `backend/services/getSoapNoteByClinicalNoteId.test.ts`
- `backend/services/softDeleteSoapNote.test.ts`

Verification run for this micro-round:

- `node --loader ts-node/esm --test backend/services/getSoapNoteByClinicalNoteId.test.ts backend/services/softDeleteSoapNote.test.ts`

## Best Next Tasks

1. Push recent local commits if they should be preserved remotely:
   - `c2a720e`
   - `beff924`
   - the commit created after this handoff file
2. Continue small, quota-efficient hardening by adding missing service tests for the same pattern:
   - `getDiagnosisById`
   - `softDeleteDiagnosis`
   - `getVitalSignById`
   - `softDeleteVitalSign`
   - `getPrescriptionById`
   - `softDeletePrescription`
3. After that, run a targeted subset or full `npm test` when quota/time allows.

## Notes

- If continuing with very low quota, prefer:
  - tiny service tests
  - tiny DTO/projection cleanups
  - frequent small commits
- Avoid starting another large API expansion before pushing the local follow-up commits.

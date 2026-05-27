# Phase 4D Plan: Scanner UX Hardening

Phase 4D hardens the pharmacy scanner panel for keyboard-wedge barcode scanners
and real pharmacy desk use.

## Scope

- Keep focus on the scan input after each scan.
- Clear the scan input after successful scans by default.
- Trim scanner input before sending it to the API.
- Add operator toggles for keep-focus and clear-after-scan behavior.
- Show parsed GS1 scan details returned by the API.
- Add frontend smoke coverage for the hardened scanner panel.
- Add runbook, UAT checklist, and closure notes.

## Out Of Scope

- Native scanner driver configuration.
- Full offline scanning queue.
- Additional GS1 application identifiers.
- New database schema.

## Verification

- Frontend JavaScript syntax check.
- Frontend workflow smoke check.
- TypeScript compile check.
- Full test suite before commit.

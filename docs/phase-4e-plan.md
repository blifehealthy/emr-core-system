# Phase 4E Plan: Barcode Label Template Management

Phase 4E adds structured barcode label templates for pharmacy label export.

## Scope

- Add clinic-level item, lot, bin, and generic label templates.
- Store printer language, dimensions, enabled fields, header text, footer text,
  active status, and per-type default flag.
- Add list/create/update API endpoints.
- Let barcode print jobs reference an active template.
- Add frontend template creation, listing, and export selection.
- Add tests, runbook, UAT checklist, and closure notes.

## Out Of Scope

- Drag-and-drop visual template editing.
- Vendor-specific printer certification.
- Offline print queue.
- Full label preview designer.

## Verification

- TypeScript compile check.
- Frontend syntax and workflow smoke checks.
- Targeted service/API/migration tests.
- Full test suite before commit.

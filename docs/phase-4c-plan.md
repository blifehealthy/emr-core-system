# Phase 4C Plan: GS1 Barcode Parsing Foundation

Phase 4C adds GS1 parsing to the existing pharmacy barcode scan and verification
workflow.

## Scope

- Parse common GS1 application identifiers:
  - `01` GTIN
  - `17` expiry date
  - `10` lot number
  - `21` serial number
- Store parsed GS1 metadata on barcode scan audit rows.
- Match scan lookup by raw barcode, GTIN, or lot number.
- Allow receiving, purchase-order receiving, and dispensing verification to
  accept parsed GS1 values.
- Keep existing manual barcode and lot barcode workflow unchanged.
- Add tests, migration guard, runbook, UAT checklist, and closure notes.

## Out Of Scope

- Full GS1 AI catalog.
- Hardware scanner driver configuration.
- Label template editor.
- Regulatory export.

## Verification

- TypeScript compile check.
- Targeted GS1 parser, scan, receiving, and migration tests.
- Full test suite before commit.

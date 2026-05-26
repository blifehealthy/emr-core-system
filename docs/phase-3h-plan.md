# Phase 3H Plan

Phase 3H adds barcode verification to pharmacy receiving and dispensing on top
of the Phase 3G approval route.

## Scope

- Barcode fields on inventory items and inventory lots.
- Optional barcode-required flag on inventory items.
- Manual lot receiving can store lot barcode and scanned barcode.
- Purchase order receiving can verify a scanned barcode before stock is added.
- Prescription dispensing can verify a scanned barcode before stock is reduced.
- Barcode scan endpoint records lookup/receiving/dispensing scan attempts.
- Prescriptions tab exposes barcode fields for inventory item creation, lot
  receiving, PO receiving, and dispensing prompts.

## Acceptance

- Users can create inventory items with a barcode.
- Users can receive stock with a scanned barcode and see barcode verification
  status on the lot.
- Receiving fails when barcode verification is required and the scan does not
  match the item or lot barcode.
- Dispensing fails when barcode verification is required and the scan does not
  match the selected item or lot barcode.
- API smoke covers scan lookup, verified receiving, and verified dispensing.

## Out Of Scope

- Hardware scanner integration beyond keyboard-style barcode input.
- Barcode label printing.
- GS1 parsing and manufacturer pack-level serialization.
- Multi-location bin scanning.
- Controlled-substance register.

# Phase 3J Plan

Phase 3J adds label-printer export and print-job audit on top of the Phase 3I
barcode scanner UX.

## Scope

- Barcode print job table for audit and reprint traceability.
- API `POST /api/inventory-barcode-print-jobs`.
- Server-side rendered payload for `html`, `zpl`, and `escpos`.
- Pharmacy inventory panel can export loaded labels as ZPL.
- Pharmacy inventory panel can export loaded labels as ESC/POS.
- Frontend opens export payload in a text view for printer utility handoff.

## Acceptance

- Users can create a barcode print job with at least one label.
- ZPL export contains printer commands and barcode data.
- ESC/POS export contains printer-oriented payload and barcode marker.
- Print job response includes language, label count, and rendered payload.
- API smoke covers ZPL print job creation.
- Frontend workflow smoke covers ZPL and ESC/POS export actions.

## Out Of Scope

- Direct USB/network printer driver integration.
- Printer fleet management.
- Reprint approval workflow.
- GS1 parsing.
- Multi-location bin label templates.

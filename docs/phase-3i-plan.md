# Phase 3I Plan

Phase 3I turns the Phase 3H barcode data model into a usable pharmacy scanner
and label-printing workflow.

## Scope

- Scanner panel in the Prescriptions tab pharmacy inventory workspace.
- Barcode scan lookup calls `POST /api/inventory-barcode-scans`.
- Scan result shows matched or unmatched inventory item/lot feedback.
- Barcode label print view for inventory items and inventory lots.
- Item and lot cards expose one-click label printing.
- Bulk label printing for all currently loaded barcode-enabled items and lots.

## Acceptance

- Pharmacy users can scan or type a barcode from the pharmacy inventory panel.
- The scanner records a scan audit row and shows matched item/lot feedback.
- Pharmacy users can print a label for one inventory item.
- Pharmacy users can print a label for one inventory lot.
- Pharmacy users can print a sheet of all loaded barcode labels.
- Frontend static smoke checks cover scanner and label print builders.

## Out Of Scope

- Native USB scanner configuration.
- ZPL/ESC/POS printer language export.
- GS1 parsing.
- Print job queue and reprint audit approval.
- Multi-location bin labels.

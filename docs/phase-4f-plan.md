# Phase 4F Plan

Phase 4F closes the operational gap when barcode printer bridge or network
printing is unavailable during clinic operations.

## Goals

- Track degraded-mode print fallback decisions on barcode print jobs.
- Let operators switch a failed job to browser export or manual print.
- Let operators retry a job after bridge/network recovery.
- Keep the original rendered payload available for audit and reprint.

## Scope

- Migration `0048_add_phase_4f_print_fallback_recovery`.
- API:
  - `PATCH /api/inventory-barcode-print-jobs/:jobId/fallback`
  - `PATCH /api/inventory-barcode-print-jobs/:jobId/retry`
- Print job list filtering by `fallbackStatus`.
- Pharmacy frontend print recovery panel.
- Runbook, UAT checklist, and closure summary.

## Out Of Scope

- Vendor-specific printer driver or utility bridge packaging.
- Offline local database sync.
- Hardware certification for specific printer models.

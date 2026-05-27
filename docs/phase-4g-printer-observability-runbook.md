# Phase 4G Printer Observability Runbook

Use this runbook during printer bridge drills or when pharmacy reports label
printing delays.

## Dashboard Check

1. Open the Operations dashboard.
2. Set the report date range.
3. Click load.
4. Review the Printer bridge health chart.

Key metrics:

- `Print jobs`: total barcode label jobs in the period.
- `Queued`: jobs waiting for bridge/network delivery.
- `Failed`: jobs acknowledged as failed.
- `Fallbacks`: jobs moved to browser/manual fallback.
- `Retries`: jobs requeued after recovery.

## JSON Report

```http
GET /api/reports/printer-bridge-health?clinicId=<clinic-id>&startDate=2026-05-27&endDate=2026-05-27
```

Use JSON when integrating with monitoring or support tooling.

## CSV Report

```http
GET /api/reports/printer-bridge-health.csv?clinicId=<clinic-id>&startDate=2026-05-27&endDate=2026-05-27
```

Use CSV for printer bridge incident review, UAT evidence, or sharing with IT.

## Triage Flow

1. Check `failed_total`.
2. If failed is high, inspect `by_printer_profile`.
3. If queued is high, inspect bridge polling using the Phase 4B runbook.
4. If fallback is high, inspect the Phase 4F recovery notes.
5. If retry is high and failures continue, pause new hardware expansion until
   the printer path is stable.

## Evidence To Capture

- Date range.
- Failed and fallback totals.
- Printer profile with highest failed count.
- Three recent problem jobs.
- Action taken: retry, browser fallback, manual print, or bridge repair.

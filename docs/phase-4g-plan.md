# Phase 4G Plan

Phase 4G turns barcode printer bridge activity into an operator-visible health
report.

## Goals

- Show whether print jobs are stuck, failing, falling back, or retrying.
- Help IT identify printer profiles with repeated failures.
- Provide CSV evidence for printer bridge drills and incident review.
- Surface printer health on the existing operations dashboard.

## Scope

- Service `getPrinterBridgeHealthReport`.
- API:
  - `GET /api/reports/printer-bridge-health`
  - `GET /api/reports/printer-bridge-health.csv`
- Operations dashboard chart for printer bridge health.
- CSV export button for printer health report.
- API, service, frontend smoke, and documentation updates.

## Out Of Scope

- Vendor bridge daemon packaging.
- Hardware certification.
- Real-time push alerts.
- External monitoring provider integration.

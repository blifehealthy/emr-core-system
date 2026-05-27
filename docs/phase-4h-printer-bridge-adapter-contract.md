# Phase 4H Printer Bridge Adapter Contract

This is a vendor-neutral adapter contract for a local utility bridge or network
printer service. It does not implement a vendor driver. It defines the behavior
IT/vendor teams should implement against the EMR API.

## Goals

- Poll queued barcode print jobs.
- Deliver rendered `zpl`, `escpos`, or `html` payloads to a printer path.
- Acknowledge `printing`, `delivered`, `failed`, or `cancelled`.
- Preserve retry/fallback behavior from Phase 4F.
- Feed observability metrics from Phase 4G.

## Authentication

- Use API bearer token configured for the clinic bridge account.
- Store token outside source code.
- Rotate token before pilot and after operator turnover.
- Bridge account should have only the permissions required for:
  - `GET /api/inventory-barcode-print-jobs`
  - `PATCH /api/inventory-barcode-print-jobs/:jobId/delivery`

## Polling

```http
GET /api/inventory-barcode-print-jobs?clinicId=<clinic-id>&deliveryStatus=queued&connectionType=utility_bridge
```

Recommended interval:

- normal: every 5 to 10 seconds
- degraded network: every 30 seconds
- after repeated failures: exponential backoff up to 2 minutes

The adapter must not delete jobs from the EMR.

## Print Job Fields

Required fields to consume:

- `id`
- `printer_language`
- `connection_type`
- `delivery_status`
- `target_endpoint`
- `rendered_payload`
- `label_count`
- `delivery_attempt_count`
- `label_template_id`
- `requested_at`

## Delivery Flow

1. Poll queued jobs.
2. Pick oldest job first.
3. Mark job as printing.
4. Send `rendered_payload` to printer.
5. Mark job as delivered or failed.

Mark printing:

```http
PATCH /api/inventory-barcode-print-jobs/<job-id>/delivery
```

```json
{
  "deliveryStatus": "printing"
}
```

Mark delivered:

```json
{
  "deliveryStatus": "delivered"
}
```

Mark failed:

```json
{
  "deliveryStatus": "failed",
  "deliveryError": "Printer offline"
}
```

## Error Handling

The adapter should mark failed when:

- printer is offline
- target endpoint is unreachable
- payload language is unsupported
- paper/label media is missing
- driver returns an error
- print timeout is exceeded

The adapter should include concise `deliveryError` text that an operator can
understand.

## Retry And Fallback

The adapter should not create duplicate print jobs during failure recovery.

Recovery options:

- Operator uses browser/manual fallback with Phase 4F APIs.
- Operator retries after printer path is healthy.
- Adapter polls again after retry returns job to `queued`.

## Observability

IT should review:

```http
GET /api/reports/printer-bridge-health?clinicId=<clinic-id>&startDate=<date>&endDate=<date>
```

Minimum metrics to monitor:

- queued jobs
- failed jobs
- fallback jobs
- retry jobs
- failed count by printer profile

## Local Adapter Logging

Each adapter event should log locally:

- timestamp
- clinic ID
- print job ID
- printer profile or endpoint
- delivery status
- attempt count
- error text

Do not log patient clinical content beyond the print job ID unless required for
support and approved by the clinic owner.

## Certification Checklist

- [ ] Polls queued jobs only
- [ ] Marks printing before delivery
- [ ] Marks delivered after successful print
- [ ] Marks failed with error text on failure
- [ ] Does not duplicate jobs during retry
- [ ] Supports configured payload language
- [ ] Handles printer offline
- [ ] Handles malformed endpoint
- [ ] Uses bearer token from secure config
- [ ] Logs job ID/status/error locally
- [ ] Operator can use fallback while adapter is down
- [ ] Printer health report shows activity after test

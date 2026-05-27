# Phase 4F Print Recovery Runbook

Use this runbook when barcode labels cannot be delivered through the configured
printer bridge or network printer.

## Detect

1. Open the Pharmacy inventory panel.
2. Check the Print recovery section.
3. Prioritize jobs with `delivery_status` as `failed`, `queued`, or `printing`.
4. Review `last_delivery_error`, `connection_type`, and `delivery_attempt_count`.

## Browser Fallback

Use browser fallback when labels still need to be printed immediately.

```http
PATCH /api/inventory-barcode-print-jobs/<job-id>/fallback
```

```json
{
  "fallbackStatus": "browser_export",
  "fallbackReason": "Bridge unavailable, exported through browser"
}
```

Expected result:

- `delivery_status` becomes `exported`
- `connection_type` becomes `browser`
- original `rendered_payload` remains available
- fallback user, reason, and timestamp are recorded

## Manual Print

Use manual print when staff printed from a local copy or another workstation.

```json
{
  "fallbackStatus": "manual_print",
  "fallbackReason": "Printed manually during degraded mode"
}
```

Expected result:

- `delivery_status` becomes `cancelled`
- `fallback_status` becomes `manual_print`
- fallback reason and timestamp are recorded

## Retry

Use retry after the printer bridge or network path is healthy again.

```http
PATCH /api/inventory-barcode-print-jobs/<job-id>/retry
```

```json
{
  "retryReason": "Printer bridge recovered"
}
```

Expected result:

- browser jobs become `exported`
- bridge/network jobs become `queued`
- `last_delivery_error` is cleared
- retry user and timestamp are recorded

## Operator Notes

- Do not create duplicate labels until the recovery status is recorded.
- Keep failed jobs visible until the pharmacist confirms labels were applied to
  the correct item, lot, or bin.
- Use Phase 4B bridge runbook if repeated retry returns to `failed`.

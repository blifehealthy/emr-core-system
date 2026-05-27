# Phase 4B Printer Bridge Runbook

Use this runbook when testing a local printer bridge or manual bridge simulator.

## Preconditions

- Printer profiles are created with `connection_type` as `utility_bridge` or
  `network`.
- Barcode print jobs can be created from the Pharmacy inventory panel or
  `POST /api/inventory-barcode-print-jobs`.
- The bridge account has read/write inventory permission for the clinic.

## Poll Queue

Poll queued jobs for one clinic:

```bash
GET /api/inventory-barcode-print-jobs?clinicId=<clinic-id>&deliveryStatus=queued&connectionType=utility_bridge
```

Optional filters:

- `printerProfileId`
- `connectionType=network`
- `limit`
- `offset`

The response includes `rendered_payload`, printer language, target endpoint,
label count, delivery status, and delivery attempt metadata.

## Acknowledge Delivery

Mark a job as being printed:

```bash
PATCH /api/inventory-barcode-print-jobs/<job-id>/delivery
{
  "deliveryStatus": "printing"
}
```

Mark as delivered:

```bash
PATCH /api/inventory-barcode-print-jobs/<job-id>/delivery
{
  "deliveryStatus": "delivered"
}
```

Mark as failed:

```bash
PATCH /api/inventory-barcode-print-jobs/<job-id>/delivery
{
  "deliveryStatus": "failed",
  "deliveryError": "printer offline"
}
```

## Operator Checks

- Failed jobs show `last_delivery_error`.
- Every acknowledgement increments `delivery_attempt_count`.
- Delivered jobs set `delivered_at`.
- Audit log records `delivery_updated` for the print job.

## Fallback

If the bridge is unavailable, switch the printer profile connection to `browser`
or export ZPL/ESC/POS manually from the existing UI.

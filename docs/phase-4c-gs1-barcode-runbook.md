# Phase 4C GS1 Barcode Runbook

Use this runbook to test manufacturer-style GS1 barcode scans in the pharmacy
workflow.

## Supported Application Identifiers

- `01`: GTIN, 14 digits
- `17`: expiry date in `YYMMDD`; `00` day is treated as the last day of month
- `10`: lot number
- `21`: serial number

The parser accepts both parenthesized text such as
`(01)01234567890128(17)260531(10)LOT-42` and scanner text without parentheses.

## Scan Lookup

Send a scan through the existing endpoint:

```bash
POST /api/inventory-barcode-scans
{
  "clinicId": "<clinic-id>",
  "barcode": "(01)01234567890128(17)260531(10)LOT-42",
  "scanContext": "receiving"
}
```

Expected response fields include:

- `gs1_gtin`
- `gs1_lot_number`
- `gs1_expires_on`
- `gs1_serial_number`
- existing item/lot match fields

## Verification Workflow

For receiving or dispensing, barcode verification can pass when:

- raw scanned barcode equals stored item or lot barcode
- parsed GTIN equals stored item barcode
- parsed lot number equals the target lot number or lot barcode

## Fallback

If scanner output is not GS1-compatible, continue using manual item barcode,
lot barcode, or browser/manual print workflows.

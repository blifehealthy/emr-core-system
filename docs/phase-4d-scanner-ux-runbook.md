# Phase 4D Scanner UX Runbook

Use this runbook when testing a USB/Bluetooth barcode scanner in keyboard-wedge
mode.

## Scanner Panel

Open the Pharmacy inventory scanner panel and confirm:

- The scan field receives focus automatically.
- Scanner input is trimmed before API submission.
- `Keep focus` is enabled by default.
- `Clear after scan` is enabled by default.
- Scan result shows matched item/lot and GS1 details when available.

## Recommended Scanner Mode

- Keyboard wedge mode.
- Send Enter after scan.
- Use GS1 separator support if the scanner can preserve ASCII 29.

## Fallback

If a scanner sends unusual characters or does not submit Enter:

- Type or paste the barcode manually.
- Disable `Clear after scan` while debugging.
- Keep browser/manual label export available.
- Record the scanner model and raw sample in the UAT notes.

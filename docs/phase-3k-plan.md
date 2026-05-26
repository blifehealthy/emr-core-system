# Phase 3K Plan: Printer Profiles

## Goal

Build the direct printer integration foundation for pharmacy barcode labels without taking a hard dependency on one printer vendor or bridge utility.

## Scope

- Add clinic printer profiles for barcode label workflows.
- Store printer language, connection type, optional endpoint, location, default flag, active flag, and notes.
- Let barcode print jobs reference a printer profile.
- Record print-job connection type, target endpoint, and delivery status.
- Add API and frontend controls to create/select printer profiles from the Pharmacy inventory panel.

## Out Of Scope

- Native operating system print driver installation.
- Vendor-specific printer status polling.
- Automatic retry workers or background delivery.
- Receipt printer routing outside pharmacy barcode labels.

## Acceptance

- Pharmacy/admin users can create an active printer profile.
- One active default profile can be kept per clinic.
- Label export can include a selected printer profile.
- Print-job audit rows show the printer profile and whether the payload was exported or queued for bridge/network delivery.

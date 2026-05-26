# Phase 3L Plan: Inventory Locations

## Goal

Add a multi-location/bin foundation for pharmacy inventory so stock events can show where medicine was received, stored, adjusted, and dispensed.

## Scope

- Add clinic inventory locations with code, display name, type, default flag, active flag, and notes.
- Add location/bin metadata to inventory lots.
- Add location metadata to medication dispense and stock movement audit rows.
- Add list/create/update APIs for inventory locations.
- Add Pharmacy inventory UI controls to create locations and attach locations to receiving, adjustment, and dispensing workflows.

## Out Of Scope

- Per-location quantity ledger or transfer workflow.
- Automatic stock reservation.
- Multi-branch permission boundaries.
- Reorder rules per location.

## Acceptance

- Clinic staff can create an inventory location.
- Lot receiving can assign location and bin.
- Dispensing from a lot carries the lot location into the dispense record.
- Stock movement audit can be filtered by location.
- Existing workflows still work when no location is selected.

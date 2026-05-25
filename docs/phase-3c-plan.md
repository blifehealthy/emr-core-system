# Phase 3C Plan

Phase 3C adds the first pharmacy and inventory foundation on top of the
prescription safety work from Phase 2B.

## Scope

- Clinic inventory items linked optionally to drug catalog records.
- Quantity on hand, unit, reorder level, active flag, and low-stock visibility.
- Manual stock adjustment with stock movement audit trail.
- Prescription dispense workflow that reduces inventory and records a dispense.
- Frontend Prescriptions tab controls for inventory creation, stock adjustment,
  and dispense from a prescription.

## Acceptance

- Inventory items can be created, listed, and updated.
- Stock adjustments cannot take quantity below zero.
- Dispensing a prescription creates a dispense record, reduces stock, and writes
  a stock movement.
- Low-stock items are visible through the inventory list.
- API smoke covers inventory creation, adjustment, dispense, dispense list, and
  stock movement list.

## Out Of Scope

- Barcode scanning.
- Lot/expiry management.
- Purchase orders and supplier receiving.
- Multi-location inventory.
- Controlled substance compliance workflows.

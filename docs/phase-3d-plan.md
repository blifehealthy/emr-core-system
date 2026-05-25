# Phase 3D Plan

Phase 3D extends the Phase 3C pharmacy foundation with lot-level receiving and
expiry visibility.

## Scope

- Inventory lot table for clinic stock batches.
- Lot number, expiry date, received quantity, quantity on hand, supplier, and
  reference number tracking.
- Pharmacy receiving API that creates a lot, increases item quantity on hand,
  and writes a stock movement audit row.
- Optional lot selection when dispensing a prescription.
- Stock movements and dispense records retain the lot reference.
- Prescriptions tab shows lot counts, expiring lots, receiving form, and lot
  cards.

## Acceptance

- Users can receive stock into a named lot.
- Inventory item quantity increases when a lot is received.
- Users can list lots by clinic and inventory item.
- Dispensing with a lot reduces both item quantity and lot quantity.
- Stock movement audit rows include the lot id.
- API smoke covers receiving, lot listing, lot-based dispense, and stock
  movement audit.

## Out Of Scope

- Barcode scanning.
- Multi-location inventory.
- Purchase order approval workflow.
- Supplier master data.
- Controlled-substance register and witness workflow.

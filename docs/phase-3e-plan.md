# Phase 3E Plan

Phase 3E extends the Phase 3D lot/expiry pharmacy foundation with procurement
tracking for supplier master data and purchase order receiving.

## Scope

- Supplier master table for clinic pharmacy vendors.
- Purchase order and purchase order line tables.
- Purchase order status lifecycle from draft or ordered through received.
- API for supplier list/create/update.
- API for purchase order list/create/update.
- API for receiving a purchase order line into an inventory lot.
- Purchase order receiving increases inventory item quantity, creates a lot, and
  writes a lot-aware stock movement.
- Prescriptions tab shows supplier and purchase order controls inside the
  Pharmacy inventory panel.

## Acceptance

- Users can create and list active suppliers.
- Users can create purchase orders with at least one inventory item line.
- Users can receive a purchase order line into a lot.
- Receiving cannot exceed ordered quantity.
- Purchase order status changes to partially received or received based on line
  quantities.
- Stock movement audit rows are written when purchase order stock is received.
- API smoke covers supplier creation/listing, purchase order creation/listing,
  and purchase order receiving.

## Out Of Scope

- Approval hierarchy for purchase orders.
- Multi-location stock.
- Barcode scanning.
- Supplier payment/accounting integration.
- Controlled-substance register and witness workflow.

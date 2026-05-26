# Phase 3M Plan: Location Stock Ledger And Transfers

## Goal

Turn Phase 3L inventory locations into a usable stock ledger by tracking item quantity per location/bin and supporting stock transfer between locations.

## Scope

- Add `inventory_location_stocks` for item/location/bin quantities.
- Add `inventory_transfers` for completed transfer records.
- Update receiving, manual adjustment, purchase order receiving, and dispensing workflows to update location stock when a location is provided.
- Add list APIs for location stock and transfer audit.
- Add create API for immediate stock transfer.
- Add Pharmacy inventory UI sections for location stock and transfer creation.

## Out Of Scope

- Transfer approval workflow.
- Pending/in-transit transfer state.
- Lot-specific transfer ledger.
- Automatic reconciliation against historical records without location data.

## Acceptance

- Receiving into a location increases that location stock.
- Dispensing from a location decreases that location stock.
- Transfer moves quantity from one location/bin to another.
- Transfer writes stock movement audit rows.
- Existing no-location workflows remain supported.

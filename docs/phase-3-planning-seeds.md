# Phase 3 Planning Seeds

Phase 2 closes the pilot-readiness foundation. Phase 3 should be planned from
real UAT findings, but the likely product directions are below.

## Candidate Tracks

### Billing And Payment

- Phase 3A completed visit charge capture, invoice/receipt model, payment
  status, cashier workflow, and insurance claim foundation.
- Phase 3B completed report export for accounting, document number sequences,
  and cashier reconciliation foundation.
- Remaining billing follow-up should come from UAT: statutory tax invoice rules,
  accounting export integration, payer/insurer export, or multi-drawer cashier
  operations.

### Pharmacy And Inventory

- Phase 3C completed the first stock item model, dispensing workflow,
  prescription-to-dispense handoff, stock movement audit, and low-stock
  visibility.
- Phase 3D completed lot/expiry tracking, pharmacy receiving into lots, and
  lot-aware prescription dispensing.
- Phase 3E completed supplier master data, purchase order creation, and purchase
  order receiving into inventory lots with stock movement audit.
- Phase 3F completed purchase order submit/approve/reject controls and blocks
  receiving until a purchase order is approved.
- Phase 3G completed approval thresholds, generated approval steps, and
  multi-step approval routing.
- Phase 3H completed barcode verification foundation for item/lot barcode
  capture, scan audit, receiving verification, and dispensing verification.
- Phase 3I completed pharmacy scanner UX and barcode label printing foundation.
- Phase 3J completed ZPL/ESC/POS label export and print-job audit foundation.
- Phase 3K completed printer profiles for barcode label routing, including
  connection type, endpoint, default profile, and print-job routing audit.
- Phase 3L completed inventory locations/bins for lot receiving, dispensing,
  and stock movement audit.
- Phase 3M completed the first per-location stock ledger and immediate transfer
  workflow between inventory locations/bins.
- Phase 3N completed lot-specific transfer requests, approval-required
  transfer workflow, in-transit receiving, cancellation metadata, and
  frontend transfer actions.
- Phase 3O completed FEFO and expiry picking guards for lot-aware dispensing
  and transfer creation, including override reason audit fields.
- Phase 3P completed pharmacy override review reporting for FEFO/expiry
  dispense and transfer override events, including CSV export and dashboard
  visibility.
- Phase 3Q completed pharmacy role separation for FEFO/expiry override,
  transfer approval, transfer receiving, and transfer cancellation permissions.
- Phase 3R completed the controlled-substance register foundation for
  controlled item receiving, dispensing, and transfer review.
- Phase 3S completed the controlled dispense witness foundation for two-person
  review metadata on controlled item dispensing.
- Phase 3T completed the controlled witness re-authentication foundation with
  login-code confirmation and signature hash metadata.
- Remaining pharmacy follow-up should come from UAT: budget controls,
  notification integration, printer bridge delivery, supplier payment handoff,
  per-user password/MFA integration, controlled-drug reconciliation, or
  database-backed permission customization.

### Patient Communication

- appointment reminders
- prescription instructions export
- LINE or SMS integration
- consent-aware messaging rules

### Provider And Clinic Expansion

- multi-clinic organization support
- richer practitioner schedules
- room/resource scheduling
- role/permission customization

### Production Operations

- deployment-specific monitoring alerts
- backup restore drills on schedule
- security incident drills
- provider-specific key rotation automation

## Recommended Planning Rule

Start Phase 3 with the smallest track that directly removes the biggest blocker
from Phase 2 UAT or pilot operations.

Avoid starting broad integrations before:

- Phase 2 UAT blockers are closed
- pilot go/no-go is recorded
- clinical workflow wording is accepted
- production readiness is green in the target environment

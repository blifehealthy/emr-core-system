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
- Remaining pharmacy follow-up should come from UAT: supplier master workflow,
  purchase order approval, multi-location stock, barcode scanning, or controlled
  substance workflow.

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

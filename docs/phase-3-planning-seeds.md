# Phase 3 Planning Seeds

Phase 2 closes the pilot-readiness foundation. Phase 3 should be planned from
real UAT findings, but the likely product directions are below.

## Candidate Tracks

### Billing And Payment

- visit charge capture
- invoice/receipt model
- payment status
- cashier workflow
- report export for accounting

### Pharmacy And Inventory

- stock item model
- dispensing workflow
- prescription-to-dispense handoff
- stock movement audit
- low-stock reporting

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

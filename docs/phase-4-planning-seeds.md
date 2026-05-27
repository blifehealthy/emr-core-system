# Phase 4 Planning Seeds

Phase 3 implementation scope is closed. Phase 4 should start only after Phase 3
UAT/go-no-go identifies the highest operational blocker.

## Candidate Tracks

### Controlled Drug Deepening

- per-lot controlled reconciliation count
- controlled reconciliation witness/re-auth
- multi-step variance approval routing
- controlled drug exception dashboard
- controlled drug regulatory export if required by local workflow

### Pharmacy Hardware And Barcode

- Phase 4B completed the printer bridge queue foundation with queued print job
  listing, delivery acknowledgement, delivery attempt metadata, and fallback
  browser/export guidance.
- Phase 4C completed GS1 barcode parsing foundation for GTIN, expiry, lot, and
  serial metadata on pharmacy scans and verification workflows.
- Remaining pharmacy hardware and barcode candidates:
  - vendor-specific direct printer bridge service
  - hardware printer certification
  - scanner-specific UX hardening
  - label template management
  - offline or degraded-mode print fallback

### Accounting And Payer Integration

- statutory tax invoice rules
- accounting export
- payer/insurer claim export
- supplier payment handoff
- multi-drawer cashier operations

### Patient Communication

- appointment reminders
- prescription instruction export
- LINE/SMS integration
- consent-aware messaging rules

### Production Operations

- Phase 4A completed the production readiness and ops drill foundation with
  `npm run ops:check`, named owner evidence, backup/restore drill guidance,
  rollback drill guidance, and security incident tabletop guidance.
- Remaining production operations candidates:
  - environment-specific monitoring alert integration
  - provider-specific key rotation automation
  - automated backup job status ingestion
  - deployment platform-specific rollback automation

## Recommended Rule

Do not start a broad Phase 4 track until Phase 3 UAT produces:

- one named business owner
- one measurable blocker or benefit
- a fallback workflow
- a go/no-go decision for pilot

If no blocker is found, prioritize production operations over new features.

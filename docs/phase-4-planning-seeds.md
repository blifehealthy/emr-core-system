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

- direct printer bridge for configured printer profiles
- GS1 barcode parsing
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

- environment-specific monitoring alerts
- scheduled backup restore drill
- security incident drill
- provider-specific key rotation automation
- deployment rollback rehearsal

## Recommended Rule

Do not start a broad Phase 4 track until Phase 3 UAT produces:

- one named business owner
- one measurable blocker or benefit
- a fallback workflow
- a go/no-go decision for pilot

If no blocker is found, prioritize production operations over new features.

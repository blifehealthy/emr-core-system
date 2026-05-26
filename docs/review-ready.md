# Review Ready

## Scope

- patient read now includes encounter-level prescriptions
- clinical child entities now have read, update, and soft delete API coverage
- Phase 2B prescription safety now includes drug catalog, allergy/interaction checks, warning snapshots, frontend warning UI, and override reason capture
- production readiness now includes `npm run production:check` plus a pilot go/no-go checklist
- Phase 2B clinician/UAT docs are ready for doctor and clinic owner review
- Phase 2C pilot auth sessions now issue signed bearer tokens from database users and track last login / lockout state
- Phase 2D OIDC-compatible bearer auth maps external subjects through `users.oidc_subject`, including admin user binding support and failed-login audit events
- Phase 2E OIDC verification supports RS256 public-key tokens in addition to HS256 local test tokens
- Phase 2F OIDC integration supports provider JWKS loading/cache, RS256 `kid` key selection, and MFA claim enforcement
- Phase 2G security operations adds audit events for API auth/authorization failures and an identity incident runbook
- Phase 2 implementation scope is closed for pilot UAT/go-no-go review
- Phase 3A billing/payment foundation adds invoices, multi-line editing, encounter charge capture, payment/refund recording, invoice voiding, charge templates, receipt/tax invoice numbering, insurance claims, cashier UI, receipt print, and billing audit events
- Phase 3B billing operations adds billing summary JSON/CSV export, billing number sequences, cashier reconciliation, Cashier tab controls, and API smoke coverage
- Phase 3C pharmacy/inventory foundation adds inventory items, stock movements, prescription dispensing, Prescriptions tab controls, and API smoke coverage
- Phase 3D pharmacy lot/expiry foundation adds inventory lots, receiving, lot-aware dispensing, lot cards, and API smoke coverage
- Phase 3E pharmacy procurement foundation adds supplier master data, purchase orders, PO line receiving into lots, Prescriptions tab supplier/PO controls, and API smoke coverage
- Phase 3F purchase order approval controls add submit/approve/reject workflow, approval audit fields, approved-only receiving, and Prescriptions tab approval actions
- Phase 3G approval routing adds threshold policies, generated approval steps, multi-step approval, and approval progress in the Prescriptions tab
- Phase 3H barcode verification adds item/lot barcode fields, scan audit rows, verified receiving, verified dispensing, and Prescriptions tab barcode entry points
- Phase 3I barcode scanner UX adds a pharmacy scan panel, item/lot label printing, and bulk barcode label sheets
- request validation is stricter for user, practitioner, prescription, diagnosis, and vital sign writes
- clinic admin now includes API-backed user/practitioner filtering, audit lookup, and clearer duplicate/conflict feedback
- DB integration tests can run through local `psql` or a Docker Postgres container fallback

## Quick Checks

- Run `npm test` for TypeScript unit and migration guard tests
- Run `DATABASE_URL=... npm run db:test` when local `psql` is available
- Or run `POSTGRES_CONTAINER=... POSTGRES_DB=... npm run db:test` to use `docker exec`
- Run `npm run api:smoke` to verify real HTTP requests against a temporary Docker Postgres database, including selected frontend proxy flows
- Run `npm run frontend:workflow-smoke` after queue, report chart, or prescription print UI changes
- Run `npm run browser:workflow-smoke` when Chrome is available to click through queue and prescription print workflows
- Run `npm run browser:api-workflow-smoke` when Chrome and Docker Postgres are available to click queue, print, prescription safety warning, appointment check-in, SOAP editing, operations CSV export, clinic branding/logo upload, admin user/practitioner CRUD, and audit lookup workflows against the real API/frontend proxy
- Run `npm run storage:check` before deployment to verify file storage driver configuration
- Run `PRODUCTION_READINESS_STRICT=true npm run production:check` before pilot/production deployment
- Review `docs/phase-2b-clinician-summary-th.md` and `docs/phase-2b-uat-checklist-th.md` with the pilot clinic
- Review `docs/phase-2c-plan.md` before expanding frontend login and production identity provider work
- Review `docs/phase-2c-clinician-summary-th.md` and `docs/phase-2c-uat-checklist-th.md` with clinic operators
- Review `docs/phase-2d-plan.md` before selecting RS256/JWKS provider integration
- Review `docs/phase-2d-clinician-summary-th.md` and `docs/phase-2d-uat-checklist-th.md` with clinic owners/operators
- Review `docs/phase-2e-plan.md`, `docs/phase-2e-clinician-summary-th.md`, and `docs/phase-2e-uat-checklist-th.md` before wiring a provider JWKS URL
- Review `docs/phase-2f-plan.md`, `docs/phase-2f-clinician-summary-th.md`, and `docs/phase-2f-uat-checklist-th.md` with identity provider operators
- Review `docs/phase-2g-plan.md`, `docs/phase-2g-clinician-summary-th.md`, `docs/phase-2g-uat-checklist-th.md`, and `docs/identity-security-operations-runbook.md` before pilot closure
- Review `docs/phase-2-closure-summary-th.md`, `docs/phase-2-uat-master-checklist-th.md`, and `docs/phase-2-pilot-go-no-go-th.md` for final Phase 2 closure
- Review `docs/phase-3a-plan.md`, `docs/phase-3a-clinician-summary-th.md`, `docs/phase-3a-uat-checklist-th.md`, and `docs/phase-3a-closure-summary-th.md` with cashier/front desk users
- Review `docs/phase-3b-plan.md`, `docs/phase-3b-clinician-summary-th.md`, `docs/phase-3b-uat-checklist-th.md`, and `docs/phase-3b-closure-summary-th.md` with cashier and accounting users
- Review `docs/phase-3c-plan.md`, `docs/phase-3c-clinician-summary-th.md`, `docs/phase-3c-uat-checklist-th.md`, and `docs/phase-3c-closure-summary-th.md` with pharmacy and clinical users
- Review `docs/phase-3d-plan.md`, `docs/phase-3d-clinician-summary-th.md`, `docs/phase-3d-uat-checklist-th.md`, and `docs/phase-3d-closure-summary-th.md` with pharmacy and clinical users
- Review `docs/phase-3e-plan.md`, `docs/phase-3e-clinician-summary-th.md`, `docs/phase-3e-uat-checklist-th.md`, and `docs/phase-3e-closure-summary-th.md` with pharmacy and procurement users
- Review `docs/phase-3f-plan.md`, `docs/phase-3f-clinician-summary-th.md`, `docs/phase-3f-uat-checklist-th.md`, and `docs/phase-3f-closure-summary-th.md` with pharmacy managers and clinic owners
- Review `docs/phase-3g-plan.md`, `docs/phase-3g-clinician-summary-th.md`, `docs/phase-3g-uat-checklist-th.md`, and `docs/phase-3g-closure-summary-th.md` with pharmacy managers and clinic owners
- Review `docs/phase-3h-plan.md`, `docs/phase-3h-clinician-summary-th.md`, `docs/phase-3h-uat-checklist-th.md`, and `docs/phase-3h-closure-summary-th.md` with pharmacy staff
- Review `docs/phase-3i-plan.md`, `docs/phase-3i-clinician-summary-th.md`, `docs/phase-3i-uat-checklist-th.md`, and `docs/phase-3i-closure-summary-th.md` with pharmacy staff and operations

## Verified

- `npm test`
- `node --loader ts-node/esm --test scripts/check-production-readiness.test.ts`
- Phase 2B docs updated: clinician summary, UAT checklist, identity/access plan, monitoring/backup runbook
- Phase 2C targeted auth/session tests pass
- Phase 2C docs updated: clinician/operator summary and UAT checklist
- Phase 2D targeted OIDC token, actor mapping, and migration tests pass
- Phase 2D docs updated: operator summary and UAT checklist
- Phase 2E targeted RS256 OIDC token and readiness tests pass
- Phase 2E docs updated: operator summary and UAT checklist
- Phase 2F targeted JWKS, MFA claim, and readiness tests pass
- Phase 2F docs updated: operator summary and UAT checklist
- Phase 2G targeted security audit tests pass
- Phase 2G docs updated: operator summary, UAT checklist, and identity security operations runbook
- Phase 2 closure docs added for master UAT, go/no-go, and Phase 3 planning seeds
- Phase 3A targeted billing service, API, frontend syntax, and migration tests pass
- Phase 3B targeted billing operations service, API, frontend syntax, and migration tests pass
- Phase 3C targeted pharmacy/inventory service, API, frontend syntax, and migration tests pass
- Phase 3D targeted pharmacy lot/expiry service, API, frontend syntax, and migration tests pass
- Phase 3E targeted procurement service, API, frontend syntax, and migration tests pass
- Phase 3F targeted purchase order approval service, API, frontend syntax, and migration tests pass
- Phase 3G targeted approval routing service, API, frontend syntax, and migration tests pass
- Phase 3H targeted barcode verification service, API, frontend syntax, and migration tests pass
- Phase 3I targeted scanner UX and barcode label print frontend checks pass
- `POSTGRES_CONTAINER=poolproject-postgres POSTGRES_DB=<temporary_db> POSTGRES_USER=postgres npm run db:test`

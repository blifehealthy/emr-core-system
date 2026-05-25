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
- Phase 3A billing/payment foundation adds invoices, line items, payment recording, and billing audit events
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
- Review `docs/phase-3a-plan.md`, `docs/phase-3a-clinician-summary-th.md`, and `docs/phase-3a-uat-checklist-th.md` with cashier/front desk users

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
- Phase 3A targeted billing service, API, and migration tests pass
- `POSTGRES_CONTAINER=poolproject-postgres POSTGRES_DB=<temporary_db> POSTGRES_USER=postgres npm run db:test`

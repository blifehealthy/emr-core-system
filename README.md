# EMR Core System

This repository is the starting point for an EMR-first healthcare platform.

The goal of this phase is to establish the project structure, architecture direction, and documentation before building the full system. The EMR is treated as the clinical source of truth, while future channels such as LINE integration and telemedicine are designed as extensions around the clinical core.

## Project Structure

```text
.
|-- README.md
|-- backend/
|-- database/
|-- frontend/
|-- docs/
`-- emr_project_master_plan.md
```

## EMR-First Architecture Principles

- The EMR is the primary system of record for clinical data.
- Clinical records are separated from communication-channel data.
- Appointments, encounters, and notes are distinct domain concepts.
- Consent, attachments, and audit logging are core platform capabilities.
- External integrations must not reshape the clinical core.

## Planned Domain Areas

- Organization and access management
- Patient and clinical profile
- Scheduling and encounter workflow
- Clinical documentation
- Files, consent, and audit
- Future integration layer

## Phase 1 Clinician Review

Phase 1 is closed for clinician/product-owner review. The doctor-facing Thai
summary is available at:

- `docs/phase-1-clinician-summary-th.md`

## Phase 2A

Phase 2A clinic operations and clinician usability work is implementation-ready
for clinician UAT, including queue-to-encounter linking plus practitioner/room
queue ownership from the clinic queue board, persisted SOAP templates, branded
prescription output, daily operations reporting with lightweight visual charts,
clinic branding/logo management, admin user/practitioner CRUD, and audit lookup.
Current scope, UAT follow-ups, and the Thai clinician summary are tracked in:

- `docs/phase-2a-plan.md`
- `docs/phase-2a-clinician-summary-th.md`

## Phase 2B

Phase 2B is ready for clinician and pilot-readiness review. This scope adds a clinic drug
catalog, prescription allergy safety checks, warning snapshots on prescriptions,
a patient-record prescription form with visible warning feedback, and a required
override reason when prescribing despite active warnings. It also includes
clinic-managed drug interaction rules and a production readiness configuration
gate for pilot deployment checks. Current scope, clinician summary, and
operational runbooks are tracked in:

- `docs/phase-2b-plan.md`
- `docs/phase-2b-clinician-summary-th.md`
- `docs/phase-2b-uat-checklist-th.md`
- `docs/production-readiness-checklist.md`
- `docs/identity-and-access-production-plan.md`
- `docs/monitoring-backup-runbook.md`

## Phase 2C

Phase 2C pilot-auth hardening is ready for review. It adds session login,
database-resolved role/practitioner context, frontend login controls, login
security state, and updated smoke coverage. Current scope and review docs are
tracked in:

- `docs/phase-2c-plan.md`
- `docs/phase-2c-clinician-summary-th.md`
- `docs/phase-2c-uat-checklist-th.md`

## Phase 2D

Phase 2D production identity work is ready for operator review. It adds
OIDC-style bearer token verification, `users.oidc_subject` mapping, and
readiness checks so the pilot auth flow can evolve toward an external identity
provider. Current scope is tracked in:

- `docs/phase-2d-plan.md`
- `docs/phase-2d-clinician-summary-th.md`
- `docs/phase-2d-uat-checklist-th.md`

## Phase 2E

Phase 2E provider-grade identity signing is ready for review. It adds RS256
public-key verification for OIDC bearer tokens while keeping HS256 available
for deterministic local tests and smoke tests. Current scope and review docs
are tracked in:

- `docs/phase-2e-plan.md`
- `docs/phase-2e-clinician-summary-th.md`
- `docs/phase-2e-uat-checklist-th.md`

## Phase 2F

Phase 2F provider identity integration is ready for review. It adds OIDC JWKS
loading/cache, RS256 key selection by JWT `kid`, and optional MFA claim
enforcement for provider tokens. Current scope and review docs are tracked in:

- `docs/phase-2f-plan.md`
- `docs/phase-2f-clinician-summary-th.md`
- `docs/phase-2f-uat-checklist-th.md`

## Phase 2G

Phase 2G production identity operations is ready for review. It adds security
audit logging for API auth/authorization failures and an identity operations
runbook for JWKS, MFA, and incident response. Current scope and review docs are
tracked in:

- `docs/phase-2g-plan.md`
- `docs/phase-2g-clinician-summary-th.md`
- `docs/phase-2g-uat-checklist-th.md`
- `docs/identity-security-operations-runbook.md`

## Phase 2 Closure

Phase 2 implementation scope is closed for pilot UAT/go-no-go review. The
combined closure docs are tracked in:

- `docs/phase-2-closure-summary-th.md`
- `docs/phase-2-uat-master-checklist-th.md`
- `docs/phase-2-pilot-go-no-go-th.md`
- `docs/phase-3-planning-seeds.md`

## Phase 3A

Phase 3A billing/payment foundation is now usable as a cashier workflow. It
adds invoices, multi-line invoice editing, auto charge capture from encounters
and prescriptions, payment/refund recording, invoice voiding, charge templates,
receipt/tax invoice numbering, insurance claim lifecycle basics, receipt
print/export, billing permissions, and audit coverage.
Current scope and review docs are tracked in:

- `docs/phase-3a-plan.md`
- `docs/phase-3a-clinician-summary-th.md`
- `docs/phase-3a-uat-checklist-th.md`
- `docs/phase-3a-closure-summary-th.md`

## Phase 3B

Phase 3B closes the first billing operations layer. It adds billing summary
JSON/CSV reporting, clinic-managed document number sequences, and cashier cash
reconciliation for opening cash, expected cash, counted cash, and variance.
Current scope and review docs are tracked in:

- `docs/phase-3b-plan.md`
- `docs/phase-3b-clinician-summary-th.md`
- `docs/phase-3b-uat-checklist-th.md`
- `docs/phase-3b-closure-summary-th.md`

## Phase 3C

Phase 3C closes the first pharmacy/inventory foundation. It adds inventory
items linked to drug catalog, quantity and reorder tracking, stock movement
audit, and prescription dispense workflow that reduces stock. Current scope and
review docs are tracked in:

- `docs/phase-3c-plan.md`
- `docs/phase-3c-clinician-summary-th.md`
- `docs/phase-3c-uat-checklist-th.md`
- `docs/phase-3c-closure-summary-th.md`

## Phase 3D

Phase 3D closes the first lot/expiry and pharmacy receiving foundation. It adds
inventory lots, expiry visibility, receiving into lots, lot-aware stock
movements, and optional lot selection during prescription dispense. Current
scope and review docs are tracked in:

- `docs/phase-3d-plan.md`
- `docs/phase-3d-clinician-summary-th.md`
- `docs/phase-3d-uat-checklist-th.md`
- `docs/phase-3d-closure-summary-th.md`

## Phase 3 Closure

Phase 3 implementation scope is closed through Phase 3X. The phase now covers
billing/payment, cashier reconciliation, pharmacy inventory, lot/expiry,
procurement, approval routing, barcode/printer foundations, location/bin stock,
transfer workflow, FEFO/expiry guard, pharmacy override reports, role
separation, controlled substance register, controlled dispense witness and
re-authentication, clinic-level permission overrides, controlled reconciliation,
variance approval, and approver separation.

Closure and review docs are tracked in:

- `docs/phase-3-closure-summary-th.md`
- `docs/phase-3-uat-master-checklist-th.md`
- `docs/phase-3-pilot-go-no-go-th.md`
- `docs/phase-4-planning-seeds.md`

## Phase 4A

Phase 4A closes the first production readiness and ops drill package. It adds
`npm run ops:check`, an evidence-based operations gate for readiness checks,
storage checks, smoke checks, backup/restore drill, rollback drill, incident
tabletop, and named operational owners.

Current scope and review docs are tracked in:

- `docs/phase-4a-plan.md`
- `docs/phase-4a-ops-drill-runbook.md`
- `docs/phase-4a-uat-checklist-th.md`
- `docs/phase-4a-closure-summary-th.md`

## Phase 4B

Phase 4B adds the printer bridge queue foundation for barcode label print jobs.
It lets an external utility bridge or network-printer adapter list queued jobs
and acknowledge printing, delivered, failed, or cancelled outcomes while keeping
browser/export fallback available.

Current scope and review docs are tracked in:

- `docs/phase-4b-plan.md`
- `docs/phase-4b-printer-bridge-runbook.md`
- `docs/phase-4b-uat-checklist-th.md`
- `docs/phase-4b-closure-summary-th.md`

## Phase 4C

Phase 4C adds GS1 barcode parsing for pharmacy scan workflows. Scanned GS1
barcodes can expose GTIN, expiry, lot, and serial metadata, and barcode
verification can match stored item GTIN or lot values without removing the
manual barcode fallback.

Current scope and review docs are tracked in:

- `docs/phase-4c-plan.md`
- `docs/phase-4c-gs1-barcode-runbook.md`
- `docs/phase-4c-uat-checklist-th.md`
- `docs/phase-4c-closure-summary-th.md`

## Phase 4D

Phase 4D hardens the pharmacy scanner panel for keyboard-wedge scanners. It
keeps focus on the scan field, can clear scans after successful submission,
trims input before calling the API, and shows GS1 scan details returned from
Phase 4C.

Current scope and review docs are tracked in:

- `docs/phase-4d-plan.md`
- `docs/phase-4d-scanner-ux-runbook.md`
- `docs/phase-4d-uat-checklist-th.md`
- `docs/phase-4d-closure-summary-th.md`

## Phase 4E

Phase 4E adds structured barcode label template management. Clinics can create
item, lot, bin, or generic templates, choose visible fields and header/footer
text, then select a template when exporting barcode labels.

Current scope and review docs are tracked in:

- `docs/phase-4e-plan.md`
- `docs/phase-4e-label-template-runbook.md`
- `docs/phase-4e-uat-checklist-th.md`
- `docs/phase-4e-closure-summary-th.md`

## Phase 4F

Phase 4F adds degraded-mode barcode print recovery. Failed bridge/network jobs
can be marked for browser export or manual print fallback, then retried when
the printer path is healthy again.

Current scope and review docs are tracked in:

- `docs/phase-4f-plan.md`
- `docs/phase-4f-print-recovery-runbook.md`
- `docs/phase-4f-uat-checklist-th.md`
- `docs/phase-4f-closure-summary-th.md`

## Phase 4G

Phase 4G adds printer bridge observability and reporting. Operators can review
queue health, failed jobs, fallback/retry activity, and printer-profile hot
spots from JSON/CSV reports and the operations dashboard.

Current scope and review docs are tracked in:

- `docs/phase-4g-plan.md`
- `docs/phase-4g-printer-observability-runbook.md`
- `docs/phase-4g-uat-checklist-th.md`
- `docs/phase-4g-closure-summary-th.md`

## Current Scope

Included in this initialization phase:

- repository structure
- architecture documentation
- backend and database placeholders

Not included yet:

- application code
- APIs
- schema migrations
- infrastructure setup
- authentication and authorization implementation

## Documentation

- [Project Overview](/Users/macbook/emr-core-system/docs/project-overview.md)
- [Architecture](/Users/macbook/emr-core-system/docs/architecture.md)
- [Backend Notes](/Users/macbook/emr-core-system/backend/README.md)
- [Database Notes](/Users/macbook/emr-core-system/database/README.md)
- [Local DB Test Setup](/Users/macbook/emr-core-system/docs/local-db-testing.md)

## API

- `GET /health`
- `POST /api/auth/sessions`
- `POST /api/patients`
- `GET /api/patients/detail?clinicId=...&medicalRecordNumber=...`
- `POST /api/encounters`
- `GET /api/clinical-notes/:id/soap`
- `PATCH /api/clinical-notes/:id/finalize`
- `PATCH /api/clinical-notes/:id/sign`
- `PATCH /api/clinical-notes/:id/soap`
- `DELETE /api/clinical-notes/:id/soap`
- `GET /api/diagnoses/:id`
- `PATCH /api/diagnoses/:id`
- `DELETE /api/diagnoses/:id`
- `GET /api/vital-signs/:id`
- `PATCH /api/vital-signs/:id`
- `DELETE /api/vital-signs/:id`
- `GET /api/audit-logs?entityType=...&entityId=...&limit=...`
- `GET /api/patients/:id/timeline`
- `GET /api/users?clinicId=...&search=...&active=...&limit=...&offset=...`
- `POST /api/users`
- `PATCH /api/users/:id`
- `GET /api/practitioners?clinicId=...&search=...&active=...&limit=...&offset=...`
- `POST /api/practitioners`
- `PATCH /api/practitioners/:id`
- `GET /api/drug-catalog?clinicId=...&search=...&active=...&limit=...&offset=...`
- `POST /api/drug-catalog`
- `PATCH /api/drug-catalog/:id`
- `GET /api/drug-interaction-rules?clinicId=...&active=...&limit=...&offset=...`
- `POST /api/drug-interaction-rules`
- `PATCH /api/drug-interaction-rules/:id`
- `POST /api/prescription-safety-checks`
- `GET /api/queue?clinicId=...&status=...&practitionerId=...&roomName=...&limit=...`
- `POST /api/visits`
- `PATCH /api/visits/:id`
- `GET /api/clinical-note-templates?clinicId=...&active=true`
- `POST /api/clinical-note-templates`
- `PATCH /api/clinical-note-templates/:id`
- `GET /api/clinics/:id/settings`
- `PATCH /api/clinics/:id/settings`
- `GET /api/reports/daily-operations?clinicId=...&startDate=YYYY-MM-DD&endDate=YYYY-MM-DD`
- `GET /api/reports/daily-operations.csv?clinicId=...&startDate=YYYY-MM-DD&endDate=YYYY-MM-DD`
- `GET /api/encounters/:id/diagnoses?clinicalNoteId=...&status=...&limit=...&offset=...`
- `GET /api/encounters/:id/vital-signs?clinicalNoteId=...&limit=...&offset=...`
- `GET /api/encounters/:id/prescriptions?clinicalNoteId=...&status=...&limit=...&offset=...`
- `GET /api/prescriptions/:id`
- `POST /api/prescriptions`
- `PATCH /api/prescriptions/:id`
- `DELETE /api/prescriptions/:id`
- `GET /api/file-assets?clinicId=...&search=...&limit=...&offset=...`
- `GET /api/file-assets/:id/download`
- `POST /api/file-assets/upload`

Run locally with:

```bash
DATABASE_URL=postgres://localhost:5432/emr_core npm run start:api
```

File asset uploads use the local driver by default and are stored under
`/tmp/emr-core-file-assets`. Set `FILE_STORAGE_DIR=/path/to/assets` when
starting the API to use a different local storage root. File storage is controlled by:

- `FILE_STORAGE_DRIVER=local`
- `FILE_STORAGE_MAX_BYTES=5242880`
- `FILE_STORAGE_ALLOWED_MIME_TYPES=image/png,image/jpeg,image/webp,application/pdf`

For S3/MinIO-compatible storage, set:

- `FILE_STORAGE_DRIVER=s3`
- `FILE_STORAGE_S3_ENDPOINT=http://127.0.0.1:9000`
- `FILE_STORAGE_S3_BUCKET=emr-assets`
- `FILE_STORAGE_S3_REGION=us-east-1`
- `FILE_STORAGE_S3_ACCESS_KEY_ID=...`
- `FILE_STORAGE_S3_SECRET_ACCESS_KEY=...`
- `FILE_STORAGE_S3_FORCE_PATH_STYLE=true`

Validate storage configuration before deploying:

```bash
npm run storage:check
```

Operational guidance lives in `docs/object-storage-runbook.md`.

Run the production readiness gate before a pilot or production deployment:

```bash
PRODUCTION_READINESS_STRICT=true npm run production:check
```

After command checks and manual drills are recorded, run the Phase 4A ops gate:

```bash
OPS_DRILL_STRICT=true npm run ops:check
```

The checklist for deployment operators lives in
`docs/production-readiness-checklist.md`.

Run the frontend patient registration and lookup MVP:

```bash
npm run start:frontend
```

The frontend dev server listens on `http://127.0.0.1:5173` and proxies
`/api/*` plus `/health` to `API_BASE_URL`, which defaults to
`http://127.0.0.1:3000`.

Run an end-to-end HTTP smoke test against a temporary Docker Postgres database.
The smoke test starts the API and frontend dev proxy, then exercises API flows
and selected `/api/*` requests through the frontend proxy:

```bash
npm run api:smoke
```

Run the deterministic frontend workflow smoke check after changing queue,
reporting, or prescription print UI code:

```bash
npm run frontend:workflow-smoke
```

Run the browser-driven workflow smoke when Chrome is available. This opens the
real frontend in headless Chrome, clicks through queue claim/start-checkup, and
verifies prescription print output with a deterministic mock API:

```bash
npm run browser:workflow-smoke
```

Run the API-backed browser workflow smoke to click through queue, prescription
print, appointment check-in, SOAP editing, operations CSV export, clinic
branding/logo upload, admin user/practitioner CRUD, and audit lookup against
the real API, frontend proxy, and a temporary Docker Postgres database:

```bash
npm run browser:api-workflow-smoke
```

Protect API routes with a bearer token if needed:

```bash
API_TOKEN=dev-secret DATABASE_URL=postgres://localhost:5432/emr_core npm run start:api
```

For a pilot user session flow, configure a login code and session signing
secret, then call `POST /api/auth/sessions` with `clinicId`, `username`, and
`loginCode`. The returned bearer token carries only the user id; the API resolves
role and practitioner context from the database on each request.

```bash
AUTH_LOGIN_CODE=change-me-32-plus-characters \
AUTH_SESSION_SECRET=change-me-32-plus-characters \
DATABASE_URL=postgres://localhost:5432/emr_core \
npm run start:api
```

If you have user records in the database already, static-token technical calls
can still resolve role and practitioner context from `x-user-id`. Headers
`x-user-role` and `x-practitioner-id` remain explicit fallbacks for local and
test harnesses.

OIDC-compatible bearer verification can be enabled for production identity
provider integration pilots:

```bash
AUTH_OIDC_ISSUER=https://id.example.test \
AUTH_OIDC_AUDIENCE=emr-core \
AUTH_OIDC_HS256_SECRET=change-me-32-plus-characters \
DATABASE_URL=postgres://localhost:5432/emr_core \
npm run start:api
```

OIDC tokens are mapped to active users through `users.oidc_subject`.

Example requests:

```bash
curl http://127.0.0.1:3000/health
```

```bash
curl \
  -H "Authorization: Bearer dev-secret" \
  -H "x-user-id: 00000000-0000-0000-0000-000000000201" \
  "http://127.0.0.1:3000/api/patients/detail?clinicId=00000000-0000-0000-0000-000000000101&medicalRecordNumber=MRN-001"
```

```bash
curl -X POST http://127.0.0.1:3000/api/encounters \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer dev-secret" \
  -H "x-user-role: doctor" \
  -d '{
    "patientId": "00000000-0000-0000-0000-000000001001",
    "encounterNumber": "ENC-1001",
    "status": "draft",
    "encounterClass": "outpatient",
    "chiefComplaint": "ไข้ 2 วัน",
    "subjective": "มีไข้ ปวดเมื่อย และไอเล็กน้อย",
    "objective": "T 38.2 C, HR 92 bpm",
    "assessment": "ไข้จากการติดเชื้อทางเดินหายใจส่วนต้น",
    "plan": "ให้ยาตามอาการ นัดติดตามอาการ",
    "diagnoses": [
      {
        "diagnosisName": "Upper respiratory tract infection",
        "diagnosisCode": "J06.9",
        "codingSystem": "ICD-10",
        "diagnosisType": "working",
        "status": "active",
        "sequenceNumber": 1
      }
    ],
    "vitalSigns": [
      {
        "bodyTemperatureC": 38.2,
        "heartRateBpm": 92,
        "respiratoryRateBpm": 18,
        "systolicBpMmhg": 118,
        "diastolicBpMmhg": 76,
        "oxygenSaturationPct": 98,
        "painScore": 2
      }
    ]
  }'
```

```bash
curl -X PATCH http://127.0.0.1:3000/api/clinical-notes/clinical-note-1/soap \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer dev-secret" \
  -H "x-user-role: doctor" \
  -d '{
    "assessment": "อาการดีขึ้น ไม่มีภาวะหอบ",
    "plan": "ให้ยาต่อและติดตามอาการ"
  }'
```

```bash
curl -X PATCH http://127.0.0.1:3000/api/diagnoses/diagnosis-1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer dev-secret" \
  -H "x-user-role: doctor" \
  -d '{
    "diagnosisType": "final",
    "status": "active",
    "diagnosisName": "Influenza"
  }'
```

```bash
curl -X PATCH http://127.0.0.1:3000/api/vital-signs/vital-sign-1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer dev-secret" \
  -H "x-user-role: nurse" \
  -d '{
    "heartRateBpm": 88,
    "bodyTemperatureC": 37.4,
    "painScore": 1
  }'
```

```bash
curl -X PATCH http://127.0.0.1:3000/api/clinical-notes/clinical-note-1/finalize \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer dev-secret" \
  -H "x-user-role: doctor" \
  -H "x-user-id: user-1" \
  -d '{}'
```

```bash
curl -X PATCH http://127.0.0.1:3000/api/clinical-notes/clinical-note-1/sign \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer dev-secret" \
  -H "x-user-role: doctor" \
  -H "x-user-id: user-1" \
  -H "x-practitioner-id: practitioner-1" \
  -d '{}'
```

```bash
curl \
  -H "Authorization: Bearer dev-secret" \
  -H "x-user-role: doctor" \
  "http://127.0.0.1:3000/api/audit-logs?entityType=clinical_note&entityId=clinical-note-1"
```

```bash
curl \
  -H "Authorization: Bearer dev-secret" \
  -H "x-user-id: 00000000-0000-0000-0000-000000000201" \
  "http://127.0.0.1:3000/api/patients/00000000-0000-0000-0000-000000001001/timeline"
```

## Next Steps

1. Run Phase 3 master UAT with clinic, billing, pharmacy, owner, and IT users.
2. Record Phase 3 pilot go/no-go.
3. Fix only UAT blockers needed for pilot safety.
4. Move new feature requests to Phase 4 planning.

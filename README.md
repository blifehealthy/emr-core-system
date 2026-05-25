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

Phase 2A has started clinic operations and clinician usability work, including
queue-to-encounter linking plus practitioner/room queue ownership from the
clinic queue board, persisted SOAP templates, branded prescription output, and
daily operations reporting.
Current scope and follow-ups are tracked in:

- `docs/phase-2a-plan.md`

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

Protect API routes with a bearer token if needed:

```bash
API_TOKEN=dev-secret DATABASE_URL=postgres://localhost:5432/emr_core npm run start:api
```

If you have user records in the database already, you can let the API resolve role and practitioner context from `x-user-id`.
Headers `x-user-role` and `x-practitioner-id` still work as explicit fallbacks.

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

1. Confirm the bounded contexts and domain vocabulary.
2. Define the backend service shape and module boundaries.
3. Design the initial relational schema for EMR core entities.
4. Add migration, API, and security foundations in the next implementation phase.

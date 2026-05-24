# Handoff Next

## Current State

- Current branch: `main`
- Latest completed checkpoint before this worktree: `e568e28` (`Add patient profile update controls`)
- This stretch extends the patient detail frontend with an encounter/SOAP entry point:
  - static frontend under `frontend/`
  - `npm run start:frontend`
  - patient registration form wired to `POST /api/patients`
  - patient lookup/detail form wired to `GET /api/patients/detail`
  - patient detail subviews for flags, allergies, conditions, medications, encounters, diagnoses, vitals, prescriptions, and notes
  - create forms for flags, allergies, conditions, and medications
  - edit and soft-delete controls for flags, allergies, conditions, and medications
  - create encounter/SOAP form from the patient detail panel
  - optional inline diagnosis and vital-sign capture while starting a visit
  - frontend dev proxy for `/api/*` and `/health`
- Previous verified patient registration API:
  - `POST /api/patients`
  - service: `backend/services/createPatient.ts`
  - validation + DTO + route + audit log
  - API and service tests
- Latest verification:
  - `npm test`
  - current result: `72/72` passing
  - command used on this machine:
    `PATH="$PWD/.tools/node-v22.22.3-linux-x64/bin:$PATH" npm test`
  - `npm run db:test`
  - current result: passing via Docker Postgres fallback
  - command used on this machine:
    `PATH="$PWD/.tools/node-v22.22.3-linux-x64/bin:$PATH" POSTGRES_CONTAINER=emr-core-postgres POSTGRES_DB=emr_core_registration POSTGRES_USER=postgres npm run db:test`
  - `npm run api:smoke`
  - current result: passing
  - command used on this machine:
    `PATH="$PWD/.tools/node-v22.22.3-linux-x64/bin:$PATH" POSTGRES_CONTAINER=emr-core-postgres POSTGRES_USER=postgres POSTGRES_PASSWORD=postgres npm run api:smoke`
  - targeted patient registration tests
  - current result: passing
  - command used on this machine:
    `PATH="$PWD/.tools/node-v22.22.3-linux-x64/bin:$PATH" node --loader ts-node/esm --test backend/services/createPatient.test.ts backend/api/emrApi.test.ts`
  - frontend static server check
  - current result: passing
  - URL checked:
    `http://127.0.0.1:5173/`
  - frontend proxy registration check
  - current result: `201 Created`
  - URL checked:
    `http://127.0.0.1:5173/api/patients`
- frontend proxy patient detail check
  - current result: `200 OK`
  - URL checked:
    `http://127.0.0.1:5173/api/patients/detail?clinicId=...&medicalRecordNumber=MRN-SMOKE-001`
  - frontend asset syntax check
  - current result: passing
  - command used on this machine:
    `PATH="$PWD/.tools/node-v22.22.3-linux-x64/bin:$PATH" node --check frontend/app.js`
  - frontend proxy profile create checks
  - current result: `201 Created`
  - URLs checked:
    - `POST http://127.0.0.1:5173/api/patient-flags`
    - `POST http://127.0.0.1:5173/api/patient-allergies`
    - `POST http://127.0.0.1:5173/api/patient-conditions`
    - `POST http://127.0.0.1:5173/api/patient-medications`
  - frontend proxy profile update/delete checks
  - current result: `200 OK`
  - URLs checked:
    - `PATCH/DELETE http://127.0.0.1:5173/api/patient-flags/:id`
    - `PATCH/DELETE http://127.0.0.1:5173/api/patient-allergies/:id`
    - `PATCH/DELETE http://127.0.0.1:5173/api/patient-conditions/:id`
    - `PATCH/DELETE http://127.0.0.1:5173/api/patient-medications/:id`
  - frontend proxy encounter/SOAP create check
  - current result: `201 Created`
  - URL checked:
    `POST http://127.0.0.1:5173/api/encounters`

## Local Tooling

- Node.js was installed locally under `.tools/node-v22.22.3-linux-x64`.
- `.tools/` is ignored by Git.
- Dependencies were installed with:
  `PATH="$PWD/.tools/node-v22.22.3-linux-x64/bin:$PATH" npm_config_cache=/tmp/npm-cache npm ci --no-audit --no-fund`
- Use this prefix for local Node/npm commands:
  `PATH="$PWD/.tools/node-v22.22.3-linux-x64/bin:$PATH"`
- Docker is available when run outside the sandbox.
- PostgreSQL test container:
  - name: `emr-core-postgres`
  - image: `postgres:16`
  - exposed port: `5432`
  - password: `postgres`

## What Was Completed In This Stretch

Core EMR Phase 1 entity/API work is now substantially in place:

- encounter foundation
- SOAP note read/update/delete flow
- diagnosis read/write/update/delete flow
- vital sign read/write/update/delete flow
- prescription read/write/update/delete flow
- users / practitioners API + DTO + validation hardening
- audit log foundation
- appointments foundation
- consent records foundation
- file assets + attachment links foundation
- patient allergies API flow
- patient conditions API flow
- patient medications API flow
- patient flags API flow
- active patient flags included in `GET /api/patients/detail`
- patient registration API added with `POST /api/patients`
- frontend patient registration, lookup, clinical profile subviews, profile create/update/delete controls, and encounter/SOAP entry started
- Phase 1 governance/API documentation:
  - role/permission matrix
  - workflow state definition
  - API grouping v1

Recent commits on `main`:

- `72819d7` Add patient registration API
- `21b8cb0` Include patient flags in patient detail
- `53eb843` Add patient flags and Phase 1 docs
- `98a95c9` Add appointment foundation APIs and migration
- `a8a16f0` Expand patient profile and governance APIs
- `2773148` Add patient medication APIs and migration

## Phase 1 Assessment

Phase 1 is no longer blocked on the major clinical entities.

### Largely Done

- patient clinical profile:
  - allergies
  - conditions
  - medications
  - flags
  - consent records
- scheduling/documentation core:
  - appointments
  - encounters
  - SOAP
  - diagnoses
  - vital signs
  - prescriptions
- files/governance foundation:
  - attachments
  - audit logging
- access foundation:
  - users
  - practitioners
  - role-gated API checks

### Remaining Follow-ups For A Strong Phase 1 Close

These are the most visible follow-ups versus `project_plan.md` Phase 1 deliverables:

Note: `project_plan.md` is not currently tracked in this cloned repository. The
handoff references the project plan that was present in the transfer snapshot.

1. Review the new Phase 1 documentation deliverables against product intent.
2. Decide whether `patient_flags` needs more predefined `flag_type` policy or should remain flexible text for Phase 1.
3. Decide whether permission/state transition rules should move from documentation into code-level guards before frontend work.
4. Review whether registration should collect additional demographics before frontend work.

## Recommended Next Task

If coming back fresh after this pass:

1. add SOAP read/update workflow from encounter notes
2. add appointment/check-in workflow to connect registration to encounters

The deliverables added in this worktree are:

- `docs/role-permission-matrix.md`
- `docs/workflow-state-definition.md`
- `docs/api-grouping-v1.md`
- `database/migrations/0012_add_patient_flags.*`
- patient flag services, DTOs, validation, routes, and API smoke coverage
- active patient flag aggregation in patient detail
- patient registration API with unit, DB, and API smoke coverage
- frontend patient registration, patient lookup, patient snapshot, clinical profile subviews, profile create/update/delete controls, encounter/SOAP entry, and dev proxy

This was the highest-leverage next move because:

- the backend foundations are already implemented
- patient registration is the front door for clinical workflows
- frontend MVP work needs a stable way to create patients before encounter/SOAP flows
- the first usable frontend screen now exercises registration, patient-detail, profile-list, profile-create, profile-update, profile-delete, and encounter/SOAP create APIs

## Concrete Guidance For The Next Session

Start by reading:

- `project_plan.md` if it is restored from the transfer snapshot or added to the repo
- `backend/api/auth.ts`
- `backend/api/emrApi.ts`
- `docs/project-overview.md`
- `docs/architecture.md`
- `docs/role-permission-matrix.md`
- `docs/workflow-state-definition.md`
- `docs/api-grouping-v1.md`

Then produce:

1. SOAP read/update workflow from encounter notes
2. appointment/check-in workflow to connect registration to encounters

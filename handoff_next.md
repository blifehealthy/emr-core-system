# Handoff Next

## Current State

- Current branch: `main`
- Latest completed checkpoint in this handoff: current `HEAD` (`Add admin filters and workflow smoke coverage`)
- Previous checkpoint before this worktree: `1fee16c` (`Add clinic admin and encounter edit frontend`)
- This stretch extends the patient detail frontend and workflow guards:
  - static frontend under `frontend/`
  - `npm run start:frontend`
  - patient registration form wired to `POST /api/patients`
  - patient lookup/detail form wired to `GET /api/patients/detail`
  - patient detail subviews for flags, allergies, conditions, medications, appointments, encounters, diagnoses, vitals, prescriptions, and notes
  - create forms for flags, allergies, conditions, and medications
  - edit and soft-delete controls for flags, allergies, conditions, and medications
  - appointment list loaded with `GET /api/appointments?clinicId=...&patientId=...`
  - appointment create form wired to `POST /api/appointments`
  - appointment edit/reschedule form wired to `PATCH /api/appointments/:id`
  - practitioner picker loaded with `GET /api/practitioners?clinicId=...`
  - clinic setup tab for user/practitioner administration:
    - list users with `GET /api/users?clinicId=...`
    - create/update users with `POST /api/users` and `PATCH /api/users/:id`
    - search and active/inactive filters for users
    - deactivate/reactivate users with `PATCH /api/users/:id`
    - list practitioners with `GET /api/practitioners?clinicId=...`
    - create/update practitioners with `POST /api/practitioners` and `PATCH /api/practitioners/:id`
    - search and active/inactive filters for practitioners
    - deactivate/reactivate practitioners with `PATCH /api/practitioners/:id`
  - appointment status controls wired to `PATCH /api/appointments/:id`
  - check-in represented by the `checked_in` appointment status
  - checked-in appointments can open a visit/SOAP form and start an encounter with `appointmentId`
  - create encounter/SOAP form from the patient detail panel
  - optional inline diagnosis and vital-sign capture while starting a visit
  - open SOAP notes from the Notes subview
  - edit and save SOAP subjective/objective/assessment/plan fields
  - finalize/sign clinical notes from the Notes subview with `PATCH /api/clinical-notes/:id/finalize` and `PATCH /api/clinical-notes/:id/sign`
  - encounter read/update APIs added:
    - `GET /api/encounters/:id`
    - `PATCH /api/encounters/:id`
  - encounter status controls in the Encounters subview:
    - `draft -> in_progress/cancelled`
    - `in_progress -> completed/cancelled`
    - `completed -> signed`
  - encounter edit form for class, chief complaint, triage summary, attending practitioner, started time, and ended time
  - appointment status transitions are guarded server-side:
    - `pending -> confirmed/cancelled`
    - `confirmed -> checked_in/cancelled/no_show`
    - `checked_in -> completed`
    - terminal states reject further status transitions with `409`
  - encounter status transitions are guarded server-side with `409` on unsupported jumps
  - frontend dev proxy for `/api/*` and `/health`
- Previous verified patient registration API:
  - `POST /api/patients`
  - service: `backend/services/createPatient.ts`
  - validation + DTO + route + audit log
  - API and service tests
- Latest verification:
  - `npm test`
  - current result: `73/73` passing
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
  - frontend proxy SOAP read/update checks
  - current result: `200 OK`
  - URLs checked:
    - `GET http://127.0.0.1:5173/api/clinical-notes/:id/soap`
    - `PATCH http://127.0.0.1:5173/api/clinical-notes/:id/soap`
  - frontend appointment/check-in asset verification
  - current result: passing
  - command used on this machine:
    `PATH="$PWD/.tools/node-v22.22.3-linux-x64/bin:$PATH" node --check frontend/app.js`
  - frontend static server check for this stretch
  - current result: `200 OK`
  - URL checked:
    `http://127.0.0.1:5174/`
  - targeted appointment workflow guard tests
  - current result: passing
  - command used on this machine:
    `PATH="$PWD/.tools/node-v22.22.3-linux-x64/bin:$PATH" node --loader ts-node/esm --test backend/api/emrApi.test.ts backend/services/updateAppointment.test.ts`
  - targeted encounter workflow tests
  - current result: passing
  - command used on this machine:
    `PATH="$PWD/.tools/node-v22.22.3-linux-x64/bin:$PATH" node --loader ts-node/esm --test backend/api/emrApi.test.ts backend/services/updateEncounter.test.ts backend/services/updateAppointment.test.ts`
  - TypeScript compile check
  - current result: passing
  - command used on this machine:
    `PATH="$PWD/.tools/node-v22.22.3-linux-x64/bin:$PATH" npx tsc --noEmit`
  - API smoke workflow coverage
  - current result: passing
  - now covers clinic setup user/practitioner create-update-list, appointment reschedule, and encounter edit
  - command used on this machine:
    `PATH="$PWD/.tools/node-v22.22.3-linux-x64/bin:$PATH" POSTGRES_CONTAINER=emr-core-postgres POSTGRES_USER=postgres POSTGRES_PASSWORD=postgres npm run api:smoke`
  - targeted user update validation tests
  - current result: passing
  - command used on this machine:
    `PATH="$PWD/.tools/node-v22.22.3-linux-x64/bin:$PATH" node --loader ts-node/esm --test backend/api/emrApi.test.ts backend/services/updateUser.test.ts`

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
- frontend patient registration, lookup, clinic user/practitioner administration, clinical profile subviews, profile create/update/delete controls, appointment/check-in workflow, appointment edit/reschedule, practitioner picker, encounter/SOAP entry, encounter status workflow, encounter metadata edit, SOAP read/update, and note finalize/sign
- frontend clinic admin search, active/inactive filters, and deactivate/reactivate controls for users and practitioners
- API smoke coverage for clinic setup user/practitioner flows, appointment reschedule, and encounter edit
- user update validation now preserves omitted fields such as `role` during partial PATCH requests
- code-level appointment state transition guard in the appointment update API
- code-level encounter state transition guard in the encounter update API
- Phase 1 governance/API documentation:
  - role/permission matrix
  - workflow state definition
  - API grouping v1

Recent commits on `main`:

- current `HEAD` Add admin filters and workflow smoke coverage
- `1fee16c` Add clinic admin and encounter edit frontend
- `5b289f8` Add encounter workflow and appointment rescheduling
- `01d9a28` Add note signing and appointment transition guards
- `78f84f9` Add appointment check-in frontend workflow
- `f5a3b3f` Add SOAP note editing frontend
- `dab1082` Add encounter SOAP entry frontend
- `e568e28` Add patient profile update controls
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
  - frontend check-in workflow through appointment status
  - appointment transition guard in API update flow
  - encounters
  - frontend encounter status workflow
  - encounter transition guard in API update flow
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
  - frontend user/practitioner administration with search, active/inactive filters, and deactivate/reactivate controls
  - role-gated API checks

### Remaining Follow-ups For A Strong Phase 1 Close

These are the most visible follow-ups versus `project_plan.md` Phase 1 deliverables:

Note: `project_plan.md` is not currently tracked in this cloned repository. The
handoff references the project plan that was present in the transfer snapshot.

1. Review the new Phase 1 documentation deliverables against product intent.
2. Decide whether `patient_flags` needs more predefined `flag_type` policy or should remain flexible text for Phase 1.
3. Decide whether additional state transition rules beyond appointments and encounters should move from documentation into code-level guards.
4. Review whether registration should collect additional demographics before frontend work.

## Recommended Next Task

If coming back fresh after this pass:

1. add API-side pagination/filtering for user and practitioner admin lists
2. add browser-level frontend smoke coverage for clinic admin, appointment reschedule, and encounter edit flows

The deliverables added in this worktree are:

- `docs/role-permission-matrix.md`
- `docs/workflow-state-definition.md`
- `docs/api-grouping-v1.md`
- `database/migrations/0012_add_patient_flags.*`
- patient flag services, DTOs, validation, routes, and API smoke coverage
- active patient flag aggregation in patient detail
- patient registration API with unit, DB, and API smoke coverage
- frontend patient registration, patient lookup, patient snapshot, clinic user/practitioner administration with search/status filters/deactivate controls, clinical profile subviews, profile create/update/delete controls, appointment/check-in workflow, appointment edit/reschedule, practitioner picker, encounter/SOAP entry, encounter status workflow, encounter metadata edit, SOAP read/update, note finalize/sign, and dev proxy
- appointment state transition guard in `backend/api/controllers.ts`
- encounter read/update API, service, validation, and transition guard
- expanded API smoke coverage for clinic setup, appointment reschedule, and encounter edit

This was the highest-leverage next move because:

- the backend foundations are already implemented
- patient registration is the front door for clinical workflows
- frontend MVP work needs a stable way to create patients before encounter/SOAP flows
- the first usable frontend screen now exercises registration, patient-detail, profile-list, profile-create, profile-update, profile-delete, user create/update/list, practitioner create/update/list, appointment create/update/list, encounter/SOAP create, encounter read/update, SOAP read/update, and note finalize/sign APIs

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

1. API-side pagination/filtering for user and practitioner admin lists
2. browser-level frontend smoke coverage for clinic admin, appointment reschedule, and encounter edit flows

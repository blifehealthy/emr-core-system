# Phase 2A Plan

Phase 2A starts the move from core EMR records into day-to-day clinic operations
and clinician usability.

## Completed In This Pass

- Dedicated `clinic_visits` table for check-in and visit lifecycle.
- Queue APIs:
  - `GET /api/queue`
  - `POST /api/visits`
  - `PATCH /api/visits/:visitId`
- Frontend Queue Board tab with lifecycle actions:
  - waiting
  - in room
  - with doctor
  - completed
  - discharged
  - cancelled
- Queue cards can start an encounter/SOAP directly and write the encounter id
  back to the visit record.
- Queue cards with an encounter can open the patient record on the Encounters
  tab.
- Queue filtering supports practitioner and room, and queue cards show/claim
  practitioner ownership.
- Appointment check-in now creates a visit record before moving the appointment
  to `checked_in`.
- Patient detail now includes a compact timeline panel.
- SOAP entry uses persisted clinic-managed templates with starter fallbacks.
- Prescription cards include a clinic-branded print/export view.
- Encounter completion/sign/cancel actions can synchronize an already-loaded
  linked queue visit status.
- Queue board shows active queue, waiting, with-doctor, provider, and room
  summary metrics.
- Clinic branding settings drive prescription print headers and footers.
- Clinic branding can list/create/upload/download logo file assets and bind one
  to settings before prescription print.
- File asset storage exposes a local-driver policy for max upload size and
  allowed MIME types so frontend upload controls can validate before submit.
- File asset storage can run on local disk or an S3/MinIO-compatible driver
  using the same upload/download API surface.
- Object storage runbook and example environment settings document local/S3
  deployment, backup, restore, retention, and credential rotation.
- Daily operations reporting summarizes visits, diagnosis count, prescription
  count, provider workload, room workload, prescriber workload, and top
  diagnoses, with date-range filtering and CSV export.
- Queue board now renders lightweight operations charts for visit status, room
  workload, top diagnoses, and prescriber workload.
- `npm run frontend:workflow-smoke` checks queue controls, report chart hooks,
  and prescription print/export UI wiring.
- `npm run browser:workflow-smoke` opens headless Chrome against the real
  frontend, clicks queue load/claim/start-checkup, and verifies prescription
  print HTML through a deterministic mock API.

## Remaining Phase 2A Follow-ups

- Expand browser automation to API-backed temporary Postgres data once the smoke
  suite needs deeper backend coverage.
- Review chart labels with clinic users after real-world reporting data is
  available.

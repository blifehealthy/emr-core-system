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
- Appointment check-in now creates a visit record before moving the appointment
  to `checked_in`.
- Patient detail now includes a compact timeline panel.
- SOAP entry includes starter note templates.
- Prescription cards include a simple print/export view.

## Remaining Phase 2A Follow-ups

- Link visit records back to encounters automatically when starting an encounter
  from a queued visit.
- Add queue room/provider filters and clearer visit ownership.
- Add real browser automation for queue and print workflows.
- Replace client-side note templates with persisted clinic-managed templates.
- Expand prescription print/export into a clinic-branded document format.

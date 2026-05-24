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
- Daily operations reporting summarizes visits, diagnosis count, prescription
  count, provider workload, room workload, and top diagnoses.

## Remaining Phase 2A Follow-ups

- Add real browser automation for queue and print workflows.
- Add date-range/export support for operations reporting.
- Add upload/asset support for clinic logos.

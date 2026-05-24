# Backend Notes

This directory is reserved for the application layer of the EMR system.

## Intended Responsibilities

- expose APIs and internal services for EMR workflows
- enforce authorization and business rules
- coordinate domain modules without collapsing them into a single undifferentiated codebase
- provide integration points for future external channels

## Planned Module Areas

- organization and access
- patient profile
- scheduling and encounter
- clinical documentation
- files, consent, and audit
- integration adapters

## Current Progress

- repository and service flows exist for patient read, patient registration,
  appointment/check-in, encounter creation/update, SOAP editing/signing, profile
  lists, prescriptions, files, consent, audit, users, and practitioners
- API handlers include:
  - `GET /health`
  - `GET /api/patients/detail`
  - `POST /api/patients`
  - `GET/POST/PATCH /api/appointments`
  - `POST /api/encounters`
  - `GET/PATCH /api/encounters/:encounterId`
  - `GET/PATCH/DELETE /api/clinical-notes/:clinicalNoteId/soap`
  - `PATCH /api/clinical-notes/:clinicalNoteId/finalize`
  - `PATCH /api/clinical-notes/:clinicalNoteId/sign`
  - profile, diagnosis, vital sign, prescription, consent, file, attachment,
    audit, user, and practitioner routes documented in `docs/api-grouping-v1.md`
- a lightweight Node HTTP adapter is wired to Postgres through `DATABASE_URL`

This backend now has a real Postgres adapter and role-gated handlers. It is
still missing production-grade authentication, richer error policies, and
production runtime configuration.

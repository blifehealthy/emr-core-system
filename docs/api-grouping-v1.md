# API Grouping v1

## Scope

This document groups the current Phase 1 API surface by domain boundary. The
routes are implemented in `backend/api/emrApi.ts` and delegate to controller and
service modules under `backend/api` and `backend/services`.

All routes except `GET /health` can be protected by bearer token when
`apiToken` is configured, and all business routes require role authorization.

## System

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/health` | Read service health. |

## Patient and Clinical Profile

| Method | Route | Purpose |
| --- | --- | --- |
| `POST` | `/api/patients` | Register a new patient profile. |
| `GET` | `/api/patients/detail` | Read patient detail with active flags, encounters, and clinical children. |
| `GET` | `/api/patients/:patientId/allergies` | List patient allergies. |
| `GET` | `/api/patient-allergies/:allergyId` | Read one patient allergy. |
| `POST` | `/api/patient-allergies` | Create patient allergy. |
| `PATCH` | `/api/patient-allergies/:allergyId` | Update patient allergy. |
| `DELETE` | `/api/patient-allergies/:allergyId` | Soft delete patient allergy. |
| `GET` | `/api/patients/:patientId/conditions` | List patient conditions. |
| `GET` | `/api/patient-conditions/:conditionId` | Read one patient condition. |
| `POST` | `/api/patient-conditions` | Create patient condition. |
| `PATCH` | `/api/patient-conditions/:conditionId` | Update patient condition. |
| `DELETE` | `/api/patient-conditions/:conditionId` | Soft delete patient condition. |
| `GET` | `/api/patients/:patientId/medications` | List patient medications. |
| `GET` | `/api/patient-medications/:medicationId` | Read one patient medication. |
| `POST` | `/api/patient-medications` | Create patient medication. |
| `PATCH` | `/api/patient-medications/:medicationId` | Update patient medication. |
| `DELETE` | `/api/patient-medications/:medicationId` | Soft delete patient medication. |
| `GET` | `/api/patients/:patientId/flags` | List patient flags. |
| `GET` | `/api/patient-flags/:flagId` | Read one patient flag. |
| `POST` | `/api/patient-flags` | Create patient flag. |
| `PATCH` | `/api/patient-flags/:flagId` | Update patient flag. |
| `DELETE` | `/api/patient-flags/:flagId` | Soft delete patient flag. |

## Scheduling and Encounter

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/api/appointments` | List appointments. |
| `GET` | `/api/appointments/:appointmentId` | Read one appointment. |
| `POST` | `/api/appointments` | Create appointment. |
| `PATCH` | `/api/appointments/:appointmentId` | Update appointment. |
| `POST` | `/api/encounters` | Create encounter with SOAP note and optional clinical children. |

## Clinical Documentation

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/api/clinical-notes/:clinicalNoteId/soap` | Read SOAP note by clinical note id. |
| `PATCH` | `/api/clinical-notes/:clinicalNoteId/soap` | Update SOAP note. |
| `DELETE` | `/api/clinical-notes/:clinicalNoteId/soap` | Soft delete SOAP note. |
| `PATCH` | `/api/clinical-notes/:clinicalNoteId/finalize` | Finalize clinical note. |
| `PATCH` | `/api/clinical-notes/:clinicalNoteId/sign` | Sign clinical note. |
| `GET` | `/api/encounters/:encounterId/diagnoses` | List diagnoses for an encounter. |
| `GET` | `/api/diagnoses/:diagnosisId` | Read one diagnosis. |
| `POST` | `/api/diagnoses` | Create diagnosis. |
| `PATCH` | `/api/diagnoses/:diagnosisId` | Update diagnosis. |
| `DELETE` | `/api/diagnoses/:diagnosisId` | Soft delete diagnosis. |
| `GET` | `/api/encounters/:encounterId/vital-signs` | List vital signs for an encounter. |
| `GET` | `/api/vital-signs/:vitalSignId` | Read one vital sign. |
| `POST` | `/api/vital-signs` | Create vital sign. |
| `PATCH` | `/api/vital-signs/:vitalSignId` | Update vital sign. |
| `DELETE` | `/api/vital-signs/:vitalSignId` | Soft delete vital sign. |
| `GET` | `/api/encounters/:encounterId/prescriptions` | List prescriptions for an encounter. |
| `GET` | `/api/prescriptions/:prescriptionId` | Read one prescription. |
| `POST` | `/api/prescriptions` | Create prescription. |
| `PATCH` | `/api/prescriptions/:prescriptionId` | Update prescription. |
| `DELETE` | `/api/prescriptions/:prescriptionId` | Soft delete prescription. |

## Files, Consent, and Audit

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/api/patients/:patientId/consents` | List consent records for a patient. |
| `GET` | `/api/consents/:consentId` | Read one consent record. |
| `POST` | `/api/consents` | Create consent record. |
| `PATCH` | `/api/consents/:consentId` | Update consent record. |
| `GET` | `/api/file-assets/:fileAssetId` | Read one file asset. |
| `POST` | `/api/file-assets` | Create file asset metadata. |
| `GET` | `/api/attachments` | List attachment links by target. |
| `POST` | `/api/attachments` | Create attachment link. |
| `GET` | `/api/audit-logs` | Read audit logs by entity. |
| `GET` | `/api/patients/:patientId/timeline` | Read patient timeline. |

## Organization and Access

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/api/users` | List users. |
| `POST` | `/api/users` | Create user. |
| `PATCH` | `/api/users/:userId` | Update user. |
| `GET` | `/api/practitioners` | List practitioners. |
| `POST` | `/api/practitioners` | Create practitioner. |
| `PATCH` | `/api/practitioners/:practitionerId` | Update practitioner. |

## Phase 1 Mismatches and Follow-ups

- A dedicated check-in table is not implemented; check-in is represented by the
  `checked_in` appointment status. The frontend patient workspace now uses the
  appointments API to create appointments, move them through check-in, and start
  an encounter with the appointment id.
- Permission and workflow definitions now exist as documentation, but the
  implementation still keeps permissions in code and does not enforce a central
  state transition graph.

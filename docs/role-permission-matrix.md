# Role Permission Matrix

## Scope

This document records the Phase 1 route-level permission model implemented in
`backend/api/auth.ts` and enforced in `backend/api/emrApi.ts`.

The current implementation has three roles:

- `doctor`
- `nurse`
- `admin`

When `resolveActor` is configured, the API resolves `x-user-id` against the
database and replaces request role headers with the resolved actor context.
Bearer authentication is applied before role checks when an API token is
configured. `GET /health` is intentionally outside bearer and role checks.

## Permission Summary

| Permission | Doctor | Nurse | Admin | Notes |
| --- | --- | --- | --- | --- |
| `patient_read` | Yes | Yes | Yes | Patient detail with flags, clinical child reads, SOAP read |
| `patient_write` | Yes | Yes | Yes | Patient registration |
| `audit_read` | Yes | Yes | Yes | Audit log and patient timeline reads |
| `appointment_read` | Yes | Yes | Yes | Appointment list and detail |
| `appointment_write` | Yes | Yes | Yes | Appointment create/update |
| `consent_read` | Yes | Yes | Yes | Consent list and detail |
| `consent_write` | Yes | Yes | Yes | Consent create/update |
| `attachment_read` | Yes | Yes | Yes | Attachment and file asset reads |
| `attachment_write` | Yes | Yes | Yes | File asset and attachment link create |
| `allergy_read` | Yes | Yes | Yes | Patient allergy list and detail |
| `allergy_write` | Yes | Yes | Yes | Patient allergy create/update/delete |
| `condition_read` | Yes | Yes | Yes | Patient condition list and detail |
| `condition_write` | Yes | Yes | Yes | Patient condition create/update/delete |
| `medication_read` | Yes | Yes | Yes | Patient medication list and detail |
| `medication_write` | Yes | Yes | Yes | Patient medication create/update/delete |
| `flag_read` | Yes | Yes | Yes | Patient flag list and detail |
| `flag_write` | Yes | Yes | Yes | Patient flag create/update/delete |
| `encounter_create` | Yes | Yes | Yes | Encounter with SOAP creation |
| `user_read` | No | No | Yes | User listing |
| `user_write` | No | No | Yes | User create/update |
| `practitioner_read` | Yes | Yes | Yes | Practitioner listing |
| `practitioner_write` | No | No | Yes | Practitioner create/update |
| `prescription_read` | Yes | Yes | Yes | Prescription list and detail |
| `prescription_write` | Yes | No | Yes | Prescription create/update/delete |
| `soap_update` | Yes | No | Yes | SOAP update/delete |
| `diagnosis_update` | Yes | No | Yes | Diagnosis create/update/delete |
| `vital_sign_update` | Yes | Yes | Yes | Vital sign create/update/delete |
| `clinical_note_finalize` | Yes | No | Yes | Clinical note finalize |
| `clinical_note_sign` | Yes | No | Yes | Clinical note sign |

## Route Matrix

| Method | Route | Permission |
| --- | --- | --- |
| `GET` | `/health` | Public health check |
| `POST` | `/api/patients` | `patient_write` |
| `GET` | `/api/patients/detail` | `patient_read` |
| `GET` | `/api/patients/:patientId/timeline` | `audit_read` |
| `GET` | `/api/patients/:patientId/consents` | `consent_read` |
| `GET` | `/api/patients/:patientId/allergies` | `allergy_read` |
| `GET` | `/api/patients/:patientId/conditions` | `condition_read` |
| `GET` | `/api/patients/:patientId/medications` | `medication_read` |
| `GET` | `/api/patients/:patientId/flags` | `flag_read` |
| `GET` | `/api/appointments` | `appointment_read` |
| `GET` | `/api/appointments/:appointmentId` | `appointment_read` |
| `POST` | `/api/appointments` | `appointment_write` |
| `PATCH` | `/api/appointments/:appointmentId` | `appointment_write` |
| `GET` | `/api/queue` | `appointment_read` |
| `POST` | `/api/visits` | `appointment_write` |
| `PATCH` | `/api/visits/:visitId` | `appointment_write` |
| `POST` | `/api/encounters` | `encounter_create` |
| `GET` | `/api/encounters/:encounterId` | `patient_read` |
| `PATCH` | `/api/encounters/:encounterId` | `encounter_update` |
| `GET` | `/api/clinical-notes/:clinicalNoteId/soap` | `patient_read` |
| `PATCH` | `/api/clinical-notes/:clinicalNoteId/soap` | `soap_update` |
| `DELETE` | `/api/clinical-notes/:clinicalNoteId/soap` | `soap_update` |
| `PATCH` | `/api/clinical-notes/:clinicalNoteId/finalize` | `clinical_note_finalize` |
| `PATCH` | `/api/clinical-notes/:clinicalNoteId/sign` | `clinical_note_sign` |
| `GET` | `/api/clinical-note-templates` | `patient_read` |
| `POST` | `/api/clinical-note-templates` | `soap_update` |
| `PATCH` | `/api/clinical-note-templates/:templateId` | `soap_update` |
| `GET` | `/api/clinics/:clinicId/settings` | `patient_read` |
| `PATCH` | `/api/clinics/:clinicId/settings` | `practitioner_write` |
| `GET` | `/api/reports/daily-operations` | `audit_read` |
| `GET` | `/api/diagnoses/:diagnosisId` | `patient_read` |
| `GET` | `/api/encounters/:encounterId/diagnoses` | `patient_read` |
| `POST` | `/api/diagnoses` | `diagnosis_update` |
| `PATCH` | `/api/diagnoses/:diagnosisId` | `diagnosis_update` |
| `DELETE` | `/api/diagnoses/:diagnosisId` | `diagnosis_update` |
| `GET` | `/api/vital-signs/:vitalSignId` | `patient_read` |
| `GET` | `/api/encounters/:encounterId/vital-signs` | `patient_read` |
| `POST` | `/api/vital-signs` | `vital_sign_update` |
| `PATCH` | `/api/vital-signs/:vitalSignId` | `vital_sign_update` |
| `DELETE` | `/api/vital-signs/:vitalSignId` | `vital_sign_update` |
| `GET` | `/api/prescriptions/:prescriptionId` | `prescription_read` |
| `GET` | `/api/encounters/:encounterId/prescriptions` | `prescription_read` |
| `POST` | `/api/prescriptions` | `prescription_write` |
| `PATCH` | `/api/prescriptions/:prescriptionId` | `prescription_write` |
| `DELETE` | `/api/prescriptions/:prescriptionId` | `prescription_write` |
| `GET` | `/api/consents/:consentId` | `consent_read` |
| `POST` | `/api/consents` | `consent_write` |
| `PATCH` | `/api/consents/:consentId` | `consent_write` |
| `GET` | `/api/file-assets/:fileAssetId` | `attachment_read` |
| `GET` | `/api/attachments` | `attachment_read` |
| `POST` | `/api/file-assets` | `attachment_write` |
| `POST` | `/api/attachments` | `attachment_write` |
| `GET` | `/api/patient-allergies/:allergyId` | `allergy_read` |
| `POST` | `/api/patient-allergies` | `allergy_write` |
| `PATCH` | `/api/patient-allergies/:allergyId` | `allergy_write` |
| `DELETE` | `/api/patient-allergies/:allergyId` | `allergy_write` |
| `GET` | `/api/patient-conditions/:conditionId` | `condition_read` |
| `POST` | `/api/patient-conditions` | `condition_write` |
| `PATCH` | `/api/patient-conditions/:conditionId` | `condition_write` |
| `DELETE` | `/api/patient-conditions/:conditionId` | `condition_write` |
| `GET` | `/api/patient-medications/:medicationId` | `medication_read` |
| `POST` | `/api/patient-medications` | `medication_write` |
| `PATCH` | `/api/patient-medications/:medicationId` | `medication_write` |
| `DELETE` | `/api/patient-medications/:medicationId` | `medication_write` |
| `GET` | `/api/patient-flags/:flagId` | `flag_read` |
| `POST` | `/api/patient-flags` | `flag_write` |
| `PATCH` | `/api/patient-flags/:flagId` | `flag_write` |
| `DELETE` | `/api/patient-flags/:flagId` | `flag_write` |
| `GET` | `/api/users` | `user_read` |
| `POST` | `/api/users` | `user_write` |
| `PATCH` | `/api/users/:userId` | `user_write` |
| `GET` | `/api/practitioners` | `practitioner_read` |
| `POST` | `/api/practitioners` | `practitioner_write` |
| `PATCH` | `/api/practitioners/:practitionerId` | `practitioner_write` |
| `GET` | `/api/audit-logs` | `audit_read` |

## Phase 1 Gaps

- Permissions are currently defined in code, not in database tables.
- Role checks are route-level checks; they do not yet express patient assignment,
  clinic membership, or ownership policies.
- Several clinical read routes share `patient_read` rather than entity-specific
  read permissions for diagnoses, vital signs, and SOAP notes.

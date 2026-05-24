# Workflow State Definition

## Scope

This document consolidates Phase 1 status fields that are currently implemented
in TypeScript types, API validation, and database enum migrations.

The API validates allowed states, but it does not yet enforce a full state
transition graph. Invalid lifecycle jumps should be handled by service-level
workflow rules in a future hardening pass.

## Appointments

Source enum: `appointment_status`.

| State | Meaning |
| --- | --- |
| `pending` | Appointment was created but not confirmed. |
| `confirmed` | Appointment was accepted or scheduled as expected. |
| `checked_in` | Patient has arrived or been checked in for service. |
| `completed` | Appointment workflow is finished. |
| `cancelled` | Appointment was cancelled before completion. |
| `no_show` | Patient did not arrive for the appointment. |

Expected common flow:

```text
pending -> confirmed -> checked_in -> completed
pending/confirmed -> cancelled
confirmed -> no_show
```

The appointment update API enforces these status transitions and returns `409`
when a request attempts to skip or leave a terminal state.

## Clinic Visits

Source enum: `clinic_visit_status`.

| State | Meaning |
| --- | --- |
| `waiting` | Patient is checked in and waiting. |
| `in_room` | Patient has been called into a room. |
| `with_doctor` | Patient is actively with the practitioner. |
| `completed` | Clinical visit activity is complete. |
| `discharged` | Patient has left the clinic workflow. |
| `cancelled` | Visit/check-in was cancelled. |

Expected common flow:

```text
waiting -> in_room -> with_doctor -> completed -> discharged
waiting/in_room/with_doctor -> cancelled
```

Starting a visit from the queue creates an `in_progress` encounter/SOAP record
and saves the new `encounter_id` on the visit before moving it to
`with_doctor`.

## Encounters

Source enum: `encounter_status`.

| State | Meaning |
| --- | --- |
| `draft` | Encounter shell exists but care activity is not fully in progress. |
| `in_progress` | Clinical work is underway. |
| `completed` | Encounter activity is complete. |
| `signed` | Encounter has been signed off. |
| `cancelled` | Encounter was cancelled or should not proceed. |

Expected common flow:

```text
draft -> in_progress -> completed -> signed
draft/in_progress -> cancelled
```

The encounter update API enforces these status transitions and returns `409`
when a request attempts to skip or leave a terminal state.

## Clinical Notes

Source enum: `clinical_note_status`.

| State | Meaning |
| --- | --- |
| `draft` | Note is editable working documentation. |
| `final` | Note has been finalized or signed. |
| `amended` | Final note has later correction context. |
| `voided` | Note should no longer be treated as valid clinical documentation. |

Current API actions:

- `PATCH /api/clinical-notes/:id/soap` updates SOAP note content.
- `PATCH /api/clinical-notes/:id/finalize` sets note status to `final` and records `finalized_at`.
- `PATCH /api/clinical-notes/:id/sign` sets note status to `final` and records `signed_at`.
- `DELETE /api/clinical-notes/:id/soap` soft deletes the SOAP row.

Implementation note: finalization and signing are distinct API actions, but the
current status enum records both as `final`; timestamp fields carry the extra
workflow detail.

## Consent Records

Source enum: `consent_status`.

| State | Meaning |
| --- | --- |
| `granted` | Patient consent is currently granted. |
| `revoked` | Consent was withdrawn. |
| `expired` | Consent is no longer valid because the validity window elapsed. |
| `declined` | Patient declined consent. |

Expected common flow:

```text
granted -> revoked
granted -> expired
declined
```

## Prescriptions

Source enum: `prescription_status`.

| State | Meaning |
| --- | --- |
| `active` | Prescription is currently active. |
| `completed` | Prescription course or workflow is complete. |
| `cancelled` | Prescription is cancelled and should not be used clinically. |

Expected common flow:

```text
active -> completed
active -> cancelled
```

## Patient Allergies

Source enum: `allergy_status`.

| State | Meaning |
| --- | --- |
| `active` | Allergy should be considered current. |
| `inactive` | Allergy is retained historically but not currently active. |
| `entered_in_error` | Allergy row should be ignored clinically because it was recorded incorrectly. |

## Patient Conditions

Source enum: `patient_condition_status`.

| State | Meaning |
| --- | --- |
| `active` | Condition is currently active. |
| `resolved` | Condition has resolved. |
| `inactive` | Condition is retained historically but not currently active. |
| `entered_in_error` | Condition row should be ignored clinically because it was recorded incorrectly. |

## Patient Medications

Source enum: `patient_medication_status`.

| State | Meaning |
| --- | --- |
| `active` | Medication is currently being taken or tracked. |
| `completed` | Medication course is complete. |
| `stopped` | Medication was stopped before normal completion. |
| `on_hold` | Medication is temporarily paused. |
| `entered_in_error` | Medication row should be ignored clinically because it was recorded incorrectly. |

## Patient Flags

Source enum: `patient_flag_status`.

| State | Meaning |
| --- | --- |
| `active` | Flag should be surfaced in patient context. |
| `inactive` | Flag is retained historically but should not be surfaced as current. |
| `resolved` | Flag condition or operational warning has been resolved. |
| `entered_in_error` | Flag row should be ignored because it was recorded incorrectly. |

Severity is tracked separately as `info`, `caution`, or `critical`.

## Diagnoses

Source enum: `diagnosis_status`.

| State | Meaning |
| --- | --- |
| `active` | Diagnosis is currently active for the encounter or note context. |
| `resolved` | Diagnosis has resolved. |
| `entered_in_error` | Diagnosis row should be ignored clinically because it was recorded incorrectly. |

Diagnosis type is tracked separately as `working`, `final`, `differential`, or
`ruled_out`.

## Phase 1 Gaps

- State transition validation is not centralized yet. Appointment and encounter
  status updates are guarded in the API, but other workflow state machines
  remain mostly documented rather than centrally enforced.
- Encounter signing and clinical note signing are represented separately and
  should be aligned before deeper workflow automation.
- Check-in is represented through appointment status, not a separate `check_ins`
  table. The frontend check-in workflow currently patches appointments to
  `checked_in` and starts encounters by passing `appointmentId`.

# Architecture

## Architectural Stance

The platform follows an EMR-first architecture:

- The EMR owns the authoritative clinical record.
- Communication channels are adapters, not the core system.
- Scheduling, clinical care, documentation, and governance remain separate but connected domains.
- Every important change to patient data should be auditable.

## Core Domain Boundaries

### 1. Organization and Access

Owns organizational structure, clinics, departments, users, roles, permissions, practitioners, and staff profiles.

### 2. Patient and Clinical Profile

Owns patient identity, identifiers, contacts, addresses, emergency contacts, allergies, chronic conditions, medications, flags, and consent records.

### 3. Scheduling and Encounter

Owns appointments, check-in activity, encounter creation, encounter participants, status history, and follow-up planning.

### 4. Clinical Documentation

Owns clinical notes, SOAP notes, diagnoses, clinical impressions, vital signs, and prescribing records.

### 5. Files, Consent, and Audit

Owns file assets, attachment links, access logs, audit logs, and data change history.

### 6. Future Integration Layer

Reserved for external identity links, LINE account linking, webhook events, notification events, and telemedicine sessions.

## Key Modeling Rules

- Appointment is not the same as encounter.
- Encounter is not the same as clinical note.
- Consent is a first-class entity with version history and traceability.
- Attachments should support generic linking across multiple entity types.
- Audit should be designed as a platform capability, not an afterthought.

## Suggested High-Level Layout

```text
Client Applications
        |
        v
Backend Application Layer
        |
        v
EMR Core Domains
  - organization_access
  - patient_profile
  - scheduling_encounter
  - clinical_documentation
  - files_consent_audit
        |
        v
Relational Database
        |
        v
Integration Adapters
  - LINE
  - telemedicine
  - HIS/FHIR
  - notifications
```

## Implementation Intent

In the next phase, the backend and database should be built so that:

- domain modules can evolve independently
- auditability and permissions are available from the beginning
- the schema supports longitudinal patient records
- future integrations consume or contribute through explicit interfaces instead of directly reshaping core clinical data

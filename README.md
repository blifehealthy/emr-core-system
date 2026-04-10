# EMR Core System

This repository is the starting point for an EMR-first healthcare platform.

The goal of this phase is to establish the project structure, architecture direction, and documentation before building the full system. The EMR is treated as the clinical source of truth, while future channels such as LINE integration and telemedicine are designed as extensions around the clinical core.

## Project Structure

```text
.
|-- README.md
|-- backend/
|-- database/
|-- docs/
`-- emr_project_master_plan.md
```

## EMR-First Architecture Principles

- The EMR is the primary system of record for clinical data.
- Clinical records are separated from communication-channel data.
- Appointments, encounters, and notes are distinct domain concepts.
- Consent, attachments, and audit logging are core platform capabilities.
- External integrations must not reshape the clinical core.

## Planned Domain Areas

- Organization and access management
- Patient and clinical profile
- Scheduling and encounter workflow
- Clinical documentation
- Files, consent, and audit
- Future integration layer

## Current Scope

Included in this initialization phase:

- repository structure
- architecture documentation
- backend and database placeholders

Not included yet:

- application code
- APIs
- schema migrations
- infrastructure setup
- authentication and authorization implementation

## Documentation

- [Project Overview](/Users/macbook/emr-core-system/docs/project-overview.md)
- [Architecture](/Users/macbook/emr-core-system/docs/architecture.md)
- [Backend Notes](/Users/macbook/emr-core-system/backend/README.md)
- [Database Notes](/Users/macbook/emr-core-system/database/README.md)

## Next Steps

1. Confirm the bounded contexts and domain vocabulary.
2. Define the backend service shape and module boundaries.
3. Design the initial relational schema for EMR core entities.
4. Add migration, API, and security foundations in the next implementation phase.

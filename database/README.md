# Database Notes

This directory is reserved for the database layer of the EMR system.

## Structure

- `migrations/` contains SQL migrations for the initial EMR schema foundation

## Intended Responsibilities

- define the core relational schema for EMR data
- preserve clear separation between scheduling, encounter, documentation, and governance records
- support auditability and attachment linking
- provide a stable foundation for future integrations

## Expected Schema Areas

- organization and access tables
- patient profile tables
- scheduling and encounter tables
- clinical documentation tables
- files, consent, and audit tables
- future integration tables kept separate from the clinical core

## Not Added Yet

- schema definitions
- migration files
- seed data
- database tooling configuration

This placeholder marks where schema design and migrations should begin in the next implementation phase.

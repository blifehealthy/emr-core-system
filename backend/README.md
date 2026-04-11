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

## Not Added Yet

- runtime framework
- service code
- API routes
- tests
- environment configuration

## Current Progress

- repository and service flows exist for patient read and encounter creation
- API handlers now exist for:
  - `GET /health`
  - `GET /api/patients/detail`
  - `POST /api/encounters`
- a lightweight Node HTTP adapter is wired to Postgres through `DATABASE_URL`

This backend now has a real Postgres adapter, but it is still missing authentication, authorization, richer error policies, and production runtime configuration.

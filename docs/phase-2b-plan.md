# Phase 2B Plan

Phase 2B moves the Phase 2A clinic workflow toward pilot readiness. The first
implementation priority is clinical safety, followed by production readiness and
operational hardening.

## Status

Phase 2B has started. The current slice adds a drug catalog and allergy warning
foundation for prescription safety. It is not a complete medication decision
support system yet.

## Completed In This Pass

- `drug_catalog` table with clinic-scoped medication name, optional RxNorm code,
  generic/strength/form/route fields, active flag, and allergen tags.
- Prescriptions can optionally link to a drug catalog item through
  `drug_catalog_id`.
- Prescriptions store `safety_warnings` as a JSONB warning snapshot.
- New safety service checks active patient allergies against medication name,
  RxNorm/catalog lookup, generic name, and catalog allergen tags.
- New API routes:
  - `GET /api/drug-catalog`
  - `POST /api/drug-catalog`
  - `PATCH /api/drug-catalog/:id`
  - `POST /api/prescription-safety-checks`
- Prescription create/update can refresh safety warning snapshots when enough
  encounter/patient context is available.
- API smoke seed and smoke test cover a penicillin allergy warning for
  amoxicillin.

## Remaining Phase 2B Follow-ups

- Add frontend drug catalog picker and visible prescription warning banner.
- Add medication interaction rules beyond allergy matching.
- Add override reason workflow when a clinician proceeds despite warnings.
- Add production readiness work: session/auth hardening, MFA/identity provider
  integration plan, monitoring, backup checks, deployment readiness checklist,
  and audit hardening.
- Decide whether warning severity and allergen tags should be clinic-managed or
  centrally governed.

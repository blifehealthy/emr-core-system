# Phase 2D Plan

Phase 2D moves Phase 2C pilot auth toward production identity provider
integration.

## Status

Phase 2D is ready for clinician/operator review. This phase adds
OIDC-compatible bearer token verification and database user mapping.

## Completed In This Pass

- Added `users.oidc_subject` with an active unique index.
- Added `resolveOidcActor` service to map OIDC subject to active users.
- Added OIDC-compatible HS256 JWT verification for deterministic local and
  pilot identity-provider testing.
- Protected API routes can now accept:
  - static technical `API_TOKEN`
  - internal Phase 2C session token
  - OIDC-compatible bearer access token
- OIDC tokens carry the external subject only; API role/practitioner context is
  resolved from the local active user record.
- Admin user create/update APIs can bind or clear `oidc_subject`.
- Clinic admin frontend user form exposes an `OIDC subject` field and shows
  mappings in user cards.
- Known-user login failures now write `session_login_failed` audit events with
  reason and lockout timestamp when present.
- API smoke seeds OIDC subject mappings and verifies protected patient detail
  access with an OIDC bearer token.
- Production readiness check validates OIDC config when enabled:
  - `AUTH_OIDC_ISSUER`
  - `AUTH_OIDC_AUDIENCE`
  - `AUTH_OIDC_HS256_SECRET`
- `docs/phase-2d-clinician-summary-th.md` summarizes the production identity
  readiness changes for clinic owners and operators.
- `docs/phase-2d-uat-checklist-th.md` gives UAT checks for OIDC mapping,
  role-based access, failed-login audit, and deployment readiness.

## Important Constraint

This pass uses HS256 verification so the repo can test OIDC-like behavior
without adding a JWKS client or network dependency. Before broad production
rollout, replace or extend this with RS256/JWKS verification from the selected
identity provider.

## Post-Phase 2D Follow-ups

- Select the target identity provider.
- Add RS256/JWKS verification path for the selected provider if local public-key
  configuration is not enough for deployment.
- Add OIDC auth failure audit events for mapped users when provider data is
  available in failed token paths.
- Add MFA requirement documentation and enforcement hooks once provider is
  selected.

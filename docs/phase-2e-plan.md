# Phase 2E Plan

Phase 2E extends production identity readiness from OIDC-compatible test tokens
toward provider-grade signing support.

## Status

Phase 2E is ready for clinician/operator review. The implementation adds RS256
public-key verification alongside the Phase 2D HS256 local test path and updates
the production readiness gate for either signing mode.

## Completed In This Pass

- OIDC bearer verification now supports:
  - `HS256` with `AUTH_OIDC_HS256_SECRET`
  - `RS256` with `AUTH_OIDC_RS256_PUBLIC_KEY_PEM`
- Readiness checks accept either HS256 local verification or RS256 public-key
  verification when OIDC is enabled.
- OIDC tests cover valid RS256 tokens, invalid signatures, issuer, audience, and
  expiry checks.
- API startup can load `AUTH_OIDC_RS256_PUBLIC_KEY_PEM`.
- Thai clinician/operator summary added:
  - `docs/phase-2e-clinician-summary-th.md`
- Thai UAT checklist added:
  - `docs/phase-2e-uat-checklist-th.md`

## Post-Phase 2E Follow-Ups

- Add JWKS URL retrieval/cache once the target identity provider is selected.
- Add MFA policy hooks/documentation tied to provider claims.
- Run Phase 2E UAT with the clinic owner, operator, and identity provider
  representative.

## Recommended Next Phase

Start Phase 2F after provider selection:

- provider-specific JWKS URL retrieval/cache
- MFA claim policy for admin/doctor access
- provider runbook for key rotation and incident response

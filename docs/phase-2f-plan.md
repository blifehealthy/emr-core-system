# Phase 2F Plan

Phase 2F closes the provider-specific identity integration foundation by adding
JWKS retrieval/cache and a configurable MFA claim gate for OIDC bearer tokens.

## Status

Phase 2F is ready for clinician/operator review.

## Completed In This Pass

- Added OIDC JWKS loader/cache:
  - `AUTH_OIDC_JWKS_URL`
  - `AUTH_OIDC_JWKS_CACHE_TTL_SECONDS`
- JWKS RSA keys are converted to PEM public keys and keyed by `kid`.
- RS256 token verification can select the correct provider key by token `kid`.
- API startup can load JWKS keys before enabling OIDC auth.
- Added optional MFA claim enforcement:
  - `AUTH_OIDC_MFA_REQUIRED=true`
  - `AUTH_OIDC_MFA_CLAIM=acr`
  - `AUTH_OIDC_MFA_VALUES=urn:mfa,mfa`
- Production readiness checks validate JWKS URL, JWKS TTL, and MFA policy env.
- Tests cover JWKS conversion, JWKS cache TTL reuse/refresh, RS256 `kid`
  selection, unknown `kid` rejection, and MFA claim enforcement.
- Thai clinician/operator summary added:
  - `docs/phase-2f-clinician-summary-th.md`
- Thai UAT checklist added:
  - `docs/phase-2f-uat-checklist-th.md`

## Operator Notes

- Prefer `AUTH_OIDC_JWKS_URL` for production identity providers.
- Keep `AUTH_OIDC_RS256_PUBLIC_KEY_PEM` as a fallback for providers without a
  stable JWKS endpoint.
- Keep `AUTH_OIDC_HS256_SECRET` for local deterministic tests only.
- MFA claim values must be agreed with the selected provider before enabling
  `AUTH_OIDC_MFA_REQUIRED=true`.

## Remaining Follow-Ups

- Run provider-specific UAT against the actual identity provider.
- Add operational monitoring around JWKS fetch failures during deployment.
- Add provider-specific incident/key-rotation runbook after provider selection.

## Recommended Next Phase

Start Phase 2G after identity UAT:

- audit hardening for authorization failures and identity events
- provider-specific deployment runbook
- expanded production monitoring/backup drills before pilot go-live

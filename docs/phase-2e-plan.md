# Phase 2E Plan

Phase 2E extends production identity readiness from OIDC-compatible test tokens
toward provider-grade signing support.

## Status

Phase 2E has started. The first implementation slice adds RS256 public-key
verification alongside the Phase 2D HS256 local test path.

## Completed In This Pass

- OIDC bearer verification now supports:
  - `HS256` with `AUTH_OIDC_HS256_SECRET`
  - `RS256` with `AUTH_OIDC_RS256_PUBLIC_KEY_PEM`
- Readiness checks accept either HS256 local verification or RS256 public-key
  verification when OIDC is enabled.
- OIDC tests cover valid RS256 tokens, invalid signatures, issuer, audience, and
  expiry checks.
- API startup can load `AUTH_OIDC_RS256_PUBLIC_KEY_PEM`.

## Remaining Phase 2E Work

- Add JWKS URL retrieval/cache once the target identity provider is selected.
- Add MFA policy hooks/documentation tied to provider claims.
- Add Phase 2E operator summary and UAT checklist after provider choice is made.

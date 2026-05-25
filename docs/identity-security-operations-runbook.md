# Identity Security Operations Runbook

Use this runbook during pilot preparation and production identity incidents.

## Scope

This runbook covers:

- bearer token authentication failures
- role authorization failures
- OIDC subject mapping issues
- JWKS/key rotation issues
- MFA claim policy issues
- readiness check failures

## Audit Events

API security failures are written as audit logs:

- `entity_type`: `security_event`
- `action`: `auth_failed` for HTTP `401`
- `action`: `authorization_failed` for HTTP `403`
- `entity_id`: `<METHOD> <PATH>`

Metadata includes:

- `method`
- `path`
- `status`
- `error`
- `oidcSubject`
- `role`

Login/session endpoints keep separate audit actions:

- `session_created`
- `session_login_failed`

## Triage: Repeated 401

1. Search audit logs for `entity_type=security_event` and `action=auth_failed`.
2. Group by `path` and `error`.
3. Confirm whether the caller is using:
   - expired session token
   - wrong `API_TOKEN`
   - invalid OIDC token
   - missing MFA claim
   - unknown JWKS `kid`
4. If OIDC is involved, verify:
   - `AUTH_OIDC_ISSUER`
   - `AUTH_OIDC_AUDIENCE`
   - `AUTH_OIDC_JWKS_URL`
   - `AUTH_OIDC_MFA_CLAIM`
   - `AUTH_OIDC_MFA_VALUES`

## Triage: Repeated 403

1. Search audit logs for `action=authorization_failed`.
2. Check metadata `role`, `path`, and `error`.
3. Confirm the user is active in EMR.
4. Confirm the EMR user role matches the workflow.
5. Confirm `users.oidc_subject` maps to the intended person.
6. If the user needs new permissions, update the role/permission policy before
   changing production data.

## JWKS And Key Rotation

Before planned rotation:

1. Confirm provider publishes the new key in JWKS before signing tokens with it.
2. Confirm `AUTH_OIDC_JWKS_URL` uses HTTPS.
3. Confirm `AUTH_OIDC_JWKS_CACHE_TTL_SECONDS` is acceptable for the provider
   rotation window.
4. Restart API after emergency rotations if the provider cannot overlap old and
   new keys.

During an incident:

1. Check whether rejected tokens have an unknown `kid`.
2. Fetch the JWKS URL from an operator machine.
3. Confirm the `kid` exists in provider JWKS.
4. Restart API if cached keys are stale and the situation is urgent.
5. Escalate to provider/vendor if JWKS is unavailable or missing the active key.

## MFA Claim Issues

When MFA policy rejects users:

1. Confirm `AUTH_OIDC_MFA_REQUIRED=true` is intentional.
2. Confirm provider sends the configured claim.
3. Confirm `AUTH_OIDC_MFA_VALUES` includes the exact value used by provider.
4. Test admin and doctor login paths separately.
5. Do not disable MFA for production without incident owner approval.

## Readiness Gate

Run before pilot or production changes:

```bash
PRODUCTION_READINESS_STRICT=true npm run production:check
```

Block deployment if strict readiness reports errors.

## Incident Roles

- Incident owner: clinic/deployment owner
- Technical operator: deployment maintainer
- Identity provider contact: provider/vendor admin
- Clinical decision owner: clinic owner or assigned doctor

## Recovery Notes

- Prefer fixing provider config over weakening EMR checks.
- Keep `HS256` config for local deterministic tests only.
- Use `AUTH_OIDC_RS256_PUBLIC_KEY_PEM` as a temporary fallback only when JWKS is
  unavailable and an operator-approved public key is available.
- Document all emergency changes in the deployment log.

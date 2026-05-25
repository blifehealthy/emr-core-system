# Identity And Access Production Plan

The current API can be protected with a shared bearer token through
`API_TOKEN`. This is acceptable for local development, smoke tests, and a
controlled technical pilot, but it is not the final production identity model.

## Current State

- API routes can require `Authorization: Bearer <API_TOKEN>`.
- Pilot users can call `POST /api/auth/sessions` with `clinicId`, `username`,
  and `AUTH_LOGIN_CODE` to receive a short-lived signed bearer token.
- Session bearer tokens carry only user id; role and practitioner context are
  resolved from active database records.
- OIDC-compatible bearer tokens can map external subjects to users through
  `users.oidc_subject`.
- Clinic admins can bind `oidc_subject` on user records during pilot setup.
- OIDC verification supports HS256 local testing and RS256 public-key provider
  tokens through configured env.
- Known-user login failures write audit events for support review.
- User records track `last_login_at`, `failed_login_count`, and `locked_until`
  for pilot lockout controls.
- Static technical tokens can still use `x-user-id` for smoke tests and trusted
  operator workflows.
- `x-user-role` and `x-practitioner-id` remain explicit local/test fallbacks.
- Permission groups are documented in `docs/role-permission-matrix.md`.
- Audit lookup is available to admin users.

## Production Target

Production access should move to an identity provider with:

- per-user login
- MFA for admins and clinicians
- short-lived access tokens
- refresh/session expiration policy
- mapped clinic role claims
- disabled-user enforcement
- audit identity that does not depend on caller-supplied headers

## Recommended Phases

### Phase I: Pilot Guardrails

- Keep `API_TOKEN` enabled and strong.
- Keep `AUTH_LOGIN_CODE` and `AUTH_SESSION_SECRET` strong and rotated.
- Restrict token access to deployment operators.
- Prefer session bearer tokens for pilot users.
- Use role headers only from trusted local/test boundaries.
- Review locked accounts and failed login counts during pilot support.
- Review `session_login_failed` audit events during pilot support.
- Confirm admin, doctor, and nurse role mappings during UAT.
- Run `PRODUCTION_READINESS_STRICT=true npm run production:check` before pilot.

### Phase II: Identity Provider Integration

- Select provider: managed OIDC, clinic SSO, or private identity service.
- Add provider-grade JWT verification middleware.
- Map token subject to `users.oidc_subject`.
- Resolve role and practitioner id from database, not request headers.
- Reject inactive users.
- Record authenticated user id in audit logs.

### Phase III: MFA And Session Hardening

- Require MFA for admin users.
- Require MFA for remote clinician access.
- Define session idle timeout and absolute timeout.
- Add forced logout for disabled users.
- Add token rotation and revocation strategy.

## RBAC Rules To Preserve

- Doctors can create/update prescriptions, SOAP notes, diagnoses, and clinical
  note finalization/signature actions.
- Nurses can support intake, vitals, queue, and patient profile workflows.
- Admins can manage users, practitioners, clinic settings, drug catalog, and
  interaction rules.
- Drug catalog and interaction rule writes should remain admin-only unless the
  clinic explicitly assigns medication governance to another role.

## Audit Hardening

Before production identity launch:

- Store resolved authenticated user id for each write.
- Store practitioner id where clinical action context exists.
- Add audit entries for catalog/rule changes and safety overrides.
- Review logs for failed authorization attempts.
- Add retention policy for audit logs.

## Open Decisions

- Which identity provider will be used for the first production deployment?
- Will clinic admins invite users directly or will accounts be provisioned by an
  operator?
- Which roles require MFA on day one?
- Should doctors be able to manage drug interaction rules, or should that stay
  admin-only?

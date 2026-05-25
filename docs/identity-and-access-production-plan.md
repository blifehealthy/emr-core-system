# Identity And Access Production Plan

The current API can be protected with a shared bearer token through
`API_TOKEN`. This is acceptable for local development, smoke tests, and a
controlled technical pilot, but it is not the final production identity model.

## Current State

- API routes can require `Authorization: Bearer <API_TOKEN>`.
- Role checks use `x-user-role`.
- Actor resolution can use `x-user-id` and practitioner context.
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
- Restrict token access to deployment operators.
- Use role headers only from trusted frontend/API boundary.
- Confirm admin, doctor, and nurse role mappings during UAT.
- Run `PRODUCTION_READINESS_STRICT=true npm run production:check` before pilot.

### Phase II: Identity Provider Integration

- Select provider: managed OIDC, clinic SSO, or private identity service.
- Add JWT verification middleware.
- Map token subject to `users.id`.
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

# Phase 2C Plan

Phase 2C moves the system from technical pilot readiness toward production
identity and operational hardening.

## Status

Phase 2C is ready for clinician/operator review. This phase adds pilot login
sessions that resolve users from the database instead of relying on
caller-supplied role headers.

## Completed In This Pass

- New `POST /api/auth/sessions` endpoint.
- Pilot session login with `clinicId`, `username`, and operator-managed
  `AUTH_LOGIN_CODE`.
- HMAC-signed session bearer tokens with expiry.
- Session bearer tokens carry user id only.
- Protected API routes resolve role and practitioner context from active
  database users on each request when `resolveActor` is configured.
- Session creation writes an audit log entry on the user record.
- Users now store `last_login_at`, `failed_login_count`, and `locked_until`.
- Successful login resets failed attempts and records `last_login_at`.
- Repeated invalid login codes can temporarily lock a user account.
- Frontend connection panel can create a session token from clinic id, username,
  and login code, then reuse it for existing workflows.
- API smoke now obtains doctor/admin session tokens before exercising protected
  workflows.
- Browser API workflow smoke now logs in through the frontend session panel
  before queue, prescription safety, SOAP, reporting, and admin workflows.
- Production readiness check now validates:
  - `AUTH_SESSION_SECRET`
  - `AUTH_LOGIN_CODE`
  - `AUTH_SESSION_TTL_MINUTES`
- `docs/phase-2c-clinician-summary-th.md` summarizes the login/session changes
  for doctors, clinic owners, and operators.
- `docs/phase-2c-uat-checklist-th.md` gives a UAT checklist for login,
  role-based access, lockout behavior, and deployment readiness.

## Post-Phase 2C Follow-ups

- Add failed login audit events with user id when an active user is known.
- Decide whether to implement OIDC/MFA immediately or after clinic pilot UAT.
- Replace shared `AUTH_LOGIN_CODE` with per-user credential or identity provider
  flow before broader production rollout.

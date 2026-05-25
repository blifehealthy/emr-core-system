# Phase 2C Plan

Phase 2C moves the system from technical pilot readiness toward production
identity and operational hardening.

## Status

Phase 2C has started. The first implementation slice adds pilot login sessions
that resolve users from the database instead of relying on caller-supplied role
headers.

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
- Production readiness check now validates:
  - `AUTH_SESSION_SECRET`
  - `AUTH_LOGIN_CODE`
  - `AUTH_SESSION_TTL_MINUTES`

## Remaining Phase 2C Work

- Add failed login audit events with user id when an active user is known.
- Add production identity provider/OIDC integration path after pilot auth is
  accepted.
- Add UAT summary for Phase 2C after frontend login lands.

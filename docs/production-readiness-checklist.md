# Production Readiness Checklist

Use this checklist before a pilot clinic run or production deployment. The
goal is to catch unsafe defaults before real clinical data enters the system.

## Automated Check

Run the readiness check in strict mode for pilot or production:

```bash
PRODUCTION_READINESS_STRICT=true npm run production:check
```

Or set the deployment profile:

```bash
DEPLOYMENT_PROFILE=pilot npm run production:check
```

The check fails on blocking configuration issues and prints warnings for items
that need human confirmation.

## Required Environment

- `DEPLOYMENT_PROFILE=pilot` or `NODE_ENV=production`
- `DATABASE_URL` points to the target Postgres database.
- `API_TOKEN` is set to a private bearer token of at least 32 characters.
- `AUTH_SESSION_SECRET` is set to a private signing secret of at least 32 characters.
- `AUTH_LOGIN_CODE` is set to a private onboarding/login code of at least 32 characters.
- `AUTH_SESSION_TTL_MINUTES` is set to an integer from 1 to 720 when overridden.
- If OIDC auth is enabled, `AUTH_OIDC_ISSUER`, `AUTH_OIDC_AUDIENCE`, and
  `AUTH_OIDC_HS256_SECRET` are set.
- `FILE_STORAGE_DRIVER` is set to `local` or `s3`.
- `FILE_STORAGE_DIR` uses persistent private disk when the local driver is used.
- `FILE_STORAGE_ALLOWED_MIME_TYPES` lists explicit MIME types.
- `FILE_STORAGE_MAX_BYTES` matches clinic upload policy.

For S3 or MinIO storage, also confirm:

- `FILE_STORAGE_S3_ENDPOINT`
- `FILE_STORAGE_S3_BUCKET`
- `FILE_STORAGE_S3_REGION`
- `FILE_STORAGE_S3_ACCESS_KEY_ID`
- `FILE_STORAGE_S3_SECRET_ACCESS_KEY`
- `FILE_STORAGE_S3_FORCE_PATH_STYLE`

## Go / No-Go Checks

- `npm test` passes.
- `npm run db:test` passes against the target migration database or a matching
  staging database.
- `npm run api:smoke` passes against a disposable database.
- `npm run browser:api-workflow-smoke` passes when Chrome and Docker Postgres
  are available.
- `npm run storage:check` shows the intended storage driver and redacted
  credentials.
- `npm run production:check` has zero errors in strict mode.

## Data Protection

- Database backups are scheduled and restore-tested.
- File storage backups are scheduled and restore-tested.
- Object storage bucket is private and not anonymously readable.
- Local file storage path is backed up together with database snapshots.
- Access to `.env`, database credentials, and file storage credentials is
  restricted to deployment operators.

## Operational Monitoring

- API process health endpoint is monitored through `GET /health`.
- Failed smoke checks block deployment.
- Audit lookup is available to admin users.
- Prescription safety override reason is required and stored when warnings are
  accepted.
- Drug catalog and interaction rule write access is limited to admins.

## Pilot Sign-Off

Before clinic pilot:

- Confirm role mapping for doctor, nurse, and admin users.
- Confirm queue, appointment check-in, SOAP editing, prescription print, and
  report export workflows with clinic staff.
- Confirm backup owner, restore owner, and incident contact.
- Keep a manual downtime process available for registration, encounter notes,
  prescriptions, and payment handoff.

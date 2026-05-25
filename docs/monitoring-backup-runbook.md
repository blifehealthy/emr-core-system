# Monitoring And Backup Runbook

This runbook defines the minimum operational checks for a pilot or production
environment.

## Health Checks

Monitor:

- `GET /health` for API process availability
- API process restart count
- database connectivity
- disk usage for local file storage
- object storage availability for S3/MinIO deployments
- smoke test success after deploy

## Deployment Gates

Before deploying:

```bash
npm test
npm run storage:check
PRODUCTION_READINESS_STRICT=true npm run production:check
```

When Docker Postgres and Chrome are available:

```bash
npm run api:smoke
npm run browser:api-workflow-smoke
```

A deploy should not proceed if:

- migrations fail
- readiness check has errors
- smoke test fails
- file storage config is not the intended driver
- backup status is unknown

## Backup Cadence

Recommended baseline:

- Postgres logical or physical backup daily
- point-in-time recovery when provider supports it
- file storage backup daily
- monthly archive retained for at least 12 months
- backup job alert on failure

Back up database and file assets on the same schedule so metadata and file bytes
can be restored together.

## Restore Drill

Run a restore drill before pilot sign-off and after major infrastructure
changes.

1. Restore database backup into a non-production database.
2. Restore file storage into a non-production path or bucket.
3. Start API against restored resources.
4. Run `npm run storage:check`.
5. Download a sample file asset.
6. Open a sample patient record.
7. Confirm prescriptions, warning snapshots, notes, and audit lookup are present.
8. Record restore duration and issues.

## Incident Response

### API Down

- Check process logs and restart count.
- Check database connectivity.
- Check latest deployment and migration status.
- Roll back deployment only if the current release is confirmed as the cause.

### Database Issue

- Stop writes if data consistency is at risk.
- Check backup freshness.
- Escalate to database operator.
- Restore to a staging database first when possible.

### File Storage Issue

- Run `npm run storage:check`.
- Confirm local disk or bucket credentials.
- Confirm sample object exists.
- Keep clinical workflow running with manual attachment handling if uploads are
  blocked.

### Safety Warning Issue

- Confirm drug catalog item and allergen tags.
- Confirm patient allergy is active.
- Confirm interaction rule is active and identifiers match medication name,
  RxNorm code, or catalog id.
- Log the case for clinical governance review.

## Pilot Daily Checklist

- Health endpoint green
- Previous backup completed
- File storage reachable
- API smoke passed after latest deploy
- No unresolved critical prescription safety reports
- Manual downtime forms available

## Ownership

Before pilot, assign named owners for:

- deployment
- database backup
- file storage backup
- restore drill
- user access and role changes
- clinical safety rule governance

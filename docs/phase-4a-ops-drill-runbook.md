# Phase 4A Ops Drill Runbook

Use this runbook before Phase 3 pilot go-live or production deployment.

## Required Commands

Run in the target or target-like environment:

```bash
npm test
npm run storage:check
PRODUCTION_READINESS_STRICT=true npm run production:check
npm run frontend:workflow-smoke
npm run api:smoke
```

When browser and Docker dependencies are available:

```bash
npm run browser:api-workflow-smoke
```

## Ops Drill Gate

After the commands and manual drills are completed, record evidence with env
vars and run:

```bash
OPS_DRILL_STRICT=true \
OPS_READINESS_CHECK_PASSED=true \
OPS_STORAGE_CHECK_PASSED=true \
OPS_API_SMOKE_PASSED=true \
OPS_FRONTEND_SMOKE_PASSED=true \
OPS_BACKUP_RESTORE_DRILL_PASSED=true \
OPS_ROLLBACK_DRILL_PASSED=true \
OPS_SECURITY_INCIDENT_DRILL_PASSED=true \
OPS_MONITORING_OWNER="TBD" \
OPS_BACKUP_OWNER="TBD" \
OPS_INCIDENT_OWNER="TBD" \
OPS_DEPLOYMENT_OWNER="TBD" \
OPS_DRILL_COMPLETED_AT="YYYY-MM-DD" \
OPS_GO_LIVE_WINDOW="YYYY-MM-DD HH:mm TZ" \
npm run ops:check
```

The check must have zero errors before go-live.

## Manual Drill Evidence

Record the following outside the repo or in the deployment ticket:

- command outputs or CI links
- backup snapshot identifier
- restored database name or environment
- restored file storage path or bucket
- restore duration
- rollback target version
- incident tabletop owner and notes
- go-live window
- final approver

## Backup And Restore Drill

1. Restore database backup into a non-production database.
2. Restore file storage into a non-production path or bucket.
3. Start API against restored resources.
4. Run `npm run storage:check`.
5. Open a sample patient.
6. Download a sample file asset.
7. Confirm prescription, billing, controlled-drug, and audit records are visible.
8. Record restore duration and issues.

## Rollback Drill

1. Identify current deployed version.
2. Identify previous known-good version.
3. Confirm migration rollback policy for the release.
4. Practice API/frontend rollback in non-production.
5. Run health check and smoke check after rollback.
6. Record rollback duration and owner.

## Security Incident Drill

Run a tabletop scenario for:

- leaked API token
- locked or compromised user
- OIDC/JWKS key rotation issue
- unauthorized controlled-drug access attempt

Confirm who can rotate secrets, disable users, inspect audit logs, and approve
clinic communication.

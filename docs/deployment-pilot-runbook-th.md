# Deployment & Pilot Runbook

ใช้ runbook นี้เป็นลำดับงานสำหรับ IT/Ops ก่อนเปิด pilot

## 1. Pre-Deployment

| Step | Command/Evidence | Owner | Result |
| --- | --- | --- | --- |
| Confirm target commit | `git rev-parse HEAD` | | |
| Install dependencies | `npm ci` | | |
| Type check | `npx tsc --noEmit` | | |
| Unit/migration tests | `npm test` | | |
| Storage config | `npm run storage:check` | | |
| Production readiness strict | `PRODUCTION_READINESS_STRICT=true npm run production:check` | | |

## 2. Required Environment

| Variable | Purpose | Required before pilot |
| --- | --- | --- |
| `DEPLOYMENT_PROFILE` | deployment mode such as `pilot` | yes |
| `DATABASE_URL` | Postgres connection | yes |
| `API_TOKEN` | bearer token for API | yes |
| `AUTH_SESSION_SECRET` | signed session secret | yes |
| `AUTH_LOGIN_CODE` | pilot login code policy | yes |
| `FILE_STORAGE_DIR` | persistent private file storage | yes |
| `FILE_STORAGE_MAX_UPLOAD_BYTES` | upload size policy | recommended |
| `FILE_STORAGE_ALLOWED_MIME_TYPES` | MIME allowlist | recommended |

## 3. Database

1. Take backup before migration.
2. Apply migrations in order.
3. Run DB integration checks if available.
4. Record migration version and timestamp.
5. Keep rollback backup reference.

Evidence:

```text
Backup ID:
Migration timestamp:
Operator:
Result:
```

## 4. File Storage

1. Configure persistent private storage.
2. Run `npm run storage:check`.
3. Upload/download a sample file in non-production test patient if allowed.
4. Confirm backup includes file assets.

## 5. Smoke Tests

Recommended:

```bash
npm run api:smoke
npm run frontend:workflow-smoke
npm run browser:workflow-smoke
npm run browser:api-workflow-smoke
```

If browser or Docker is not available, record why and run manual checklist.

## 6. Operations Drills

| Drill | Evidence required | Result |
| --- | --- | --- |
| Backup/restore | restored DB and file assets verified | |
| Rollback | previous build/database backup path verified | |
| Security incident tabletop | owner/action timeline recorded | |
| Printer failure drill | fallback/retry/report verified | |

## 7. Pilot Day Checklist

- [ ] Owners online: clinic, clinical, pharmacy, billing, IT
- [ ] Monitoring owner assigned
- [ ] Backup owner assigned
- [ ] Incident owner assigned
- [ ] Rollback owner assigned
- [ ] Current backup completed
- [ ] Manual fallback forms/process ready
- [ ] Pilot defect tracker open
- [ ] Go/no-go decision recorded

## 8. Rollback Criteria

Rollback or pause pilot if:

- patient record cannot be opened or updated
- clinical note/signing workflow blocks care
- billing totals are materially wrong
- pharmacy stock or controlled-drug audit is wrong
- auth/privacy incident occurs
- backup/restore path cannot be confirmed
- printer/scanner issue blocks pharmacy and fallback fails

## 9. Post-Pilot Review

| Item | Result |
| --- | --- |
| defect count by severity | |
| user feedback summary | |
| financial/pharmacy reconciliation completed | |
| audit log spot check completed | |
| next pilot decision | |

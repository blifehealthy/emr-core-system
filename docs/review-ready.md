# Review Ready

## Scope

- patient read now includes encounter-level prescriptions
- clinical child entities now have read, update, and soft delete API coverage
- request validation is stricter for user, practitioner, prescription, diagnosis, and vital sign writes
- clinic admin now includes API-backed user/practitioner filtering, audit lookup, and clearer duplicate/conflict feedback
- DB integration tests can run through local `psql` or a Docker Postgres container fallback

## Quick Checks

- Run `npm test` for TypeScript unit and migration guard tests
- Run `DATABASE_URL=... npm run db:test` when local `psql` is available
- Or run `POSTGRES_CONTAINER=... POSTGRES_DB=... npm run db:test` to use `docker exec`
- Run `npm run api:smoke` to verify real HTTP requests against a temporary Docker Postgres database, including selected frontend proxy flows
- Run `npm run frontend:workflow-smoke` after queue, report chart, or prescription print UI changes
- Run `npm run browser:workflow-smoke` when Chrome is available to click through queue and prescription print workflows
- Run `npm run storage:check` before deployment to verify file storage driver configuration

## Verified

- `npm test`
- `POSTGRES_CONTAINER=poolproject-postgres POSTGRES_DB=<temporary_db> POSTGRES_USER=postgres npm run db:test`

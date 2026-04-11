# Review Ready

## Scope

- patient read now includes encounter-level prescriptions
- clinical child entities now have read, update, and soft delete API coverage
- request validation is stricter for user, practitioner, prescription, diagnosis, and vital sign writes
- DB integration tests can run through local `psql` or a Docker Postgres container fallback

## Quick Checks

- Run `npm test` for TypeScript unit and migration guard tests
- Run `DATABASE_URL=... npm run db:test` when local `psql` is available
- Or run `POSTGRES_CONTAINER=... POSTGRES_DB=... npm run db:test` to use `docker exec`
- Run `npm run api:smoke` to verify real HTTP requests against a temporary Docker Postgres database

## Verified

- `npm test`
- `POSTGRES_CONTAINER=poolproject-postgres POSTGRES_DB=<temporary_db> POSTGRES_USER=postgres npm run db:test`

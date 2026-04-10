# Review Ready

## Scope

- SOAP note soft delete support now matches the patient read query
- patient read path has both repository and service wrappers
- transactional create flow has commit and rollback tests
- migration order is constrained to `0000 -> 0001 -> 0002`

## Quick Checks

- Run `npm test` for TypeScript unit and migration guard tests
- Run `DATABASE_URL=... npm run db:test` when Postgres is available

## Current Limitation

- DB integration tests are prepared but cannot be executed in this environment because `psql` and a reachable Postgres instance are not available

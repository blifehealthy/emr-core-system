# Local DB Testing

## Requirements

- one of:
  - PostgreSQL client tools with `psql` and a `DATABASE_URL`
  - a running Docker Postgres container with `POSTGRES_CONTAINER` and `POSTGRES_DB`

## Install `psql`

On macOS with Homebrew:

```bash
brew install libpq
brew link --force libpq
```

If you prefer a full local server:

```bash
brew install postgresql@16
brew services start postgresql@16
```

Then confirm:

```bash
psql --version
```

## Create a Local Test Database

If Postgres is running locally:

```bash
createdb emr_core
```

Example connection string:

```bash
export DATABASE_URL=postgres://localhost:5432/emr_core
```

If your database requires a username and password:

```bash
export DATABASE_URL=postgres://USER:PASSWORD@localhost:5432/emr_core
```

## Run the Integration Test

```bash
npm run db:test
```

If you have local `psql`, set:

```bash
export DATABASE_URL=postgres://localhost:5432/emr_core
npm run db:test
```

If `psql` is not installed but Postgres is running in Docker:

```bash
export POSTGRES_CONTAINER=poolproject-postgres
export POSTGRES_DB=emr_core
export POSTGRES_USER=postgres
npm run db:test
```

The script applies these migrations in order:

- `0000_organization_clinic_foundation.up.sql`
- `0001_emr_core_foundation.up.sql`
- `0002_add_organization_clinic_foreign_keys.up.sql`
- `0003_add_diagnoses_and_vital_signs.up.sql`
- `0004_add_audit_logs.up.sql`
- `0005_add_users_and_practitioners.up.sql`
- `0006_add_prescriptions.up.sql`
- `0007_add_appointments.up.sql`
- `0008_add_consent_records.up.sql`
- `0009_add_file_attachments.up.sql`
- `0010_add_patient_conditions.up.sql`

Then it runs:

- `database/tests/emr_core_integration.sql`

## Current Behavior

If local `psql` is missing, the script can fall back to `docker exec` when `POSTGRES_CONTAINER` and `POSTGRES_DB` are set.

#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
MIGRATIONS_DIR="$ROOT_DIR/database/migrations"
TEST_SQL="$ROOT_DIR/database/tests/emr_core_integration.sql"

run_psql() {
  local sql_file="$1"

  if command -v psql >/dev/null 2>&1; then
    if [[ -z "${DATABASE_URL:-}" ]]; then
      echo "DATABASE_URL is required to run DB integration tests with local psql." >&2
      echo "Example: DATABASE_URL=postgres://user:pass@localhost:5432/emr_core npm run db:test" >&2
      exit 1
    fi

    psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$sql_file"
    return
  fi

  if [[ -n "${POSTGRES_CONTAINER:-}" ]] && command -v docker >/dev/null 2>&1; then
    if [[ -z "${POSTGRES_DB:-}" ]]; then
      echo "POSTGRES_DB is required when using POSTGRES_CONTAINER fallback." >&2
      echo "Example: POSTGRES_CONTAINER=poolproject-postgres POSTGRES_DB=emr_core npm run db:test" >&2
      exit 1
    fi

    docker exec -i "$POSTGRES_CONTAINER" \
      psql -v ON_ERROR_STOP=1 -U "${POSTGRES_USER:-postgres}" -d "$POSTGRES_DB" \
      < "$sql_file"
    return
  fi

  echo "psql is required to run DB integration tests." >&2
  echo "Install PostgreSQL client tools first, or use POSTGRES_CONTAINER=... POSTGRES_DB=... npm run db:test" >&2
  exit 1
}

for migration in \
  "$MIGRATIONS_DIR/0000_organization_clinic_foundation.up.sql" \
  "$MIGRATIONS_DIR/0001_emr_core_foundation.up.sql" \
  "$MIGRATIONS_DIR/0002_add_organization_clinic_foreign_keys.up.sql" \
  "$MIGRATIONS_DIR/0003_add_diagnoses_and_vital_signs.up.sql" \
  "$MIGRATIONS_DIR/0004_add_audit_logs.up.sql" \
  "$MIGRATIONS_DIR/0005_add_users_and_practitioners.up.sql" \
  "$MIGRATIONS_DIR/0006_add_prescriptions.up.sql" \
  "$MIGRATIONS_DIR/0007_add_appointments.up.sql" \
  "$MIGRATIONS_DIR/0008_add_consent_records.up.sql" \
  "$MIGRATIONS_DIR/0009_add_file_attachments.up.sql" \
  "$MIGRATIONS_DIR/0010_add_patient_conditions.up.sql" \
  "$MIGRATIONS_DIR/0011_add_patient_medications.up.sql" \
  "$MIGRATIONS_DIR/0012_add_patient_flags.up.sql" \
  "$MIGRATIONS_DIR/0013_add_clinic_visits.up.sql" \
  "$MIGRATIONS_DIR/0014_add_clinical_note_templates.up.sql" \
  "$MIGRATIONS_DIR/0015_add_clinic_settings.up.sql"
do
  run_psql "$migration"
done

run_psql "$TEST_SQL"

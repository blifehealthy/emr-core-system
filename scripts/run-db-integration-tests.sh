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
  "$MIGRATIONS_DIR/0015_add_clinic_settings.up.sql" \
  "$MIGRATIONS_DIR/0016_add_clinic_logo_asset.up.sql" \
  "$MIGRATIONS_DIR/0017_add_drug_catalog_and_safety_warnings.up.sql" \
  "$MIGRATIONS_DIR/0018_add_prescription_safety_override.up.sql" \
  "$MIGRATIONS_DIR/0019_add_drug_interaction_rules.up.sql" \
  "$MIGRATIONS_DIR/0020_add_user_login_security.up.sql" \
  "$MIGRATIONS_DIR/0021_add_user_oidc_subject.up.sql" \
  "$MIGRATIONS_DIR/0022_add_billing_foundation.up.sql" \
  "$MIGRATIONS_DIR/0023_add_billing_refunds_and_charge_templates.up.sql" \
  "$MIGRATIONS_DIR/0024_add_phase_3a_completion_billing.up.sql" \
  "$MIGRATIONS_DIR/0025_add_phase_3b_billing_operations.up.sql" \
  "$MIGRATIONS_DIR/0026_add_phase_3c_pharmacy_inventory.up.sql"
do
  run_psql "$migration"
done

run_psql "$TEST_SQL"

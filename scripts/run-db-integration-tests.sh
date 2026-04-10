#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
MIGRATIONS_DIR="$ROOT_DIR/database/migrations"
TEST_SQL="$ROOT_DIR/database/tests/emr_core_integration.sql"

if ! command -v psql >/dev/null 2>&1; then
  echo "psql is required to run DB integration tests." >&2
  exit 1
fi

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "DATABASE_URL is required to run DB integration tests." >&2
  exit 1
fi

for migration in \
  "$MIGRATIONS_DIR/0000_organization_clinic_foundation.up.sql" \
  "$MIGRATIONS_DIR/0001_emr_core_foundation.up.sql" \
  "$MIGRATIONS_DIR/0002_add_organization_clinic_foreign_keys.up.sql"
do
  psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$migration"
done

psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$TEST_SQL"

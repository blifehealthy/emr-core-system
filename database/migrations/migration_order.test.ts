import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const migrationsDir = join(process.cwd(), 'database', 'migrations');

test('migration set keeps a single patient clinic foreign key step', () => {
  const filenames = readdirSync(migrationsDir).sort();

  assert.ok(
    filenames.includes('0000_organization_clinic_foundation.up.sql'),
    'expected organization and clinic foundation migration'
  );
  assert.ok(
    filenames.includes('0002_add_organization_clinic_foreign_keys.up.sql'),
    'expected follow-up foreign key migration'
  );
  assert.equal(
    filenames.includes('0003_add_selected_foreign_keys.up.sql'),
    false,
    'did not expect duplicate foreign key migration'
  );
});

test('organization/clinic migrations line up with the patient clinic relationship', () => {
  const organizationFoundation = readFileSync(
    join(migrationsDir, '0000_organization_clinic_foundation.up.sql'),
    'utf8'
  );
  const emrFoundation = readFileSync(
    join(migrationsDir, '0001_emr_core_foundation.up.sql'),
    'utf8'
  );
  const clinicForeignKey = readFileSync(
    join(migrationsDir, '0002_add_organization_clinic_foreign_keys.up.sql'),
    'utf8'
  );

  assert.match(organizationFoundation, /CREATE TABLE clinics \(/);
  assert.match(emrFoundation, /clinic_id UUID NOT NULL/);
  assert.match(clinicForeignKey, /ALTER TABLE patients/);
  assert.match(clinicForeignKey, /REFERENCES clinics \(id\)/);
});

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
  assert.ok(
    filenames.includes('0003_add_diagnoses_and_vital_signs.up.sql'),
    'expected diagnoses and vital signs expansion migration'
  );
  assert.ok(
    filenames.includes('0004_add_audit_logs.up.sql'),
    'expected audit logs migration'
  );
  assert.ok(
    filenames.includes('0005_add_users_and_practitioners.up.sql'),
    'expected users and practitioners migration'
  );
  assert.ok(
    filenames.includes('0006_add_prescriptions.up.sql'),
    'expected prescriptions migration'
  );
  assert.ok(
    filenames.includes('0007_add_appointments.up.sql'),
    'expected appointments migration'
  );
  assert.ok(
    filenames.includes('0008_add_consent_records.up.sql'),
    'expected consent records migration'
  );
  assert.ok(
    filenames.includes('0009_add_file_attachments.up.sql'),
    'expected file attachments migration'
  );
  assert.ok(
    filenames.includes('0010_add_patient_conditions.up.sql'),
    'expected patient conditions migration'
  );
  assert.ok(
    filenames.includes('0011_add_patient_medications.up.sql'),
    'expected patient medications migration'
  );
  assert.ok(
    filenames.includes('0012_add_patient_flags.up.sql'),
    'expected patient flags migration'
  );
  assert.ok(
    filenames.includes('0013_add_clinic_visits.up.sql'),
    'expected clinic visits migration'
  );
  assert.ok(
    filenames.includes('0014_add_clinical_note_templates.up.sql'),
    'expected clinical note templates migration'
  );
  assert.ok(
    filenames.includes('0015_add_clinic_settings.up.sql'),
    'expected clinic settings migration'
  );
  assert.ok(
    filenames.includes('0016_add_clinic_logo_asset.up.sql'),
    'expected clinic logo asset migration'
  );
  assert.ok(
    filenames.includes('0017_add_drug_catalog_and_safety_warnings.up.sql'),
    'expected drug catalog and safety warning migration'
  );
  assert.ok(
    filenames.includes('0018_add_prescription_safety_override.up.sql'),
    'expected prescription safety override migration'
  );
  assert.ok(
    filenames.includes('0019_add_drug_interaction_rules.up.sql'),
    'expected drug interaction rules migration'
  );
  assert.ok(
    filenames.includes('0020_add_user_login_security.up.sql'),
    'expected user login security migration'
  );
  assert.ok(
    filenames.includes('0021_add_user_oidc_subject.up.sql'),
    'expected OIDC subject mapping migration'
  );
  assert.ok(
    filenames.includes('0022_add_billing_foundation.up.sql'),
    'expected billing foundation migration'
  );
  assert.ok(
    filenames.includes('0023_add_billing_refunds_and_charge_templates.up.sql'),
    'expected billing refunds and charge templates migration'
  );
  assert.ok(
    filenames.includes('0024_add_phase_3a_completion_billing.up.sql'),
    'expected Phase 3A completion billing migration'
  );
  assert.ok(
    filenames.includes('0025_add_phase_3b_billing_operations.up.sql'),
    'expected Phase 3B billing operations migration'
  );
  assert.ok(
    filenames.includes('0026_add_phase_3c_pharmacy_inventory.up.sql'),
    'expected Phase 3C pharmacy inventory migration'
  );
  assert.ok(
    filenames.includes('0027_add_phase_3d_inventory_lots.up.sql'),
    'expected Phase 3D inventory lots migration'
  );
  assert.ok(
    filenames.includes('0028_add_phase_3e_procurement.up.sql'),
    'expected Phase 3E procurement migration'
  );
  assert.ok(
    filenames.includes('0029_add_phase_3f_purchase_order_approvals.up.sql'),
    'expected Phase 3F purchase order approvals migration'
  );
  assert.ok(
    filenames.includes('0030_add_phase_3g_multi_approver_routing.up.sql'),
    'expected Phase 3G multi-approver routing migration'
  );
  assert.ok(
    filenames.includes('0031_add_phase_3h_barcode_verification.up.sql'),
    'expected Phase 3H barcode verification migration'
  );
  assert.ok(
    filenames.includes('0032_add_phase_3j_barcode_print_jobs.up.sql'),
    'expected Phase 3J barcode print job migration'
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

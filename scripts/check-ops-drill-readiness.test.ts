import assert from 'node:assert/strict';
import test from 'node:test';

import { checkOpsDrillReadiness } from './check-ops-drill-readiness.ts';

test('ops drill check warns in non-strict mode when evidence is missing', () => {
  const findings = checkOpsDrillReadiness({});

  assert.equal(findings.some((finding) => finding.level === 'error'), false);
  assert.ok(findings.some((finding) => finding.key === 'OPS_BACKUP_RESTORE_DRILL_PASSED'));
  assert.ok(findings.some((finding) => finding.key === 'OPS_MONITORING_OWNER'));
});

test('ops drill check fails strict mode when required evidence is missing', () => {
  const findings = checkOpsDrillReadiness({ OPS_DRILL_STRICT: 'true' });

  assert.ok(findings.some((finding) => finding.level === 'error' && finding.key === 'OPS_API_SMOKE_PASSED'));
  assert.ok(findings.some((finding) => finding.level === 'error' && finding.key === 'OPS_DRILL_COMPLETED_AT'));
});

test('ops drill check passes when required evidence and owners are recorded', () => {
  const findings = checkOpsDrillReadiness({
    OPS_DRILL_STRICT: 'true',
    OPS_READINESS_CHECK_PASSED: 'true',
    OPS_STORAGE_CHECK_PASSED: 'true',
    OPS_API_SMOKE_PASSED: 'true',
    OPS_FRONTEND_SMOKE_PASSED: 'true',
    OPS_BACKUP_RESTORE_DRILL_PASSED: 'true',
    OPS_ROLLBACK_DRILL_PASSED: 'true',
    OPS_SECURITY_INCIDENT_DRILL_PASSED: 'true',
    OPS_MONITORING_OWNER: 'Ops Lead',
    OPS_BACKUP_OWNER: 'Backup Lead',
    OPS_INCIDENT_OWNER: 'Security Lead',
    OPS_DEPLOYMENT_OWNER: 'Release Lead',
    OPS_DRILL_COMPLETED_AT: '2026-05-27',
    OPS_GO_LIVE_WINDOW: '2026-06-01 09:00 ICT',
  });

  assert.deepEqual(findings, []);
});

test('ops drill check rejects invalid completion date', () => {
  const findings = checkOpsDrillReadiness({
    OPS_DRILL_STRICT: 'true',
    OPS_READINESS_CHECK_PASSED: 'true',
    OPS_STORAGE_CHECK_PASSED: 'true',
    OPS_API_SMOKE_PASSED: 'true',
    OPS_FRONTEND_SMOKE_PASSED: 'true',
    OPS_BACKUP_RESTORE_DRILL_PASSED: 'true',
    OPS_ROLLBACK_DRILL_PASSED: 'true',
    OPS_SECURITY_INCIDENT_DRILL_PASSED: 'true',
    OPS_MONITORING_OWNER: 'Ops Lead',
    OPS_BACKUP_OWNER: 'Backup Lead',
    OPS_INCIDENT_OWNER: 'Security Lead',
    OPS_DEPLOYMENT_OWNER: 'Release Lead',
    OPS_DRILL_COMPLETED_AT: '27-05-2026',
  });

  assert.ok(findings.some((finding) => finding.level === 'error' && finding.key === 'OPS_DRILL_COMPLETED_AT'));
});

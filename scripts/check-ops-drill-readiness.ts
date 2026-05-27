import { fileURLToPath } from 'node:url';

export type OpsDrillLevel = 'error' | 'warning';

export type OpsDrillFinding = {
  level: OpsDrillLevel;
  key: string;
  message: string;
};

const requiredEvidence = [
  ['OPS_READINESS_CHECK_PASSED', 'Run PRODUCTION_READINESS_STRICT=true npm run production:check in the target environment.'],
  ['OPS_STORAGE_CHECK_PASSED', 'Run npm run storage:check against the target file storage configuration.'],
  ['OPS_API_SMOKE_PASSED', 'Run npm run api:smoke against a target-like database and API.'],
  ['OPS_FRONTEND_SMOKE_PASSED', 'Run npm run frontend:workflow-smoke before go-live.'],
  ['OPS_BACKUP_RESTORE_DRILL_PASSED', 'Complete and record a database plus file-storage restore drill.'],
  ['OPS_ROLLBACK_DRILL_PASSED', 'Complete and record the deployment rollback drill.'],
  ['OPS_SECURITY_INCIDENT_DRILL_PASSED', 'Complete an identity/security incident tabletop drill.'],
] as const;

const requiredOwners = [
  ['OPS_MONITORING_OWNER', 'Assign an owner for monitoring and alert triage.'],
  ['OPS_BACKUP_OWNER', 'Assign an owner for backup job health and restore evidence.'],
  ['OPS_INCIDENT_OWNER', 'Assign an owner for security and production incidents.'],
  ['OPS_DEPLOYMENT_OWNER', 'Assign an owner for deployment and rollback decisions.'],
] as const;

export function checkOpsDrillReadiness(env: NodeJS.ProcessEnv = process.env) {
  const findings: OpsDrillFinding[] = [];
  const strict = env.OPS_DRILL_STRICT === 'true' || env.PRODUCTION_READINESS_STRICT === 'true';

  for (const [key, message] of requiredEvidence) {
    if (!isTruthy(env[key])) {
      add(findings, strict ? 'error' : 'warning', key, message);
    }
  }

  for (const [key, message] of requiredOwners) {
    if (!env[key]?.trim()) {
      add(findings, strict ? 'error' : 'warning', key, message);
    }
  }

  const completedAt = env.OPS_DRILL_COMPLETED_AT?.trim();
  if (!completedAt) {
    add(findings, strict ? 'error' : 'warning', 'OPS_DRILL_COMPLETED_AT', 'Record the drill completion date in YYYY-MM-DD format.');
  } else if (!/^\d{4}-\d{2}-\d{2}$/.test(completedAt)) {
    add(findings, strict ? 'error' : 'warning', 'OPS_DRILL_COMPLETED_AT', 'OPS_DRILL_COMPLETED_AT must be YYYY-MM-DD.');
  }

  const goLiveWindow = env.OPS_GO_LIVE_WINDOW?.trim();
  if (!goLiveWindow) {
    add(findings, 'warning', 'OPS_GO_LIVE_WINDOW', 'Record the planned go-live window or pilot start window.');
  }

  return findings;
}

function isTruthy(value: string | undefined) {
  return ['true', '1', 'yes', 'passed'].includes((value ?? '').trim().toLowerCase());
}

function add(findings: OpsDrillFinding[], level: OpsDrillLevel, key: string, message: string) {
  findings.push({ level, key, message });
}

function printFindings(findings: OpsDrillFinding[]) {
  if (findings.length === 0) {
    console.log('Ops drill readiness check passed.');
    return;
  }

  for (const finding of findings) {
    console.log(`[${finding.level}] ${finding.key}: ${finding.message}`);
  }

  const errorCount = findings.filter((finding) => finding.level === 'error').length;
  const warningCount = findings.length - errorCount;
  console.log(`Ops drill findings: ${errorCount} error(s), ${warningCount} warning(s).`);
}

const isCli = process.argv[1] === fileURLToPath(import.meta.url);

if (isCli) {
  const findings = checkOpsDrillReadiness(process.env);
  printFindings(findings);
  if (findings.some((finding) => finding.level === 'error')) {
    process.exitCode = 1;
  }
}

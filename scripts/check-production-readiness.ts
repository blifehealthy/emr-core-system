import { fileURLToPath } from 'node:url';

import { createFileAssetStoragePolicy } from '../backend/services/fileAssetStoragePolicy.ts';

export type ReadinessLevel = 'error' | 'warning';

export type ReadinessFinding = {
  level: ReadinessLevel;
  key: string;
  message: string;
};

const WEAK_SECRET_PATTERNS = [
  /^dev/i,
  /dev-token/i,
  /dev-secret/i,
  /change-?me/i,
  /password/i,
  /secret/i,
  /^test/i,
];

export function checkProductionReadiness(env: NodeJS.ProcessEnv = process.env) {
  const findings: ReadinessFinding[] = [];
  const strict = isStrictMode(env);

  checkDeploymentMode(env, findings, strict);
  checkDatabase(env, findings, strict);
  checkApiToken(env, findings, strict);
  checkSessionAuth(env, findings, strict);
  checkOidcAuth(env, findings, strict);
  checkStorage(env, findings, strict);

  return findings;
}

function isStrictMode(env: NodeJS.ProcessEnv) {
  const profile = (env.DEPLOYMENT_PROFILE ?? env.NODE_ENV ?? '').trim().toLowerCase();
  return env.PRODUCTION_READINESS_STRICT === 'true' || ['pilot', 'staging', 'production'].includes(profile);
}

function checkDeploymentMode(
  env: NodeJS.ProcessEnv,
  findings: ReadinessFinding[],
  strict: boolean
) {
  const profile = (env.DEPLOYMENT_PROFILE ?? env.NODE_ENV ?? '').trim();
  if (!profile) {
    add(findings, strict ? 'error' : 'warning', 'DEPLOYMENT_PROFILE', 'Set DEPLOYMENT_PROFILE=pilot or NODE_ENV=production before a pilot deployment.');
  }
}

function checkDatabase(
  env: NodeJS.ProcessEnv,
  findings: ReadinessFinding[],
  strict: boolean
) {
  const databaseUrl = env.DATABASE_URL?.trim();
  if (!databaseUrl) {
    add(findings, strict ? 'error' : 'warning', 'DATABASE_URL', 'DATABASE_URL is required for API startup and smoke checks.');
    return;
  }

  if (/localhost|127\.0\.0\.1/i.test(databaseUrl) && strict) {
    add(findings, 'warning', 'DATABASE_URL', 'DATABASE_URL points to localhost; confirm this is intentional for the target environment.');
  }
}

function checkApiToken(
  env: NodeJS.ProcessEnv,
  findings: ReadinessFinding[],
  strict: boolean
) {
  const apiToken = env.API_TOKEN?.trim();
  if (!apiToken) {
    add(findings, strict ? 'error' : 'warning', 'API_TOKEN', 'Set API_TOKEN so API routes require bearer authentication outside local development.');
    return;
  }

  if (!isStrongSecret(apiToken)) {
    add(findings, strict ? 'error' : 'warning', 'API_TOKEN', 'API_TOKEN must be at least 32 characters and must not use dev/test/change-me style values.');
  }
}

function checkSessionAuth(
  env: NodeJS.ProcessEnv,
  findings: ReadinessFinding[],
  strict: boolean
) {
  const sessionSecret = env.AUTH_SESSION_SECRET?.trim();
  const loginCode = env.AUTH_LOGIN_CODE?.trim();

  if (!sessionSecret) {
    add(findings, strict ? 'error' : 'warning', 'AUTH_SESSION_SECRET', 'Set AUTH_SESSION_SECRET before issuing pilot login sessions.');
  } else if (!isStrongSecret(sessionSecret)) {
    add(findings, strict ? 'error' : 'warning', 'AUTH_SESSION_SECRET', 'AUTH_SESSION_SECRET must be at least 32 characters and must not use dev/test/change-me style values.');
  }

  if (!loginCode) {
    add(findings, strict ? 'error' : 'warning', 'AUTH_LOGIN_CODE', 'Set AUTH_LOGIN_CODE before enabling /api/auth/sessions.');
  } else if (!isStrongSecret(loginCode)) {
    add(findings, strict ? 'error' : 'warning', 'AUTH_LOGIN_CODE', 'AUTH_LOGIN_CODE must be at least 32 characters and rotated after pilot onboarding.');
  }

  const ttl = env.AUTH_SESSION_TTL_MINUTES;
  if (ttl !== undefined) {
    const ttlMinutes = Number(ttl);
    if (!Number.isInteger(ttlMinutes) || ttlMinutes <= 0 || ttlMinutes > 720) {
      add(findings, strict ? 'error' : 'warning', 'AUTH_SESSION_TTL_MINUTES', 'AUTH_SESSION_TTL_MINUTES must be an integer from 1 to 720.');
    }
  }
}

function checkOidcAuth(
  env: NodeJS.ProcessEnv,
  findings: ReadinessFinding[],
  strict: boolean
) {
  const oidcEnabled = env.AUTH_OIDC_ENABLED === 'true';
  const issuer = env.AUTH_OIDC_ISSUER?.trim();
  const audience = env.AUTH_OIDC_AUDIENCE?.trim();
  const hs256Secret = env.AUTH_OIDC_HS256_SECRET?.trim();
  const rs256PublicKeyPem = env.AUTH_OIDC_RS256_PUBLIC_KEY_PEM?.trim();
  const jwksUrl = env.AUTH_OIDC_JWKS_URL?.trim();
  const mfaRequired = env.AUTH_OIDC_MFA_REQUIRED === 'true';
  const mfaClaim = env.AUTH_OIDC_MFA_CLAIM?.trim();
  const mfaValues = env.AUTH_OIDC_MFA_VALUES?.trim();

  if (!oidcEnabled && !issuer && !audience && !hs256Secret && !rs256PublicKeyPem && !jwksUrl) {
    return;
  }

  if (!issuer) {
    add(findings, strict ? 'error' : 'warning', 'AUTH_OIDC_ISSUER', 'Set AUTH_OIDC_ISSUER when OIDC auth is enabled.');
  }

  if (!audience) {
    add(findings, strict ? 'error' : 'warning', 'AUTH_OIDC_AUDIENCE', 'Set AUTH_OIDC_AUDIENCE when OIDC auth is enabled.');
  }

  if (!hs256Secret && !rs256PublicKeyPem && !jwksUrl) {
    add(findings, strict ? 'error' : 'warning', 'AUTH_OIDC_SIGNING_KEY', 'Set AUTH_OIDC_JWKS_URL, AUTH_OIDC_RS256_PUBLIC_KEY_PEM, or AUTH_OIDC_HS256_SECRET for OIDC token verification.');
  }

  if (hs256Secret && !isStrongSecret(hs256Secret)) {
    add(findings, strict ? 'error' : 'warning', 'AUTH_OIDC_HS256_SECRET', 'AUTH_OIDC_HS256_SECRET must be at least 32 characters and must not use dev/test/change-me style values.');
  }

  if (rs256PublicKeyPem && !rs256PublicKeyPem.includes('BEGIN PUBLIC KEY')) {
    add(findings, strict ? 'error' : 'warning', 'AUTH_OIDC_RS256_PUBLIC_KEY_PEM', 'AUTH_OIDC_RS256_PUBLIC_KEY_PEM must contain a PEM public key.');
  }

  if (jwksUrl && !/^https:\/\//i.test(jwksUrl)) {
    add(findings, strict ? 'error' : 'warning', 'AUTH_OIDC_JWKS_URL', 'AUTH_OIDC_JWKS_URL must use HTTPS for pilot and production deployments.');
  }

  const jwksTtl = env.AUTH_OIDC_JWKS_CACHE_TTL_SECONDS;
  if (jwksTtl !== undefined) {
    const ttlSeconds = Number(jwksTtl);
    if (!Number.isInteger(ttlSeconds) || ttlSeconds < 60 || ttlSeconds > 86400) {
      add(findings, strict ? 'error' : 'warning', 'AUTH_OIDC_JWKS_CACHE_TTL_SECONDS', 'AUTH_OIDC_JWKS_CACHE_TTL_SECONDS must be an integer from 60 to 86400.');
    }
  }

  if (mfaRequired && !mfaClaim) {
    add(findings, strict ? 'error' : 'warning', 'AUTH_OIDC_MFA_CLAIM', 'Set AUTH_OIDC_MFA_CLAIM when AUTH_OIDC_MFA_REQUIRED=true.');
  }

  if (mfaRequired && !mfaValues) {
    add(findings, strict ? 'error' : 'warning', 'AUTH_OIDC_MFA_VALUES', 'Set AUTH_OIDC_MFA_VALUES to the provider claim values that prove MFA.');
  }
}

function checkStorage(
  env: NodeJS.ProcessEnv,
  findings: ReadinessFinding[],
  strict: boolean
) {
  try {
    const policy = createFileAssetStoragePolicy(env);

    if (policy.driver === 'local') {
      const storageRoot = policy.storageRoot ?? '';
      if (!env.FILE_STORAGE_DIR?.trim()) {
        add(findings, strict ? 'error' : 'warning', 'FILE_STORAGE_DIR', 'Set FILE_STORAGE_DIR to a persistent private disk path.');
      }
      if (strict && storageRoot.startsWith('/tmp')) {
        add(findings, 'error', 'FILE_STORAGE_DIR', 'FILE_STORAGE_DIR must not use /tmp for pilot or production data.');
      }
    }

    if (policy.maxUploadBytes > 25 * 1024 * 1024) {
      add(findings, 'warning', 'FILE_STORAGE_MAX_BYTES', 'Upload limit is above 25 MiB; confirm this is intentional for clinic network bandwidth and backups.');
    }

    if (policy.allowedMimeTypes.some((mimeType) => mimeType === '*/*' || mimeType.endsWith('/*'))) {
      add(findings, strict ? 'error' : 'warning', 'FILE_STORAGE_ALLOWED_MIME_TYPES', 'Allowed MIME types should be explicit for pilot and production uploads.');
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid file storage configuration.';
    add(findings, 'error', 'FILE_STORAGE_DRIVER', message);
  }
}

function isStrongSecret(secret: string) {
  return secret.length >= 32 && !WEAK_SECRET_PATTERNS.some((pattern) => pattern.test(secret));
}

function add(
  findings: ReadinessFinding[],
  level: ReadinessLevel,
  key: string,
  message: string
) {
  findings.push({ level, key, message });
}

function printFindings(findings: ReadinessFinding[]) {
  if (findings.length === 0) {
    console.log('Production readiness check passed.');
    return;
  }

  for (const finding of findings) {
    console.log(`[${finding.level}] ${finding.key}: ${finding.message}`);
  }

  const errorCount = findings.filter((finding) => finding.level === 'error').length;
  const warningCount = findings.length - errorCount;
  console.log(`Readiness findings: ${errorCount} error(s), ${warningCount} warning(s).`);
}

const isCli = process.argv[1] === fileURLToPath(import.meta.url);

if (isCli) {
  const findings = checkProductionReadiness(process.env);
  printFindings(findings);
  if (findings.some((finding) => finding.level === 'error')) {
    process.exitCode = 1;
  }
}

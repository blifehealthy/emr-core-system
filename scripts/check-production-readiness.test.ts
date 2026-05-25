import assert from 'node:assert/strict';
import test from 'node:test';

import { checkProductionReadiness } from './check-production-readiness.ts';

test('warns instead of failing for incomplete local development config', () => {
  const findings = checkProductionReadiness({});

  assert.equal(findings.some((finding) => finding.level === 'error'), false);
  assert.ok(findings.some((finding) => finding.key === 'DATABASE_URL'));
  assert.ok(findings.some((finding) => finding.key === 'API_TOKEN'));
});

test('fails strict mode when production secrets and storage are unsafe', () => {
  const findings = checkProductionReadiness({
    PRODUCTION_READINESS_STRICT: 'true',
    DATABASE_URL: 'postgres://postgres:postgres@127.0.0.1:5432/emr_core',
    API_TOKEN: 'dev-token',
    FILE_STORAGE_DRIVER: 'local',
    FILE_STORAGE_DIR: '/tmp/emr-core-file-assets',
  });

  assert.ok(findings.some((finding) => finding.level === 'error' && finding.key === 'API_TOKEN'));
  assert.ok(findings.some((finding) => finding.level === 'error' && finding.key === 'FILE_STORAGE_DIR'));
});

test('passes strict mode with persistent storage and strong token', () => {
  const findings = checkProductionReadiness({
    PRODUCTION_READINESS_STRICT: 'true',
    DEPLOYMENT_PROFILE: 'pilot',
    DATABASE_URL: 'postgres://emr:strong-password@db.internal:5432/emr_core',
    API_TOKEN: '0123456789abcdef0123456789abcdef',
    AUTH_SESSION_SECRET: 'abcdef0123456789abcdef0123456789',
    AUTH_LOGIN_CODE: 'fedcba9876543210fedcba9876543210',
    AUTH_SESSION_TTL_MINUTES: '480',
    AUTH_OIDC_ENABLED: 'true',
    AUTH_OIDC_ISSUER: 'https://id.example.test',
    AUTH_OIDC_AUDIENCE: 'emr-core',
    AUTH_OIDC_HS256_SECRET: '1234567890abcdef1234567890abcdef',
    FILE_STORAGE_DRIVER: 'local',
    FILE_STORAGE_DIR: '/var/lib/emr-core/file-assets',
    FILE_STORAGE_MAX_BYTES: '5242880',
    FILE_STORAGE_ALLOWED_MIME_TYPES: 'image/png,image/jpeg,application/pdf',
  });

  assert.deepEqual(findings, []);
});

test('reports invalid S3 storage config', () => {
  const findings = checkProductionReadiness({
    PRODUCTION_READINESS_STRICT: 'true',
    DEPLOYMENT_PROFILE: 'production',
    DATABASE_URL: 'postgres://emr:strong-password@db.internal:5432/emr_core',
    API_TOKEN: '0123456789abcdef0123456789abcdef',
    AUTH_SESSION_SECRET: 'abcdef0123456789abcdef0123456789',
    AUTH_LOGIN_CODE: 'fedcba9876543210fedcba9876543210',
    AUTH_OIDC_ENABLED: 'true',
    AUTH_OIDC_ISSUER: 'https://id.example.test',
    AUTH_OIDC_AUDIENCE: 'emr-core',
    AUTH_OIDC_HS256_SECRET: '1234567890abcdef1234567890abcdef',
    FILE_STORAGE_DRIVER: 's3',
    FILE_STORAGE_S3_BUCKET: 'emr-assets',
  });

  assert.ok(findings.some((finding) => finding.level === 'error' && finding.key === 'FILE_STORAGE_DRIVER'));
});

test('fails strict mode when OIDC is enabled without complete config', () => {
  const findings = checkProductionReadiness({
    PRODUCTION_READINESS_STRICT: 'true',
    DEPLOYMENT_PROFILE: 'production',
    DATABASE_URL: 'postgres://emr:strong-password@db.internal:5432/emr_core',
    API_TOKEN: '0123456789abcdef0123456789abcdef',
    AUTH_SESSION_SECRET: 'abcdef0123456789abcdef0123456789',
    AUTH_LOGIN_CODE: 'fedcba9876543210fedcba9876543210',
    AUTH_OIDC_ENABLED: 'true',
  });

  assert.ok(findings.some((finding) => finding.level === 'error' && finding.key === 'AUTH_OIDC_ISSUER'));
  assert.ok(findings.some((finding) => finding.level === 'error' && finding.key === 'AUTH_OIDC_AUDIENCE'));
  assert.ok(findings.some((finding) => finding.level === 'error' && finding.key === 'AUTH_OIDC_SIGNING_KEY'));
});

test('passes strict mode with RS256 OIDC public key config', () => {
  const findings = checkProductionReadiness({
    PRODUCTION_READINESS_STRICT: 'true',
    DEPLOYMENT_PROFILE: 'production',
    DATABASE_URL: 'postgres://emr:strong-password@db.internal:5432/emr_core',
    API_TOKEN: '0123456789abcdef0123456789abcdef',
    AUTH_SESSION_SECRET: 'abcdef0123456789abcdef0123456789',
    AUTH_LOGIN_CODE: 'fedcba9876543210fedcba9876543210',
    AUTH_OIDC_ENABLED: 'true',
    AUTH_OIDC_ISSUER: 'https://id.example.test',
    AUTH_OIDC_AUDIENCE: 'emr-core',
    AUTH_OIDC_RS256_PUBLIC_KEY_PEM: '-----BEGIN PUBLIC KEY-----\\nabc\\n-----END PUBLIC KEY-----',
    FILE_STORAGE_DRIVER: 'local',
    FILE_STORAGE_DIR: '/var/lib/emr-core/file-assets',
    FILE_STORAGE_MAX_BYTES: '5242880',
    FILE_STORAGE_ALLOWED_MIME_TYPES: 'image/png,image/jpeg,application/pdf',
  });

  assert.deepEqual(findings, []);
});

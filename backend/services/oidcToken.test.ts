import assert from 'node:assert/strict';
import { generateKeyPairSync } from 'node:crypto';
import test from 'node:test';

import { createOidcRs256TestToken, createOidcTestToken, verifyOidcAccessToken } from './oidcToken.ts';

const config = {
  issuer: 'https://id.example.test',
  audience: 'emr-core',
  hs256Secret: '0123456789abcdef0123456789abcdef',
};

test('verifies a valid OIDC-compatible HS256 test token', () => {
  const token = createOidcTestToken(
    {
      iss: config.issuer,
      aud: config.audience,
      sub: 'oidc-user-1',
      exp: Math.floor(Date.now() / 1000) + 60,
    },
    config.hs256Secret
  );

  const result = verifyOidcAccessToken(token, config);
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.subject, 'oidc-user-1');
  }
});

test('rejects invalid issuer, audience, signature, and expired tokens', () => {
  const validPayload = {
    iss: config.issuer,
    aud: config.audience,
    sub: 'oidc-user-1',
    exp: Math.floor(Date.now() / 1000) + 60,
  };

  const wrongIssuer = createOidcTestToken({ ...validPayload, iss: 'https://wrong.example.test' }, config.hs256Secret);
  const wrongAudience = createOidcTestToken({ ...validPayload, aud: 'other-api' }, config.hs256Secret);
  const expired = createOidcTestToken({ ...validPayload, exp: Math.floor(Date.now() / 1000) - 60 }, config.hs256Secret);
  const wrongSignature = createOidcTestToken(validPayload, 'different-secret');

  assert.equal(verifyOidcAccessToken(wrongIssuer, config).ok, false);
  assert.equal(verifyOidcAccessToken(wrongAudience, config).ok, false);
  assert.equal(verifyOidcAccessToken(expired, config).ok, false);
  assert.equal(verifyOidcAccessToken(wrongSignature, config).ok, false);
});

test('verifies a valid RS256 OIDC-compatible test token', () => {
  const { privateKey, publicKey } = generateKeyPairSync('rsa', {
    modulusLength: 2048,
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    publicKeyEncoding: { type: 'spki', format: 'pem' },
  });
  const token = createOidcRs256TestToken(
    {
      iss: config.issuer,
      aud: config.audience,
      sub: 'oidc-rs-user-1',
      exp: Math.floor(Date.now() / 1000) + 60,
    },
    privateKey
  );

  const result = verifyOidcAccessToken(token, {
    issuer: config.issuer,
    audience: config.audience,
    rs256PublicKeyPem: publicKey,
  });

  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.subject, 'oidc-rs-user-1');
  }
});

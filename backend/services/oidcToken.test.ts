import assert from 'node:assert/strict';
import test from 'node:test';

import { createOidcTestToken, verifyOidcAccessToken } from './oidcToken.ts';

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

import assert from 'node:assert/strict';
import { createPublicKey, generateKeyPairSync } from 'node:crypto';
import test from 'node:test';

import { convertJwksToPublicKeyMap, createOidcJwksCache } from './oidcJwks.ts';
import { createOidcRs256TestToken, verifyOidcAccessToken } from './oidcToken.ts';

test('converts RS256 JWKS keys into PEM public keys', () => {
  const { privateKey, publicKey } = generateKeyPairSync('rsa', {
    modulusLength: 2048,
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    publicKeyEncoding: { type: 'spki', format: 'pem' },
  });
  const jwk = createPublicKey(publicKey).export({ format: 'jwk' });
  const keys = convertJwksToPublicKeyMap({
    keys: [{ ...jwk, kid: 'provider-key-1', use: 'sig', alg: 'RS256' }],
  });
  const token = createOidcRs256TestToken(
    {
      iss: 'https://id.example.test',
      aud: 'emr-core',
      sub: 'oidc-jwks-user',
      exp: Math.floor(Date.now() / 1000) + 60,
    },
    privateKey,
    { kid: 'provider-key-1' }
  );

  assert.equal(Object.keys(keys).length, 1);
  assert.equal(
    verifyOidcAccessToken(token, {
      issuer: 'https://id.example.test',
      audience: 'emr-core',
      rs256PublicKeysByKid: keys,
    }).ok,
    true
  );
});

test('OIDC JWKS cache reuses keys until TTL expires', async () => {
  const { publicKey } = generateKeyPairSync('rsa', {
    modulusLength: 2048,
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    publicKeyEncoding: { type: 'spki', format: 'pem' },
  });
  const jwk = createPublicKey(publicKey).export({ format: 'jwk' });
  let now = new Date('2026-05-25T00:00:00.000Z');
  let fetchCount = 0;
  const cache = createOidcJwksCache({
    jwksUrl: 'https://id.example.test/.well-known/jwks.json',
    cacheTtlMs: 1000,
    now: () => now,
    fetchImpl: async () => {
      fetchCount += 1;
      return {
        ok: true,
        status: 200,
        async json() {
          return { keys: [{ ...jwk, kid: `provider-key-${fetchCount}`, use: 'sig', alg: 'RS256' }] };
        },
      } as Response;
    },
  });

  const first = await cache.getPublicKeys();
  const second = await cache.getPublicKeys();
  now = new Date('2026-05-25T00:00:02.000Z');
  const third = await cache.getPublicKeys();

  assert.deepEqual(Object.keys(first.publicKeysByKid), ['provider-key-1']);
  assert.deepEqual(Object.keys(second.publicKeysByKid), ['provider-key-1']);
  assert.deepEqual(Object.keys(third.publicKeysByKid), ['provider-key-2']);
  assert.equal(fetchCount, 2);
});

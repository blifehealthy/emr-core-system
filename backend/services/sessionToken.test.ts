import assert from 'node:assert/strict';
import test from 'node:test';

import { createSessionToken, verifySessionToken } from './sessionToken.ts';

test('creates and verifies a session token', () => {
  const token = createSessionToken(
    {
      userId: 'user-1',
      issuedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 60_000).toISOString(),
    },
    'session-secret'
  );

  const result = verifySessionToken(token, 'session-secret');
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.payload.userId, 'user-1');
  }
});

test('rejects tampered or expired session tokens', () => {
  const token = createSessionToken(
    {
      userId: 'user-1',
      issuedAt: new Date(Date.now() - 120_000).toISOString(),
      expiresAt: new Date(Date.now() - 60_000).toISOString(),
    },
    'session-secret'
  );

  assert.equal(verifySessionToken(token, 'session-secret').ok, false);
  assert.equal(verifySessionToken(`${token}x`, 'session-secret').ok, false);
  assert.equal(verifySessionToken(token, 'different-secret').ok, false);
});

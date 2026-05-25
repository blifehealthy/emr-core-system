import { createHmac, timingSafeEqual } from 'node:crypto';

export type SessionTokenPayload = {
  userId: string;
  issuedAt: string;
  expiresAt: string;
};

const TOKEN_PREFIX = 'emr1';

export function createSessionToken(payload: SessionTokenPayload, secret: string) {
  const encodedPayload = encode(JSON.stringify(payload));
  const signature = sign(encodedPayload, secret);
  return `${TOKEN_PREFIX}.${encodedPayload}.${signature}`;
}

export function verifySessionToken(token: string, secret: string) {
  const [prefix, encodedPayload, signature] = token.split('.');
  if (prefix !== TOKEN_PREFIX || !encodedPayload || !signature) {
    return { ok: false as const, error: 'Invalid session token' };
  }

  const expectedSignature = sign(encodedPayload, secret);
  if (!constantTimeEqual(signature, expectedSignature)) {
    return { ok: false as const, error: 'Invalid session token' };
  }

  let payload: SessionTokenPayload;
  try {
    payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8'));
  } catch {
    return { ok: false as const, error: 'Invalid session token' };
  }

  if (!payload.userId || !payload.issuedAt || !payload.expiresAt) {
    return { ok: false as const, error: 'Invalid session token' };
  }

  if (Number.isNaN(Date.parse(payload.expiresAt)) || Date.parse(payload.expiresAt) <= Date.now()) {
    return { ok: false as const, error: 'Session token expired' };
  }

  return { ok: true as const, payload };
}

function sign(encodedPayload: string, secret: string) {
  return createHmac('sha256', secret).update(encodedPayload).digest('base64url');
}

function encode(value: string) {
  return Buffer.from(value, 'utf8').toString('base64url');
}

function constantTimeEqual(value: string, expected: string) {
  const valueBuffer = Buffer.from(value);
  const expectedBuffer = Buffer.from(expected);
  return valueBuffer.length === expectedBuffer.length && timingSafeEqual(valueBuffer, expectedBuffer);
}

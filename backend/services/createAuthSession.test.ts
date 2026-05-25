import assert from 'node:assert/strict';
import test from 'node:test';

import { createAuthSession, AuthSessionConfigError } from './createAuthSession.ts';

test('creates a session for an active user with a valid login code', async () => {
  const service = createAuthSession(
    {
      async query<T = unknown>(sql: string, params?: unknown[]) {
        assert.match(sql, /FROM users u/);
        assert.deepEqual(params, ['clinic-1', 'doctor.one']);
        return {
          rows: [
            {
              id: 'user-1',
              clinic_id: 'clinic-1',
              username: 'doctor.one',
              display_name: 'Dr One',
              role: 'doctor',
              practitioner_id: 'practitioner-1',
            },
          ] as T[],
        };
      },
    },
    {
      loginCode: 'pilot-code',
      sessionSecret: '0123456789abcdef0123456789abcdef',
      now: () => new Date('2026-05-25T10:00:00.000Z'),
      ttlMinutes: 30,
    }
  );

  const session = await service({
    clinicId: 'clinic-1',
    username: 'doctor.one',
    loginCode: 'pilot-code',
  });

  assert.ok(session);
  assert.equal(session.tokenType, 'Bearer');
  assert.equal(session.expiresAt, '2026-05-25T10:30:00.000Z');
  assert.equal(session.user.id, 'user-1');
  assert.match(session.accessToken, /^emr1\./);
});

test('returns null for invalid login code or unknown user', async () => {
  const service = createAuthSession(
    {
      async query() {
        return { rows: [] };
      },
    },
    {
      loginCode: 'pilot-code',
      sessionSecret: '0123456789abcdef0123456789abcdef',
    }
  );

  assert.equal(
    await service({ clinicId: 'clinic-1', username: 'doctor.one', loginCode: 'wrong' }),
    null
  );
  assert.equal(
    await service({ clinicId: 'clinic-1', username: 'doctor.one', loginCode: 'pilot-code' }),
    null
  );
});

test('fails clearly when auth session config is missing', async () => {
  const service = createAuthSession(
    {
      async query() {
        return { rows: [] };
      },
    },
    {}
  );

  await assert.rejects(
    () => service({ clinicId: 'clinic-1', username: 'doctor.one', loginCode: 'pilot-code' }),
    AuthSessionConfigError
  );
});

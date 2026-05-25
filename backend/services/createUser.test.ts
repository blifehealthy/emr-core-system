import test from 'node:test';
import assert from 'node:assert/strict';

import { createUser } from './createUser.ts';

test('createUser stores optional OIDC subject mapping', async () => {
  const calls: Array<{ sql: string; params?: unknown[] }> = [];
  const service = createUser({
    async query<T>(sql: string, params?: unknown[]) {
      calls.push({ sql, params });
      return {
        rows: [{ id: 'user-1', oidc_subject: 'oidc:user-1' }] as T[],
      };
    },
  });

  const result = await service({
    clinicId: 'clinic-1',
    username: 'doctor.one',
    displayName: 'Dr One',
    role: 'doctor',
    oidcSubject: 'oidc:user-1',
  });

  assert.match(calls[0].sql, /oidc_subject/);
  assert.deepEqual(calls[0].params, [
    'clinic-1',
    'doctor.one',
    'Dr One',
    'doctor',
    'oidc:user-1',
  ]);
  assert.equal((result as { oidc_subject: string }).oidc_subject, 'oidc:user-1');
});

import assert from 'node:assert/strict';
import test from 'node:test';

import { resolveOidcActor } from './resolveOidcActor.ts';

test('resolveOidcActor returns active user by OIDC subject', async () => {
  const service = resolveOidcActor({
    async query<T = unknown>(sql: string, params?: unknown[]) {
      assert.match(sql, /WHERE u\.oidc_subject = \$1/);
      assert.deepEqual(params, ['oidc-user-1']);
      return {
        rows: [
          {
            user_id: 'user-1',
            role: 'doctor',
            practitioner_id: 'practitioner-1',
            clinic_id: 'clinic-1',
            display_name: 'Dr OIDC',
          },
        ] as T[],
      };
    },
  });

  const actor = await service({ oidcSubject: 'oidc-user-1' });

  assert.deepEqual(actor, {
    user_id: 'user-1',
    role: 'doctor',
    practitioner_id: 'practitioner-1',
    clinic_id: 'clinic-1',
    display_name: 'Dr OIDC',
  });
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveActor } from './resolveActor.ts';

test('resolveActor returns role and practitioner context for active user', async () => {
  const calls: Array<{ sql: string; params?: unknown[] }> = [];
  const service = resolveActor({
    async query<T>(sql: string, params?: unknown[]) {
      calls.push({ sql, params });
      return {
        rows: [
          {
            user_id: 'user-1',
            role: 'doctor',
            practitioner_id: 'practitioner-1',
            clinic_id: 'clinic-1',
            display_name: 'Dr Jane',
          },
        ] as T[],
      };
    },
  });

  const result = await service({ userId: 'user-1' });

  assert.match(calls[0].sql, /FROM users u/);
  assert.equal(result?.role, 'doctor');
  assert.equal(result?.practitioner_id, 'practitioner-1');
});

import test from 'node:test';
import assert from 'node:assert/strict';

import { updateUser } from './updateUser.ts';

test('updateUser updates only provided fields by id', async () => {
  const calls: Array<{ sql: string; params?: unknown[] }> = [];
  const service = updateUser({
    async query<T>(sql: string, params?: unknown[]) {
      calls.push({ sql, params });
      return {
        rows: [{ id: 'user-1', display_name: 'Updated User' }] as T[],
      };
    },
  });

  const result = await service({ userId: 'user-1', displayName: 'Updated User' });

  assert.match(calls[0].sql, /UPDATE users/);
  assert.match(calls[0].sql, /display_name = \$2/);
  assert.deepEqual(calls[0].params, ['user-1', 'Updated User']);
  assert.equal((result as { id: string }).id, 'user-1');
});

test('updateUser keeps false boolean patches explicit', async () => {
  const calls: Array<{ sql: string; params?: unknown[] }> = [];
  const service = updateUser({
    async query<T>(sql: string, params?: unknown[]) {
      calls.push({ sql, params });
      return {
        rows: [{ id: 'user-1', is_active: false }] as T[],
      };
    },
  });

  await service({ userId: 'user-1', isActive: false });

  assert.match(calls[0].sql, /is_active = \$2/);
  assert.deepEqual(calls[0].params, ['user-1', false]);
});

import test from 'node:test';
import assert from 'node:assert/strict';

import { listUsers } from './listUsers.ts';

test('listUsers builds search, active filter, pagination, and meta', async () => {
  const calls: Array<{ sql: string; params?: unknown[] }> = [];
  const service = listUsers({
    async query<T>(sql: string, params?: unknown[]) {
      calls.push({ sql, params });
      return {
        rows: [{ id: 'user-1' }, { id: 'user-2' }, { id: 'user-3' }] as T[],
      };
    },
  });

  const result = await service({
    clinicId: 'clinic-1',
    search: 'nurse',
    active: 'active',
    limit: 2,
    offset: 4,
  });

  assert.match(calls[0].sql, /FROM users/);
  assert.match(calls[0].sql, /is_active IS TRUE/);
  assert.match(calls[0].sql, /username ILIKE \$2/);
  assert.match(calls[0].sql, /display_name ILIKE \$2/);
  assert.match(calls[0].sql, /role::text ILIKE \$2/);
  assert.match(calls[0].sql, /oidc_subject/);
  assert.match(calls[0].sql, /last_login_at/);
  assert.match(calls[0].sql, /LIMIT \$3/);
  assert.match(calls[0].sql, /OFFSET \$4/);
  assert.deepEqual(calls[0].params, ['clinic-1', '%nurse%', 3, 4]);
  assert.deepEqual(result, {
    rows: [{ id: 'user-1' }, { id: 'user-2' }],
    meta: { limit: 2, offset: 4, hasMore: true, nextOffset: 6 },
  });
});

test('listUsers defaults to unfiltered active state and first page', async () => {
  const calls: Array<{ sql: string; params?: unknown[] }> = [];
  const service = listUsers({
    async query<T>(sql: string, params?: unknown[]) {
      calls.push({ sql, params });
      return { rows: [{ id: 'user-1' }] as T[] };
    },
  });

  const result = await service({ clinicId: 'clinic-1' });

  assert.doesNotMatch(calls[0].sql, /is_active IS/);
  assert.deepEqual(calls[0].params, ['clinic-1', 51, 0]);
  assert.deepEqual(result.meta, {
    limit: 50,
    offset: 0,
    hasMore: false,
    nextOffset: null,
  });
});

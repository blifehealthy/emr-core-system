import test from 'node:test';
import assert from 'node:assert/strict';

import { listPractitioners } from './listPractitioners.ts';

test('listPractitioners builds search, inactive filter, pagination, and meta', async () => {
  const calls: Array<{ sql: string; params?: unknown[] }> = [];
  const service = listPractitioners({
    async query<T>(sql: string, params?: unknown[]) {
      calls.push({ sql, params });
      return {
        rows: [
          { id: 'practitioner-1' },
          { id: 'practitioner-2' },
          { id: 'practitioner-3' },
        ] as T[],
      };
    },
  });

  const result = await service({
    clinicId: 'clinic-1',
    search: 'primary',
    active: 'inactive',
    limit: 2,
    offset: 6,
  });

  assert.match(calls[0].sql, /FROM practitioners/);
  assert.match(calls[0].sql, /is_active IS FALSE/);
  assert.match(calls[0].sql, /practitioner_code ILIKE \$2/);
  assert.match(calls[0].sql, /first_name ILIKE \$2/);
  assert.match(calls[0].sql, /last_name ILIKE \$2/);
  assert.match(calls[0].sql, /COALESCE\(license_number, ''\) ILIKE \$2/);
  assert.match(calls[0].sql, /COALESCE\(specialty, ''\) ILIKE \$2/);
  assert.match(calls[0].sql, /LIMIT \$3/);
  assert.match(calls[0].sql, /OFFSET \$4/);
  assert.deepEqual(calls[0].params, ['clinic-1', '%primary%', 3, 6]);
  assert.deepEqual(result, {
    rows: [{ id: 'practitioner-1' }, { id: 'practitioner-2' }],
    meta: { limit: 2, offset: 6, hasMore: true, nextOffset: 8 },
  });
});

test('listPractitioners defaults to unfiltered active state and first page', async () => {
  const calls: Array<{ sql: string; params?: unknown[] }> = [];
  const service = listPractitioners({
    async query<T>(sql: string, params?: unknown[]) {
      calls.push({ sql, params });
      return { rows: [{ id: 'practitioner-1' }] as T[] };
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

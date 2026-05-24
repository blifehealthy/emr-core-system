import test from 'node:test';
import assert from 'node:assert/strict';
import { listFileAssets } from './listFileAssets.ts';

test('listFileAssets builds searchable paginated query', async () => {
  const calls: Array<{ sql: string; params?: unknown[] }> = [];
  const service = listFileAssets({
    async query<T>(sql: string, params?: unknown[]) {
      calls.push({ sql, params });
      return {
        rows: [
          { id: 'file-1' },
          { id: 'file-2' },
          { id: 'file-3' },
        ],
      } as { rows: T[] };
    },
  });

  const result = await service({ clinicId: 'clinic-1', search: 'logo', limit: 2, offset: 4 });

  assert.match(calls[0].sql, /FROM file_assets/);
  assert.match(calls[0].sql, /original_filename ILIKE/);
  assert.match(calls[0].sql, /LIMIT \$3/);
  assert.match(calls[0].sql, /OFFSET \$4/);
  assert.deepEqual(calls[0].params, ['clinic-1', '%logo%', 3, 4]);
  assert.deepEqual(result, {
    rows: [{ id: 'file-1' }, { id: 'file-2' }],
    meta: { limit: 2, offset: 4, hasMore: true, nextOffset: 6 },
  });
});

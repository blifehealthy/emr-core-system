import test from 'node:test';
import assert from 'node:assert/strict';

import { getFileAssetById } from './getFileAssetById.ts';

test('getFileAssetById reads an active file asset by id', async () => {
  const calls: Array<{ sql: string; params?: unknown[] }> = [];
  const service = getFileAssetById({
    async query<T>(sql: string, params?: unknown[]) {
      calls.push({ sql, params });
      return { rows: [{ id: 'file-1', original_filename: 'lab-result.pdf' }] as T[] };
    },
  });

  const result = await service({ fileAssetId: 'file-1' });

  assert.match(calls[0].sql, /FROM file_assets/);
  assert.deepEqual(calls[0].params, ['file-1']);
  assert.equal((result as { id: string }).id, 'file-1');
});

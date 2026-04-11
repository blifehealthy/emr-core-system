import test from 'node:test';
import assert from 'node:assert/strict';

import { createFileAsset } from './createFileAsset.ts';

test('createFileAsset inserts a new file asset row', async () => {
  const calls: Array<{ sql: string; params?: unknown[] }> = [];
  const service = createFileAsset({
    async query<T>(sql: string, params?: unknown[]) {
      calls.push({ sql, params });
      return { rows: [{ id: 'file-1', storage_key: 'uploads/file-1.pdf' }] as T[] };
    },
  });

  const result = await service({
    clinicId: 'clinic-1',
    storageKey: 'uploads/file-1.pdf',
    originalFilename: 'lab-result.pdf',
    mimeType: 'application/pdf',
    byteSize: 1024,
    checksumSha256: 'abc123',
    uploadedByUserId: 'user-1',
  });

  assert.match(calls[0].sql, /INSERT INTO file_assets/);
  assert.deepEqual(calls[0].params, [
    'clinic-1',
    'uploads/file-1.pdf',
    'lab-result.pdf',
    'application/pdf',
    1024,
    'abc123',
    'user-1',
  ]);
  assert.equal((result as { id: string }).id, 'file-1');
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

import {
  createDownloadFileAssetContentService,
  createUploadFileAssetService,
} from './fileAssetStorage.ts';

test('file asset upload stores bytes and metadata', async () => {
  const storageRoot = await mkdtemp(join(tmpdir(), 'emr-assets-'));
  const calls: Array<{ sql: string; params?: unknown[] }> = [];
  const db = {
    async query<T>(sql: string, params?: unknown[]) {
      calls.push({ sql, params });
      return {
        rows: [
          {
            id: 'file-1',
            storage_key: 'logos/logo.png',
            mime_type: 'image/png',
          },
        ],
      } as { rows: T[] };
    },
  };

  try {
    const upload = createUploadFileAssetService(db, storageRoot);
    const download = createDownloadFileAssetContentService(db, storageRoot);
    const contentBase64 = Buffer.from('logo-bytes').toString('base64');

    const asset = await upload({
      clinicId: 'clinic-1',
      storageKey: 'logos/logo.png',
      originalFilename: 'logo.png',
      mimeType: 'image/png',
      byteSize: 0,
      contentBase64,
    });
    const downloaded = await download({ fileAssetId: 'file-1' });

    assert.equal((asset as { id: string }).id, 'file-1');
    assert.equal(downloaded?.content.toString('utf8'), 'logo-bytes');
    assert.equal(downloaded?.mimeType, 'image/png');
    assert.equal(calls[0].params?.[4], 10);
    assert.match(String(calls[0].params?.[5]), /^[a-f0-9]{64}$/);
  } finally {
    await rm(storageRoot, { recursive: true, force: true });
  }
});

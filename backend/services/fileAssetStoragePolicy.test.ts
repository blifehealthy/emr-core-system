import test from 'node:test';
import assert from 'node:assert/strict';

import { createFileAssetStoragePolicy } from './fileAssetStoragePolicy.ts';

test('createFileAssetStoragePolicy reads local storage env settings', () => {
  const policy = createFileAssetStoragePolicy({
    FILE_STORAGE_DIR: '/data/assets',
    FILE_STORAGE_MAX_BYTES: '1024',
    FILE_STORAGE_ALLOWED_MIME_TYPES: 'image/png, application/pdf',
  });

  assert.deepEqual(policy, {
    driver: 'local',
    storageRoot: '/data/assets',
    maxUploadBytes: 1024,
    allowedMimeTypes: ['image/png', 'application/pdf'],
  });
});

test('createFileAssetStoragePolicy rejects unsupported drivers and bad limits', () => {
  assert.throws(
    () => createFileAssetStoragePolicy({ FILE_STORAGE_DRIVER: 's3' }),
    /FILE_STORAGE_DRIVER must be local/
  );
  assert.throws(
    () => createFileAssetStoragePolicy({ FILE_STORAGE_MAX_BYTES: '0' }),
    /FILE_STORAGE_MAX_BYTES must be a positive integer/
  );
});

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
    /FILE_STORAGE_S3_ENDPOINT is required/
  );
  assert.throws(
    () => createFileAssetStoragePolicy({ FILE_STORAGE_DRIVER: 'ftp' }),
    /FILE_STORAGE_DRIVER must be local or s3/
  );
  assert.throws(
    () => createFileAssetStoragePolicy({ FILE_STORAGE_MAX_BYTES: '0' }),
    /FILE_STORAGE_MAX_BYTES must be a positive integer/
  );
});

test('createFileAssetStoragePolicy reads S3-compatible storage settings', () => {
  const policy = createFileAssetStoragePolicy({
    FILE_STORAGE_DRIVER: 's3',
    FILE_STORAGE_S3_ENDPOINT: 'http://127.0.0.1:9000',
    FILE_STORAGE_S3_BUCKET: 'emr-assets',
    FILE_STORAGE_S3_REGION: 'ap-southeast-1',
    FILE_STORAGE_S3_ACCESS_KEY_ID: 'access',
    FILE_STORAGE_S3_SECRET_ACCESS_KEY: 'secret',
    FILE_STORAGE_S3_FORCE_PATH_STYLE: 'false',
  });

  assert.equal(policy.driver, 's3');
  assert.deepEqual(policy.s3, {
    endpoint: 'http://127.0.0.1:9000',
    bucket: 'emr-assets',
    region: 'ap-southeast-1',
    accessKeyId: 'access',
    secretAccessKey: 'secret',
    forcePathStyle: false,
  });
});

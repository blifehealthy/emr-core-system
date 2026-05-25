import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';

import { createFileAsset } from './createFileAsset.ts';
import type { FileAssetStoragePolicy } from './fileAssetStoragePolicy.ts';
import { getFileAssetById } from './getFileAssetById.ts';

type Db = {
  query: <T = unknown>(sql: string, params?: unknown[]) => Promise<{ rows: T[] }>;
};

type StoragePolicyInput = string | FileAssetStoragePolicy;

export function createUploadFileAssetService(db: Db, storagePolicy: StoragePolicyInput) {
  const policy = normalizeStoragePolicy(storagePolicy);
  const createMetadata = createFileAsset(db);

  return async function upload(input: {
    clinicId: string;
    storageKey: string;
    originalFilename: string;
    mimeType?: string | null;
    byteSize: number;
    checksumSha256?: string | null;
    uploadedByUserId?: string | null;
    contentBase64: string;
  }) {
    validateStorageKey(input.storageKey);
    validateMimeType(policy, input.mimeType);
    validateBase64(input.contentBase64);

    const content = Buffer.from(input.contentBase64, 'base64');
    if (content.length > policy.maxUploadBytes) {
      throw new Error(`file exceeds max upload size of ${policy.maxUploadBytes} bytes`);
    }

    const checksumSha256 = input.checksumSha256 ?? createHash('sha256').update(content).digest('hex');
    await writeStoredFile(policy.storageRoot, input.storageKey, content);

    return createMetadata({
      clinicId: input.clinicId,
      storageKey: input.storageKey,
      originalFilename: input.originalFilename,
      mimeType: input.mimeType,
      byteSize: content.length,
      checksumSha256,
      uploadedByUserId: input.uploadedByUserId,
    });
  };
}

export function createDownloadFileAssetContentService(db: Db, storagePolicy: StoragePolicyInput) {
  const policy = normalizeStoragePolicy(storagePolicy);
  const getMetadata = getFileAssetById(db);

  return async function download(input: { fileAssetId?: string; storageKey?: string }) {
    const metadata = input.fileAssetId ? await getMetadata({ fileAssetId: input.fileAssetId }) : null;
    const row = metadata as { storage_key?: string; mime_type?: string | null } | null;
    const storageKey = input.storageKey ?? row?.storage_key;
    if (!storageKey) return null;
    validateStorageKey(storageKey);

    try {
      const content = await readStoredFile(policy.storageRoot, storageKey);
      return { content, mimeType: row?.mime_type ?? null };
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null;
      throw error;
    }
  };
}

async function writeStoredFile(storageRoot: string, storageKey: string, content: Buffer) {
  const filepath = safeStoragePath(storageRoot, storageKey);
  await mkdir(dirname(filepath), { recursive: true });
  await writeFile(filepath, content);
}

async function readStoredFile(storageRoot: string, storageKey: string) {
  return readFile(safeStoragePath(storageRoot, storageKey));
}

function safeStoragePath(storageRoot: string, storageKey: string) {
  const root = resolve(storageRoot);
  const filepath = resolve(join(root, storageKey));
  if (!filepath.startsWith(`${root}/`) && filepath !== root) {
    throw new Error('storageKey must stay inside storage root');
  }
  return filepath;
}

function normalizeStoragePolicy(storagePolicy: StoragePolicyInput): FileAssetStoragePolicy {
  if (typeof storagePolicy !== 'string') return storagePolicy;

  return {
    driver: 'local',
    storageRoot: storagePolicy,
    maxUploadBytes: 5 * 1024 * 1024,
    allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp', 'application/pdf'],
  };
}

function validateStorageKey(storageKey: string) {
  if (storageKey.startsWith('/') || storageKey.includes('..') || storageKey.includes('\\')) {
    throw new Error('storageKey must be a relative path inside storage root');
  }
}

function validateMimeType(policy: FileAssetStoragePolicy, mimeType?: string | null) {
  if (!mimeType) return;
  if (!policy.allowedMimeTypes.includes(mimeType)) {
    throw new Error(`mimeType ${mimeType} is not allowed`);
  }
}

function validateBase64(contentBase64: string) {
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(contentBase64) || contentBase64.length % 4 !== 0) {
    throw new Error('contentBase64 must be valid base64');
  }
}

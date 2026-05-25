import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';

import { createFileAsset } from './createFileAsset.ts';
import { getFileAssetById } from './getFileAssetById.ts';

type Db = {
  query: <T = unknown>(sql: string, params?: unknown[]) => Promise<{ rows: T[] }>;
};

export function createUploadFileAssetService(db: Db, storageRoot: string) {
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
    const content = Buffer.from(input.contentBase64, 'base64');
    if (content.length === 0 && input.contentBase64.length > 0) {
      throw new Error('contentBase64 must be valid base64');
    }

    const checksumSha256 = input.checksumSha256 ?? createHash('sha256').update(content).digest('hex');
    await writeStoredFile(storageRoot, input.storageKey, content);

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

export function createDownloadFileAssetContentService(db: Db, storageRoot: string) {
  const getMetadata = getFileAssetById(db);

  return async function download(input: { fileAssetId?: string; storageKey?: string }) {
    const metadata = input.fileAssetId ? await getMetadata({ fileAssetId: input.fileAssetId }) : null;
    const row = metadata as { storage_key?: string; mime_type?: string | null } | null;
    const storageKey = input.storageKey ?? row?.storage_key;
    if (!storageKey) return null;

    try {
      const content = await readStoredFile(storageRoot, storageKey);
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

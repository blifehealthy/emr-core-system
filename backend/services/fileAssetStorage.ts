import { createHash, createHmac } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';

import { createFileAsset } from './createFileAsset.ts';
import type { FileAssetStoragePolicy } from './fileAssetStoragePolicy.ts';
import { getFileAssetById } from './getFileAssetById.ts';

type Db = {
  query: <T = unknown>(sql: string, params?: unknown[]) => Promise<{ rows: T[] }>;
};

type StoragePolicyInput = string | FileAssetStoragePolicy;
type StorageAdapter = {
  put: (storageKey: string, content: Buffer, mimeType?: string | null) => Promise<void>;
  get: (storageKey: string) => Promise<Buffer | null>;
};

export function createUploadFileAssetService(db: Db, storagePolicy: StoragePolicyInput) {
  const policy = normalizeStoragePolicy(storagePolicy);
  const storage = createStorageAdapter(policy);
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
    await storage.put(input.storageKey, content, input.mimeType);

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
  const storage = createStorageAdapter(policy);
  const getMetadata = getFileAssetById(db);

  return async function download(input: { fileAssetId?: string; storageKey?: string }) {
    const metadata = input.fileAssetId ? await getMetadata({ fileAssetId: input.fileAssetId }) : null;
    const row = metadata as { storage_key?: string; mime_type?: string | null } | null;
    const storageKey = input.storageKey ?? row?.storage_key;
    if (!storageKey) return null;
    validateStorageKey(storageKey);

    try {
      const content = await storage.get(storageKey);
      if (!content) return null;
      return { content, mimeType: row?.mime_type ?? null };
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null;
      throw error;
    }
  };
}

export function createStorageAdapter(policy: FileAssetStoragePolicy): StorageAdapter {
  if (policy.driver === 's3') return createS3StorageAdapter(policy);
  if (!policy.storageRoot) throw new Error('storageRoot is required for local file storage');

  return {
    async put(storageKey, content) {
      await writeStoredFile(policy.storageRoot!, storageKey, content);
    },
    async get(storageKey) {
      try {
        return await readStoredFile(policy.storageRoot!, storageKey);
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null;
        throw error;
      }
    },
  };
}

function createS3StorageAdapter(policy: FileAssetStoragePolicy): StorageAdapter {
  if (!policy.s3) throw new Error('s3 policy is required for S3 file storage');
  const s3 = policy.s3;

  return {
    async put(storageKey, content, mimeType) {
      const url = buildS3ObjectUrl(s3, storageKey);
      const headers = signS3Request({
        method: 'PUT',
        url,
        body: content,
        region: s3.region,
        accessKeyId: s3.accessKeyId,
        secretAccessKey: s3.secretAccessKey,
        extraHeaders: {
          'content-type': mimeType || 'application/octet-stream',
        },
      });
      const response = await fetch(url, { method: 'PUT', headers, body: new Uint8Array(content) });
      if (!response.ok) throw new Error(`S3 upload failed with HTTP ${response.status}`);
    },
    async get(storageKey) {
      const url = buildS3ObjectUrl(s3, storageKey);
      const headers = signS3Request({
        method: 'GET',
        url,
        region: s3.region,
        accessKeyId: s3.accessKeyId,
        secretAccessKey: s3.secretAccessKey,
      });
      const response = await fetch(url, { method: 'GET', headers });
      if (response.status === 404) return null;
      if (!response.ok) throw new Error(`S3 download failed with HTTP ${response.status}`);
      return Buffer.from(await response.arrayBuffer());
    },
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

function buildS3ObjectUrl(s3: NonNullable<FileAssetStoragePolicy['s3']>, storageKey: string) {
  const endpoint = new URL(s3.endpoint);
  const encodedKey = storageKey.split('/').map(encodeURIComponent).join('/');

  if (s3.forcePathStyle) {
    endpoint.pathname = `${endpoint.pathname.replace(/\/$/, '')}/${encodeURIComponent(s3.bucket)}/${encodedKey}`;
    return endpoint;
  }

  endpoint.hostname = `${s3.bucket}.${endpoint.hostname}`;
  endpoint.pathname = `${endpoint.pathname.replace(/\/$/, '')}/${encodedKey}`;
  return endpoint;
}

function signS3Request(input: {
  method: string;
  url: URL;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  body?: Buffer;
  extraHeaders?: Record<string, string>;
}) {
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
  const dateStamp = amzDate.slice(0, 8);
  const payloadHash = createHash('sha256').update(input.body ?? '').digest('hex');
  const headers = {
    host: input.url.host,
    'x-amz-content-sha256': payloadHash,
    'x-amz-date': amzDate,
    ...(input.extraHeaders ?? {}),
  };
  const sortedHeaderNames = Object.keys(headers).sort();
  const canonicalHeaders = sortedHeaderNames
    .map((name) => `${name}:${headers[name as keyof typeof headers]}\n`)
    .join('');
  const signedHeaders = sortedHeaderNames.join(';');
  const canonicalRequest = [
    input.method,
    input.url.pathname,
    input.url.searchParams.toString(),
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join('\n');
  const credentialScope = `${dateStamp}/${input.region}/s3/aws4_request`;
  const stringToSign = [
    'AWS4-HMAC-SHA256',
    amzDate,
    credentialScope,
    createHash('sha256').update(canonicalRequest).digest('hex'),
  ].join('\n');
  const signingKey = hmac(
    hmac(hmac(hmac(`AWS4${input.secretAccessKey}`, dateStamp), input.region), 's3'),
    'aws4_request'
  );
  const signature = createHmac('sha256', signingKey).update(stringToSign).digest('hex');

  return {
    ...headers,
    authorization:
      `AWS4-HMAC-SHA256 Credential=${input.accessKeyId}/${credentialScope}, ` +
      `SignedHeaders=${signedHeaders}, Signature=${signature}`,
  };
}

function hmac(key: string | Buffer, value: string) {
  return createHmac('sha256', key).update(value).digest();
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

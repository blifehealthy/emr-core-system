export type FileAssetStoragePolicy = {
  driver: 'local' | 's3';
  storageRoot?: string;
  s3?: {
    endpoint: string;
    bucket: string;
    region: string;
    accessKeyId: string;
    secretAccessKey: string;
    forcePathStyle: boolean;
  };
  maxUploadBytes: number;
  allowedMimeTypes: string[];
};

export function createFileAssetStoragePolicy(env: NodeJS.ProcessEnv): FileAssetStoragePolicy {
  const driver = env.FILE_STORAGE_DRIVER ?? 'local';
  if (driver !== 'local' && driver !== 's3') {
    throw new Error('FILE_STORAGE_DRIVER must be local or s3');
  }

  const maxUploadBytes = Number(env.FILE_STORAGE_MAX_BYTES ?? 5 * 1024 * 1024);
  if (!Number.isInteger(maxUploadBytes) || maxUploadBytes <= 0) {
    throw new Error('FILE_STORAGE_MAX_BYTES must be a positive integer');
  }

  return {
    driver,
    ...(driver === 'local'
      ? { storageRoot: env.FILE_STORAGE_DIR ?? '/tmp/emr-core-file-assets' }
      : { s3: readS3Policy(env) }),
    maxUploadBytes,
    allowedMimeTypes: parseAllowedMimeTypes(env.FILE_STORAGE_ALLOWED_MIME_TYPES),
  };
}

function readS3Policy(env: NodeJS.ProcessEnv) {
  const endpoint = readRequiredEnv(env, 'FILE_STORAGE_S3_ENDPOINT');
  const bucket = readRequiredEnv(env, 'FILE_STORAGE_S3_BUCKET');
  const region = env.FILE_STORAGE_S3_REGION ?? 'us-east-1';
  const accessKeyId = readRequiredEnv(env, 'FILE_STORAGE_S3_ACCESS_KEY_ID');
  const secretAccessKey = readRequiredEnv(env, 'FILE_STORAGE_S3_SECRET_ACCESS_KEY');

  return {
    endpoint,
    bucket,
    region,
    accessKeyId,
    secretAccessKey,
    forcePathStyle: env.FILE_STORAGE_S3_FORCE_PATH_STYLE !== 'false',
  };
}

function readRequiredEnv(env: NodeJS.ProcessEnv, key: string) {
  const value = env[key]?.trim();
  if (!value) throw new Error(`${key} is required when FILE_STORAGE_DRIVER=s3`);
  return value;
}

function parseAllowedMimeTypes(rawValue: string | undefined) {
  if (!rawValue) return ['image/png', 'image/jpeg', 'image/webp', 'application/pdf'];

  const values = rawValue
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);

  if (values.length === 0) {
    throw new Error('FILE_STORAGE_ALLOWED_MIME_TYPES must include at least one MIME type');
  }

  return values;
}

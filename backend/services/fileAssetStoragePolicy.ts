export type FileAssetStoragePolicy = {
  driver: 'local';
  storageRoot: string;
  maxUploadBytes: number;
  allowedMimeTypes: string[];
};

export function createFileAssetStoragePolicy(env: NodeJS.ProcessEnv): FileAssetStoragePolicy {
  const driver = env.FILE_STORAGE_DRIVER ?? 'local';
  if (driver !== 'local') {
    throw new Error('FILE_STORAGE_DRIVER must be local');
  }

  const maxUploadBytes = Number(env.FILE_STORAGE_MAX_BYTES ?? 5 * 1024 * 1024);
  if (!Number.isInteger(maxUploadBytes) || maxUploadBytes <= 0) {
    throw new Error('FILE_STORAGE_MAX_BYTES must be a positive integer');
  }

  return {
    driver,
    storageRoot: env.FILE_STORAGE_DIR ?? '/tmp/emr-core-file-assets',
    maxUploadBytes,
    allowedMimeTypes: parseAllowedMimeTypes(env.FILE_STORAGE_ALLOWED_MIME_TYPES),
  };
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

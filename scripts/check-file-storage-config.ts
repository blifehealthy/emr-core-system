import { createFileAssetStoragePolicy } from '../backend/services/fileAssetStoragePolicy.ts';

try {
  const policy = createFileAssetStoragePolicy(process.env);
  const output = {
    driver: policy.driver,
    maxUploadBytes: policy.maxUploadBytes,
    allowedMimeTypes: policy.allowedMimeTypes,
    ...(policy.driver === 'local'
      ? { storageRoot: policy.storageRoot }
      : {
          s3: {
            endpoint: policy.s3?.endpoint,
            bucket: policy.s3?.bucket,
            region: policy.s3?.region,
            forcePathStyle: policy.s3?.forcePathStyle,
            accessKeyId: redact(policy.s3?.accessKeyId),
            secretAccessKey: redact(policy.s3?.secretAccessKey),
          },
        }),
  };

  console.log(JSON.stringify(output, null, 2));
} catch (error) {
  const message = error instanceof Error ? error.message : 'Invalid file storage config';
  console.error(message);
  process.exitCode = 1;
}

function redact(value: string | undefined) {
  if (!value) return undefined;
  if (value.length <= 4) return '****';
  return `${value.slice(0, 2)}****${value.slice(-2)}`;
}

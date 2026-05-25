# Object Storage Runbook

This runbook covers file asset storage for uploads such as clinic logos and future document attachments.

## Supported Drivers

### Local Disk

Use local storage for development or single-node testing.

Required settings:

```bash
FILE_STORAGE_DRIVER=local
FILE_STORAGE_DIR=/var/lib/emr-core/file-assets
FILE_STORAGE_MAX_BYTES=5242880
FILE_STORAGE_ALLOWED_MIME_TYPES=image/png,image/jpeg,image/webp,application/pdf
```

Operational notes:

- Mount `FILE_STORAGE_DIR` on persistent disk.
- Back up `FILE_STORAGE_DIR` together with the database snapshot.
- Keep the directory private to the API process.
- Do not share local driver storage across multiple API nodes.

### S3 Or MinIO

Use S3-compatible storage for production or multi-node deployments.

Required settings:

```bash
FILE_STORAGE_DRIVER=s3
FILE_STORAGE_S3_ENDPOINT=https://s3.example.internal
FILE_STORAGE_S3_BUCKET=emr-core-file-assets
FILE_STORAGE_S3_REGION=us-east-1
FILE_STORAGE_S3_ACCESS_KEY_ID=change-me
FILE_STORAGE_S3_SECRET_ACCESS_KEY=change-me
FILE_STORAGE_S3_FORCE_PATH_STYLE=true
FILE_STORAGE_MAX_BYTES=5242880
FILE_STORAGE_ALLOWED_MIME_TYPES=image/png,image/jpeg,image/webp,application/pdf
```

Operational notes:

- Use a private bucket.
- Disable public anonymous reads.
- Grant only object read/write/delete permissions needed by this API.
- Enable server-side encryption if the provider supports it.
- Enable bucket versioning when available.
- Prefer path-style URLs for MinIO unless the deployment is explicitly configured for virtual-hosted buckets.

## Pre-Deploy Check

Run the config check before starting the API:

```bash
npm run storage:check
```

Expected output includes:

- selected driver
- max upload size
- allowed MIME types
- local storage directory or S3 endpoint/bucket with credentials redacted

## Backup And Restore

Database rows in `file_assets` store metadata. The file bytes live in the configured storage driver.

Backup local driver:

```bash
tar -czf emr-file-assets-$(date +%Y%m%d).tgz -C /var/lib/emr-core file-assets
```

Restore local driver:

```bash
mkdir -p /var/lib/emr-core
tar -xzf emr-file-assets-YYYYMMDD.tgz -C /var/lib/emr-core
```

Backup S3/MinIO:

- Enable provider-native versioning and lifecycle backup where possible.
- Mirror the bucket to a second bucket or offline archive on the same schedule as database backups.
- Test restore into a non-production bucket before a release.

Restore S3/MinIO:

- Restore objects before pointing the API at the bucket.
- Confirm a sample object from `file_assets.storage_key` exists in the bucket.
- Start API and download a sample through `GET /api/file-assets/:id/download`.

## Retention Policy

Recommended baseline:

- Keep active file assets indefinitely while referenced by patient, encounter, consent, note, or clinic settings records.
- Keep deleted/unlinked file bytes for 30 days before hard deletion.
- Keep daily object-storage backups for 30 days.
- Keep monthly archives for at least 12 months, subject to clinic policy.

Before hard deletion:

- Confirm `deleted_at IS NOT NULL` or no active business record references the asset.
- Confirm the object exists in at least one backup snapshot.
- Write an audit log entry for the deletion workflow when that workflow is implemented.

## Credential Rotation

1. Create a new access key with the same bucket policy.
2. Deploy API with the new key.
3. Run an upload/download smoke against a non-clinical test asset.
4. Disable the old key.
5. Remove the old key from secret storage.

## Incident Checklist

If uploads fail:

- Run `npm run storage:check`.
- Check `FILE_STORAGE_MAX_BYTES` and `FILE_STORAGE_ALLOWED_MIME_TYPES`.
- Confirm the bucket or local directory is writable by the API process.
- Confirm S3 endpoint, region, force-path-style, and credentials.

If downloads fail:

- Confirm `file_assets.storage_key` exists in the configured storage backend.
- Confirm the API has read permission.
- Check whether the object was manually removed or expired by lifecycle policy.

If a credential is exposed:

- Rotate credentials immediately.
- Review object access logs.
- Restore from a known-good snapshot if tampering is suspected.

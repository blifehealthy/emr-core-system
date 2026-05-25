DROP INDEX IF EXISTS uq_users_oidc_subject_active;

ALTER TABLE users
DROP COLUMN IF EXISTS oidc_subject;

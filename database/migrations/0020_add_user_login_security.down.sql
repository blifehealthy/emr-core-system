DROP INDEX IF EXISTS idx_users_locked_until;

ALTER TABLE users
DROP CONSTRAINT IF EXISTS chk_users_failed_login_count_nonnegative,
DROP COLUMN IF EXISTS locked_until,
DROP COLUMN IF EXISTS failed_login_count,
DROP COLUMN IF EXISTS last_login_at;

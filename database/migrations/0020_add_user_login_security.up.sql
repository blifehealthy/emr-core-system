ALTER TABLE users
ADD COLUMN last_login_at TIMESTAMPTZ,
ADD COLUMN failed_login_count INTEGER NOT NULL DEFAULT 0,
ADD COLUMN locked_until TIMESTAMPTZ,
ADD CONSTRAINT chk_users_failed_login_count_nonnegative
  CHECK (failed_login_count >= 0);

CREATE INDEX idx_users_locked_until
    ON users (locked_until)
    WHERE locked_until IS NOT NULL
      AND deleted_at IS NULL;

ALTER TABLE users
ADD COLUMN oidc_subject VARCHAR(255);

CREATE UNIQUE INDEX uq_users_oidc_subject_active
    ON users (oidc_subject)
    WHERE oidc_subject IS NOT NULL
      AND deleted_at IS NULL;

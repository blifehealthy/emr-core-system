CREATE TYPE app_user_role AS ENUM (
    'doctor',
    'nurse',
    'admin'
);

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL,
    username VARCHAR(64) NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    role app_user_role NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    CONSTRAINT fk_users_clinic
        FOREIGN KEY (clinic_id)
        REFERENCES clinics (id)
        ON DELETE RESTRICT,
    CONSTRAINT chk_users_deleted_after_created
        CHECK (deleted_at IS NULL OR deleted_at >= created_at)
);

CREATE TABLE practitioners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL,
    user_id UUID,
    practitioner_code VARCHAR(64) NOT NULL,
    first_name VARCHAR(120) NOT NULL,
    last_name VARCHAR(120) NOT NULL,
    license_number VARCHAR(64),
    specialty VARCHAR(120),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    CONSTRAINT fk_practitioners_clinic
        FOREIGN KEY (clinic_id)
        REFERENCES clinics (id)
        ON DELETE RESTRICT,
    CONSTRAINT fk_practitioners_user
        FOREIGN KEY (user_id)
        REFERENCES users (id)
        ON DELETE SET NULL,
    CONSTRAINT chk_practitioners_deleted_after_created
        CHECK (deleted_at IS NULL OR deleted_at >= created_at)
);

CREATE UNIQUE INDEX uq_users_clinic_username_active
    ON users (clinic_id, username)
    WHERE deleted_at IS NULL;

CREATE UNIQUE INDEX uq_practitioners_clinic_code_active
    ON practitioners (clinic_id, practitioner_code)
    WHERE deleted_at IS NULL;

CREATE UNIQUE INDEX uq_practitioners_user_active
    ON practitioners (user_id)
    WHERE user_id IS NOT NULL
      AND deleted_at IS NULL;

CREATE INDEX idx_users_role_active
    ON users (role)
    WHERE deleted_at IS NULL
      AND is_active = TRUE;

CREATE INDEX idx_practitioners_user_active
    ON practitioners (user_id)
    WHERE deleted_at IS NULL
      AND is_active = TRUE;

CREATE TRIGGER trg_users_set_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_practitioners_set_updated_at
BEFORE UPDATE ON practitioners
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

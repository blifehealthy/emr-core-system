CREATE TABLE IF NOT EXISTS role_permission_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  role VARCHAR(32) NOT NULL CHECK (role IN ('doctor', 'nurse', 'admin')),
  permission_key VARCHAR(96) NOT NULL,
  is_allowed BOOLEAN NOT NULL,
  updated_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  UNIQUE (clinic_id, role, permission_key)
);

CREATE INDEX IF NOT EXISTS idx_role_permission_overrides_clinic_active
  ON role_permission_overrides (clinic_id, role, permission_key)
  WHERE deleted_at IS NULL;

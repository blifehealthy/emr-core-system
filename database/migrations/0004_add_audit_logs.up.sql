CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type VARCHAR(64) NOT NULL,
    entity_id UUID NOT NULL,
    action VARCHAR(64) NOT NULL,
    actor_user_id UUID,
    actor_practitioner_id UUID,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_entity
    ON audit_logs (entity_type, entity_id, created_at DESC);

CREATE INDEX idx_audit_logs_actor_user
    ON audit_logs (actor_user_id, created_at DESC)
    WHERE actor_user_id IS NOT NULL;

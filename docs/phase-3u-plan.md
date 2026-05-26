# Phase 3U Plan: Database-backed Role Permission Overrides

## Goal

Move the route permission model from static role-only behavior toward clinic-specific
permission overrides that admins can review and adjust during UAT.

## Scope

- Add `role_permission_overrides` for clinic, role, permission key, and allowed state.
- Resolve actor permission overrides from the database during session/OIDC actor resolution.
- Apply overrides inside existing route-level `requireRole` checks.
- Add admin APIs to list and upsert clinic role permission overrides.
- Add a frontend admin section for permission override review and editing.
- Add service/API/migration/frontend/API smoke documentation and tests.

## Out Of Scope

- Per-user permission overrides.
- Patient assignment, ownership, or department-specific access rules.
- Permission approval workflow.
- External identity provider group mapping.

## Acceptance Criteria

- Default role permissions still work when no override exists.
- A clinic override can grant a permission that the default role denies.
- A clinic override can deny a permission that the default role grants.
- Admin can list and update permission overrides through API and frontend admin workspace.
- Session/OIDC resolved actors receive DB-backed overrides before route authorization.

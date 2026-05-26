# Phase 3U Closure Summary

Phase 3U ปิดงาน database-backed role permission override foundation แล้ว

## งานที่ทำเสร็จ

- เพิ่ม migration `0041_add_phase_3u_role_permission_overrides`
- เพิ่ม service:
  - `listRolePermissions`
  - `upsertRolePermission`
- เพิ่ม API:
  - `GET /api/role-permissions`
  - `PATCH /api/role-permissions`
- `resolveActor` และ `resolveOidcActor` โหลด permission overrides จาก DB
- `requireRole` ใช้ override ก่อน fallback ไป default role permission
- เพิ่ม frontend Admin section สำหรับ Role Permissions
- เพิ่ม API smoke, frontend workflow smoke, service/API/migration tests
- อัปเดต role permission matrix และ handoff docs

## Verification

- `npx tsc --noEmit` ผ่าน
- targeted service/API/migration tests ผ่าน
- `node --check frontend/app.js` ผ่าน
- `npm run frontend:workflow-smoke` ผ่าน
- `npm test` ผ่าน `155/155`
- `npm run api:smoke` ผ่านด้วย `POSTGRES_CONTAINER=emr-core-postgres`

## งานถัดไปที่แนะนำ

Phase 3V ควรเลือกจาก UAT: controlled-drug reconciliation workflow, per-user permission/MFA integration, หรือ permission change approval workflow

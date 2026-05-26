# Phase 3V Closure Summary

Phase 3V ปิดงาน controlled substance reconciliation foundation แล้ว

## งานที่ทำเสร็จ

- เพิ่ม migration `0042_add_phase_3v_controlled_substance_reconciliations`
- เพิ่ม service:
  - `listControlledSubstanceReconciliations`
  - `createControlledSubstanceReconciliation`
  - `closeControlledSubstanceReconciliation`
- เพิ่ม API:
  - `GET /api/controlled-substance-reconciliations`
  - `POST /api/controlled-substance-reconciliations`
  - `PATCH /api/controlled-substance-reconciliations/:reconciliationId/close`
- เพิ่ม validation สำหรับเปิดและปิดรอบตรวจนับ
- เพิ่ม frontend Operations panel สำหรับเปิด/ปิดรอบตรวจนับ controlled drug
- เพิ่ม API smoke, frontend workflow smoke, service/API/migration tests
- อัปเดต API grouping, role permission matrix, planning seeds, review docs, และ handoff

## Verification

- `npx tsc --noEmit` ผ่าน
- targeted service/API/migration tests ผ่าน
- `node --check frontend/app.js` ผ่าน
- `npm run frontend:workflow-smoke` ผ่าน
- `npm test` ผ่าน `157/157`
- `npm run api:smoke` ผ่านด้วย `POSTGRES_CONTAINER=emr-core-postgres`

## งานถัดไปที่แนะนำ

Phase 3W ควรเลือกจาก UAT: per-lot controlled count, variance approval/witness,
permission change approval workflow, หรือ printer bridge/GS1 parsing ถ้าห้องยาต้องใช้จริงก่อน

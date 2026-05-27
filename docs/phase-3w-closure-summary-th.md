# Phase 3W Closure Summary

Phase 3W ปิดงาน controlled reconciliation variance approval foundation แล้ว

## งานที่ทำเสร็จ

- เพิ่ม migration `0043_add_phase_3w_controlled_reconciliation_approval`
- เพิ่มสถานะ `pending_approval`
- เพิ่มฟิลด์:
  - `approved_by_user_id`
  - `approved_at`
  - `approval_note`
- ปรับ close reconciliation:
  - variance `0` เป็น `closed`
  - variance ไม่ใช่ `0` เป็น `pending_approval`
- เพิ่ม service/API:
  - `approveControlledSubstanceReconciliation`
  - `PATCH /api/controlled-substance-reconciliations/:reconciliationId/approve`
- เพิ่ม frontend Operations action สำหรับอนุมัติส่วนต่าง
- เพิ่ม API smoke, frontend workflow smoke, service/API/migration tests
- อัปเดต API grouping, role permission matrix, planning seeds, review docs, และ handoff

## Verification

- `npx tsc --noEmit` ผ่าน
- targeted service/API/migration tests ผ่าน
- `node --check frontend/app.js` ผ่าน
- `npm run frontend:workflow-smoke` ผ่าน
- `npm test` ผ่าน `158/158`
- `npm run api:smoke` ผ่านด้วย `POSTGRES_CONTAINER=emr-core-postgres`

## งานถัดไปที่แนะนำ

Phase 3X ทำ strict approver separation ต่อแล้ว งานถัดไปควรเลือกจาก UAT:
per-lot controlled count, controlled reconciliation witness/re-auth, approval routing หลายชั้น,
หรือ printer bridge/GS1 parsing ถ้าห้องยาต้องใช้ก่อน

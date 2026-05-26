# Phase 3Q Closure Summary

Phase 3Q ปิดงาน pharmacy role separation แล้ว

## งานที่ทำเสร็จ

- เพิ่ม permission:
  - `pharmacy_override_write`
  - `inventory_transfer_approve`
  - `inventory_transfer_receive`
  - `inventory_transfer_cancel`
- แยก route permission สำหรับ transfer approve/receive/cancel
- เพิ่ม conditional permission check สำหรับ dispense/transfer ที่มี `expiryOverrideReason` หรือ `fefoOverrideReason`
- เพิ่ม API regression tests สำหรับ:
  - doctor dispense ปกติ
  - doctor ถูกบล็อกเมื่อ dispense พร้อม override reason
  - admin dispense พร้อม override reason
  - nurse/admin transfer action boundaries
- อัปเดต role-permission matrix, API grouping, planning seeds, review-ready, และ handoff docs

## Verification

- `npx tsc --noEmit`
- `node --check frontend/app.js`
- `npm run frontend:workflow-smoke`
- targeted API route tests ผ่าน
- `npm test` ผ่าน `149/149`
- `npm run api:smoke` ผ่านด้วย `POSTGRES_CONTAINER=emr-core-postgres`

## งานถัดไปที่แนะนำ

Phase 3R ควรเลือกจาก UAT ห้องยา: controlled-substance register, database-backed custom permissions, notification/approval routing, หรือ supplier payment handoff

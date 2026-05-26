# Phase 3O Closure Summary

Phase 3O ปิดงาน FEFO และ expiry picking guard แล้ว

## งานที่ทำเสร็จ

- เพิ่ม migration `0037_add_phase_3o_fefo_picking_guard`
- เพิ่ม override audit fields ใน `medication_dispenses` และ `inventory_transfers`
- เพิ่ม service guard กลางสำหรับตรวจ selected lot:
  - expired lot ต้องมี `expiryOverrideReason`
  - non-FEFO lot ต้องมี `fefoOverrideReason`
  - บันทึก `fefo_recommended_lot_id`
- ต่อ guard เข้ากับ prescription dispensing
- ต่อ guard เข้ากับ inventory transfer creation
- เพิ่ม frontend fields/prompt สำหรับ expiry และ FEFO override
- เพิ่ม unit tests, migration tests, frontend smoke checks, และ API smoke coverage

## Verification

- `npx tsc --noEmit`
- `node --check frontend/app.js`
- `npm run frontend:workflow-smoke`
- targeted FEFO service and migration tests
- `npm test` ผ่าน `148/148`
- `npm run api:smoke` ผ่านด้วย `POSTGRES_CONTAINER=emr-core-postgres`

## งานถัดไปที่แนะนำ

Phase 3P ควรเลือกจาก UAT: review report สำหรับ override, role separation สำหรับ override/transfer approval, controlled-substance register, หรือ supplier payment handoff

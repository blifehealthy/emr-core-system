# Phase 3R Closure Summary

Phase 3R ปิดงาน controlled substance register foundation แล้ว

## งานที่ทำเสร็จ

- เพิ่ม migration `0038_add_phase_3r_controlled_substance_register`
- เพิ่ม fields บน `inventory_items`:
  - `is_controlled_substance`
  - `controlled_substance_schedule`
- เพิ่ม controlled substance register service
- เพิ่ม API:
  - `GET /api/reports/controlled-substances`
  - `GET /api/reports/controlled-substances.csv`
- รวม register events จาก:
  - `inventory_lots`
  - `medication_dispenses`
  - `inventory_transfers`
- เพิ่ม controlled item controls ใน Pharmacy inventory panel
- เพิ่ม Controlled substances chart ใน Operations dashboard
- อัปเดต API smoke ให้สร้าง controlled item และตรวจ JSON/CSV register
- เพิ่ม service/API/migration/frontend smoke coverage

## Verification

- `npx tsc --noEmit`
- targeted service/API/migration tests ผ่าน
- `node --check frontend/app.js`
- `npm run frontend:workflow-smoke`
- `npm test` ผ่าน `151/151`
- `npm run api:smoke` ผ่านด้วย `POSTGRES_CONTAINER=emr-core-postgres`

## งานถัดไปที่แนะนำ

Phase 3S ควรเลือกจาก UAT ห้องยา: witness/co-sign สำหรับ controlled dispense, database-backed custom permissions, notification/approval routing, หรือ supplier payment handoff

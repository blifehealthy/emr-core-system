# Phase 3K Closure Summary: Printer Profiles

## สถานะ

ปิด Phase 3K ในระดับ foundation แล้ว

## งานที่ทำเสร็จ

- เพิ่ม migration `0033_add_phase_3k_printer_profiles`
- เพิ่มตาราง `inventory_printer_profiles`
- เพิ่ม default profile constraint ต่อ clinic
- ขยาย `inventory_barcode_print_jobs` ให้เก็บ:
  - `printer_profile_id`
  - `connection_type`
  - `delivery_status`
  - `target_endpoint`
- เพิ่ม API:
  - `GET /api/inventory-printer-profiles`
  - `POST /api/inventory-printer-profiles`
  - `PATCH /api/inventory-printer-profiles/:profileId`
- เพิ่ม frontend:
  - สร้าง printer profile ใน Pharmacy inventory panel
  - แสดงจำนวน/รายการ printer profile
  - เลือก printer profile ตอน Export ZPL หรือ Export ESC/POS
- เพิ่ม API smoke และ frontend workflow smoke coverage

## Verification

- `PATH="$PWD/.tools/node-v22.22.3-linux-x64/bin:$PATH" npx tsc --noEmit` ผ่าน
- `PATH="$PWD/.tools/node-v22.22.3-linux-x64/bin:$PATH" node --check frontend/app.js` ผ่าน
- `PATH="$PWD/.tools/node-v22.22.3-linux-x64/bin:$PATH" npm run frontend:workflow-smoke` ผ่าน
- `PATH="$PWD/.tools/node-v22.22.3-linux-x64/bin:$PATH" npm test` ผ่าน `141/141`
- `PATH="$PWD/.tools/node-v22.22.3-linux-x64/bin:$PATH" POSTGRES_CONTAINER=emr-core-postgres POSTGRES_USER=postgres POSTGRES_PASSWORD=postgres npm run api:smoke` ผ่าน

## งานถัดไปที่แนะนำ

Phase 3L: multi-location inventory/bin stock เพื่อแยก stock ตามห้องยา สาขา หรือจุดจ่ายยา และต่อยอดกับ printer/location routing ที่ทำไว้ใน Phase 3K

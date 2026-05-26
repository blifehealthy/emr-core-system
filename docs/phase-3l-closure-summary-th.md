# Phase 3L Closure Summary: Inventory Locations

## สถานะ

ปิด Phase 3L ในระดับ foundation แล้ว

## งานที่ทำเสร็จ

- เพิ่ม migration `0034_add_phase_3l_inventory_locations`
- เพิ่มตาราง `inventory_locations`
- เพิ่ม location/bin metadata ให้:
  - `inventory_lots`
  - `medication_dispenses`
  - `stock_movements`
- เพิ่ม API:
  - `GET /api/inventory-locations`
  - `POST /api/inventory-locations`
  - `PATCH /api/inventory-locations/:locationId`
- เพิ่ม filter location ใน:
  - `GET /api/inventory-lots`
  - `GET /api/stock-movements`
- เพิ่ม frontend:
  - สร้าง inventory location ใน Pharmacy inventory
  - แสดงจำนวน/รายการ location
  - รับเข้า lot พร้อม location/bin
  - ปรับ stock พร้อม location/bin
  - จ่ายยาพร้อม location
- เพิ่ม API smoke และ frontend workflow smoke coverage

## Verification

- `PATH="$PWD/.tools/node-v22.22.3-linux-x64/bin:$PATH" npx tsc --noEmit` ผ่าน
- `PATH="$PWD/.tools/node-v22.22.3-linux-x64/bin:$PATH" node --check frontend/app.js` ผ่าน
- `PATH="$PWD/.tools/node-v22.22.3-linux-x64/bin:$PATH" npm run frontend:workflow-smoke` ผ่าน
- Targeted service/migration tests ผ่าน
- `PATH="$PWD/.tools/node-v22.22.3-linux-x64/bin:$PATH" npm test` ผ่าน `143/143`
- `PATH="$PWD/.tools/node-v22.22.3-linux-x64/bin:$PATH" POSTGRES_CONTAINER=emr-core-postgres POSTGRES_USER=postgres POSTGRES_PASSWORD=postgres npm run api:smoke` ผ่าน

## งานถัดไปที่แนะนำ

Phase 3M: inventory transfer and per-location quantity ledger เพื่อย้าย stock ระหว่าง location/bin และเห็นยอดคงเหลือต่อจุดเก็บอย่างเป็นทางการ

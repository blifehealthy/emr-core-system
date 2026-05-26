# Phase 3M Closure Summary: Location Stock Ledger And Transfers

## สถานะ

ปิด Phase 3M ในระดับ foundation แล้ว

## งานที่ทำเสร็จ

- เพิ่ม migration `0035_add_phase_3m_location_stock_ledger`
- เพิ่มตาราง:
  - `inventory_location_stocks`
  - `inventory_transfers`
- เพิ่ม API:
  - `GET /api/inventory-location-stocks`
  - `GET /api/inventory-transfers`
  - `POST /api/inventory-transfers`
- อัปเดต service ให้ location ledger ขยับเมื่อ:
  - รับเข้า lot
  - manual stock adjustment
  - purchase order receiving
  - prescription dispensing
- เพิ่ม immediate transfer ระหว่าง location/bin
- เพิ่ม stock movement audit สำหรับ transfer
- เพิ่ม frontend:
  - โหลด location stock
  - โหลด transfer history
  - แสดง location stock cards
  - สร้าง transfer จาก Pharmacy inventory panel

## Verification

- `PATH="$PWD/.tools/node-v22.22.3-linux-x64/bin:$PATH" npx tsc --noEmit` ผ่าน
- `PATH="$PWD/.tools/node-v22.22.3-linux-x64/bin:$PATH" node --check frontend/app.js` ผ่าน
- `PATH="$PWD/.tools/node-v22.22.3-linux-x64/bin:$PATH" npm run frontend:workflow-smoke` ผ่าน
- Targeted service/migration tests ผ่าน
- `PATH="$PWD/.tools/node-v22.22.3-linux-x64/bin:$PATH" npm test` ผ่าน `145/145`
- `PATH="$PWD/.tools/node-v22.22.3-linux-x64/bin:$PATH" POSTGRES_CONTAINER=emr-core-postgres POSTGRES_USER=postgres POSTGRES_PASSWORD=postgres npm run api:smoke` ผ่าน

## งานถัดไปที่แนะนำ

Phase 3N: lot-specific transfer and transfer approval/in-transit workflow เพื่อให้การย้าย stock ระหว่างจุดเก็บรองรับการอนุมัติและตรวจรับปลายทาง

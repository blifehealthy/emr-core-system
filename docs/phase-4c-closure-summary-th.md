# Phase 4C Closure Summary

Phase 4C ปิดก้อน GS1 barcode parsing foundation แล้ว

## ทำอะไรเพิ่ม

- เพิ่ม GS1 parser สำหรับ AI หลัก:
  - `01` GTIN
  - `17` expiry date
  - `10` lot number
  - `21` serial number
- เพิ่ม migration `0046_add_phase_4c_gs1_barcode_parsing`
- เพิ่ม field audit บน `inventory_barcode_scans`:
  - `gs1_gtin`
  - `gs1_lot_number`
  - `gs1_expires_on`
  - `gs1_serial_number`
- scan lookup match ได้จาก raw barcode, GTIN, หรือ lot number
- receiving, purchase-order receiving, และ dispensing verification รับ GS1
  barcode ที่ GTIN/lot ตรงได้
- manual barcode workflow เดิมยังใช้งานได้

## ขอบเขตที่ยังไม่ทำ

- ยังไม่รองรับ GS1 AI ทั้งหมด
- ยังไม่ตั้งค่า scanner hardware จริง
- ยังไม่ทำ label template editor

## Verification

- `npx tsc --noEmit` ผ่าน
- targeted GS1 tests ผ่าน
- `npm test` ผ่าน `163/163`

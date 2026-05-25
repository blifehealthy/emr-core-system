# Phase 3D Closure Summary

Phase 3D ปิด scope lot/expiry และ pharmacy receiving foundation แล้ว

## Backend

- Migration `0027_add_phase_3d_inventory_lots`
- ตาราง `inventory_lots`
- `inventory_lot_id` ใน `medication_dispenses`
- `inventory_lot_id` ใน `stock_movements`
- API `GET /api/inventory-lots`
- API `POST /api/inventory-lots/receive`
- dispense prescription รองรับ optional `inventoryLotId`
- stock movement และ dispense DTO แสดง lot reference

## Frontend

- แผง Pharmacy inventory เปลี่ยนเป็น Phase 3D
- เพิ่ม metric จำนวน lot และ lot ที่ใกล้หมดอายุ
- เพิ่มฟอร์มรับยาเข้า lot
- แสดง lot cards พร้อมวันหมดอายุและ supplier
- prompt จ่ายยาเสนอ lot ที่ตรงกับ inventory item

## Verification Scope

- Unit tests สำหรับ inventory lot service
- Medication dispense service test ครอบคลุม lot stock decrement
- Migration guard test สำหรับ `inventory_lots`
- API smoke ครอบคลุม receive lot, list lot, lot-based dispense, และ stock
  movement audit

## Work That Remains

- Barcode scanning
- Multi-location inventory
- Supplier master and purchase order workflow
- Controlled-substance register
- Pharmacy UAT with real dispensing scenarios

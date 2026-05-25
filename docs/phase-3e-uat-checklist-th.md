# Phase 3E UAT Checklist

## Supplier

- [ ] เพิ่ม supplier ใหม่ได้
- [ ] list supplier แสดงชื่อ, code, contact, และสถานะถูกต้อง
- [ ] แก้ไข supplier ได้

## Purchase Order

- [ ] สร้าง PO จาก supplier และ inventory item ได้
- [ ] PO แสดง line item, ordered quantity, received quantity และ status ถูกต้อง
- [ ] แก้ status/ข้อมูล PO ได้

## Receiving

- [ ] รับของจาก PO เข้า lot ได้
- [ ] รับของแล้ว inventory item quantity เพิ่ม
- [ ] รับของแล้ว lot ใหม่แสดง lot number, expiry, supplier, reference
- [ ] รับของแล้ว stock movement แสดง movement type และ lot reference
- [ ] ระบบไม่ให้รับเกินจำนวนที่สั่ง
- [ ] เมื่อรับครบ PO เปลี่ยนเป็น `received`

## Frontend

- [ ] แผง Pharmacy inventory แสดง supplier count และ PO open count
- [ ] เพิ่ม supplier จากหน้า Prescriptions ได้
- [ ] สร้าง PO จากหน้า Prescriptions ได้
- [ ] รับของจาก PO แล้ว refresh inventory/lots/PO ได้

## Sign-off

- [ ] ห้องยายืนยัน workflow supplier -> PO -> receiving ใช้ได้จริง
- [ ] เจ้าของคลินิก/ผู้จัดการยืนยันว่ายังไม่ต้องมี approval หลายชั้นในรอบนี้

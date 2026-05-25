# Phase 3C Closure Summary

Phase 3C ปิด scope pharmacy/inventory foundation แล้ว

## เพิ่มใน backend

- Migration `0026_add_phase_3c_pharmacy_inventory`
- ตาราง `inventory_items`
- ตาราง `medication_dispenses`
- ตาราง `stock_movements`
- API สำหรับ inventory item create/list/update
- API สำหรับ stock adjustment และ stock movement list
- API สำหรับจ่ายยาจาก prescription และ list dispense
- Audit log สำหรับ inventory create/update/stock adjustment และ dispense

## เพิ่มใน frontend

- แผง Pharmacy inventory ในแท็บ Prescriptions
- ฟอร์มเพิ่ม inventory item
- ปุ่มรับเข้าและตัด stock
- ปุ่มจ่ายยาจาก prescription
- metric จำนวน inventory item และ low stock

## Verification

- TypeScript compile
- Frontend syntax check
- Unit/migration tests
- API smoke ครอบคลุม inventory item, stock adjustment, dispense, dispense list,
  และ stock movement list

## งานถัดไปที่แนะนำ

Phase 3D ควรเลือกจากผล UAT:

1. Lot/expiry and pharmacy receiving ถ้าห้องยาต้องคุมวันหมดอายุ
2. Accounting/claim export integration ถ้าทีมบัญชีต้องส่งข้อมูลออกระบบภายนอก
3. Patient communication/reminder ถ้าคลินิกต้องการลด no-show และเพิ่ม follow-up

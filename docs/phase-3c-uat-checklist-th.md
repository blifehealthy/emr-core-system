# Phase 3C UAT Checklist

## Inventory Setup

- [ ] สร้าง inventory item พร้อม item code ได้
- [ ] ผูก inventory item กับ drug catalog ได้
- [ ] กำหนด unit และ reorder level ได้
- [ ] ค้นหา/list inventory item ได้
- [ ] low stock แสดงถูกต้องเมื่อ quantity <= reorder level

## Stock Movement

- [ ] รับ stock เข้าแล้ว quantity เพิ่ม
- [ ] ตัด stock ออกแล้ว quantity ลด
- [ ] ระบบไม่ให้ quantity ติดลบ
- [ ] stock movement แสดง movement type, quantity before/after และเหตุผล

## Dispense

- [ ] สร้าง prescription ได้ตาม workflow เดิม
- [ ] เลือก inventory item เพื่อจ่ายยาได้
- [ ] จ่ายยาแล้วเกิด dispense record
- [ ] จ่ายยาแล้ว stock ลดตามจำนวน
- [ ] stock movement มีรายการ `dispense`

## Sign-off

- [ ] ห้องยายืนยันขั้นตอนจ่ายยาพอสำหรับ pilot
- [ ] ทีมคลินิกยืนยันคำที่แสดงบนหน้าจอเข้าใจง่าย
- [ ] ตกลงแล้วว่า lot/expiry ต้องเข้ารอบถัดไปหรือยังไม่จำเป็น

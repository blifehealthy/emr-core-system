# Phase 3G Clinician Summary

Phase 3G เพิ่มกติกาอนุมัติ PO ตามยอดเงิน และรองรับการอนุมัติหลายลำดับ

## สิ่งที่เพิ่ม

- ตั้ง approval policy สำหรับ PO ได้
- policy ระบุยอดขั้นต่ำ/สูงสุด, ลำดับอนุมัติ, และ role ที่ต้องอนุมัติ
- เมื่อส่ง PO เพื่ออนุมัติ ระบบสร้าง approval steps ให้อัตโนมัติ
- อนุมัติทีละ step ได้
- PO จะ approved เมื่อทุก step approved แล้วเท่านั้น
- ถ้า reject step ใด PO จะ rejected พร้อมเหตุผล
- หน้า Prescriptions แสดง approval progress ของ PO

## ประโยชน์ในการใช้งาน

- PO มูลค่าสูงบังคับผ่านหลายลำดับได้
- ลดความเสี่ยงการสั่งซื้อเกินอำนาจอนุมัติ
- เห็นขั้นตอนค้างอนุมัติได้ชัดเจน
- ยังรับของเข้า stock ไม่ได้จนกว่า approval ครบ

## ข้อจำกัดตอนนี้

- ยังไม่มี budget รายแผนก
- ยังไม่มี notification ภายนอก
- ยังไม่มี parallel approver group
- ยังไม่เชื่อมบัญชีเจ้าหนี้ supplier

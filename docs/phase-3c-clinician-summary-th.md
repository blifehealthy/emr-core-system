# สรุป Phase 3C สำหรับทีมคลินิก

Phase 3C เพิ่มฐานงานห้องยาและสต็อกยา เพื่อให้ prescription ที่แพทย์สั่งต่อไปถึงการจ่ายยาได้

## สิ่งที่ใช้ได้แล้ว

- สร้าง inventory item ของคลินิกได้
- ผูก inventory item กับ drug catalog ได้
- เก็บจำนวนคงเหลือ หน่วย และ reorder level
- เห็นรายการ low stock ได้จากข้อมูล inventory
- ปรับ stock รับเข้า/ตัดออกได้
- จ่ายยาจาก prescription แล้วระบบตัด stock
- ระบบเก็บ dispense record และ stock movement audit

## สิ่งที่ควรให้ทีมลอง

- เพิ่มยาใน drug catalog
- เพิ่ม inventory item ของยานั้น
- รับ stock เข้า
- สร้าง prescription จากหน้าเวชระเบียน
- กดจ่ายยาและตรวจว่าจำนวน stock ลดลง
- ดู stock movement ว่ามีรายการ dispense

## ข้อจำกัดที่ตั้งใจยังไม่ทำ

- ยังไม่มี lot/expiry
- ยังไม่มี barcode
- ยังไม่มีใบสั่งซื้อหรือ supplier workflow
- ยังไม่แยกสต็อกหลายคลัง
- ยังไม่ทำ workflow ยาควบคุมพิเศษ

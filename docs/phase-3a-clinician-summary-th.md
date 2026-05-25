# สรุป Phase 3A สำหรับเจ้าของคลินิกและทีมการเงิน

Phase 3A เริ่มวาง foundation ของ billing/payment หลังปิด implementation scope ของ Phase 2

## สิ่งที่เพิ่มแล้ว

ระบบมีโครงสร้างข้อมูลสำหรับ:

- invoice
- invoice line item
- invoice payment

invoice สามารถผูกกับ:

- clinic
- patient
- appointment
- visit
- encounter

## Flow ที่ API รองรับแล้ว

- สร้าง invoice พร้อม line items
- ดู invoice พร้อมรายการ charge และ payment
- list invoice ตาม clinic/patient/status
- บันทึก payment
- ระบบคำนวณ paid amount, balance และ status เป็น `partially_paid` หรือ `paid`

## สิทธิ์การใช้งาน

- doctor/nurse/admin อ่าน invoice ได้
- admin สร้าง invoice และบันทึก payment ได้

## Audit

ระบบบันทึก audit เมื่อ:

- สร้าง invoice
- รับชำระเงิน

## สิ่งที่ยังไม่ใช่รอบนี้

- ยังไม่มีหน้าจอ cashier
- ยังไม่มีใบเสร็จ/print receipt
- ยังไม่มี void/refund
- ยังไม่มี charge template
- ยังไม่มี insurance claim workflow เต็มรูปแบบ

## สถานะ

Phase 3A billing foundation ชุดแรกพร้อมต่อยอดเป็น cashier UI และ receipt flow ในชุดถัดไป

# สรุป Phase 3A สำหรับเจ้าของคลินิกและทีมการเงิน

Phase 3A เริ่มวาง foundation ของ billing/payment หลังปิด implementation scope ของ Phase 2

## สิ่งที่เพิ่มแล้ว

ระบบมีโครงสร้างข้อมูลสำหรับ:

- invoice
- invoice line item
- invoice payment
- invoice refund
- charge template สำหรับค่าบริการที่ใช้บ่อย
- insurance claim เบื้องต้น

invoice สามารถผูกกับ:

- clinic
- patient
- appointment
- visit
- encounter

## Flow ที่ API รองรับแล้ว

- สร้าง invoice พร้อม line items
- แก้ invoice หลาย line items ก่อนรับเงิน/คืนเงิน
- ดู invoice พร้อมรายการ charge และ payment
- list invoice ตาม clinic/patient/status
- บันทึก payment
- บันทึก refund
- void invoice พร้อมเหตุผล
- สร้าง charge template เช่น ค่าตรวจ/ค่าหัตถการ
- สร้าง invoice จาก encounter/prescription แบบ auto charge capture
- เก็บเลข receipt และเลข tax invoice
- สร้างและอัปเดต insurance claim เบื้องต้น
- ใช้หน้า Cashier เพื่อสร้าง invoice, รับชำระ, คืนเงิน, สร้าง claim และพิมพ์ใบเสร็จ
- ระบบคำนวณ paid amount, balance และ status เป็น `partially_paid` หรือ `paid`

## สิทธิ์การใช้งาน

- doctor/nurse/admin อ่าน invoice ได้
- admin สร้าง/แก้ invoice, บันทึก payment/refund, void invoice, จัดการ charge template และจัดการ claim ได้

## Audit

ระบบบันทึก audit เมื่อ:

- สร้าง invoice
- รับชำระเงิน
- คืนเงิน
- void invoice
- เพิ่ม/แก้ charge template
- สร้าง/แก้ insurance claim
- auto charge capture จาก encounter

## สิ่งที่ยังไม่ใช่รอบนี้

- ยังไม่มีการเชื่อมต่อ payer/insurer จริง
- ยังไม่มี sequence generator สำหรับออกเลข receipt/tax invoice อัตโนมัติ
- ยังไม่มี procedure/lab order module เต็มรูปแบบสำหรับ charge capture

## สถานะ

Phase 3A implementation scope พร้อมเข้า UAT กับทีมหน้าเคาน์เตอร์/การเงิน

# สรุป Phase 3A สำหรับเจ้าของคลินิกและทีมการเงิน

Phase 3A เริ่มวาง foundation ของ billing/payment หลังปิด implementation scope ของ Phase 2

## สิ่งที่เพิ่มแล้ว

ระบบมีโครงสร้างข้อมูลสำหรับ:

- invoice
- invoice line item
- invoice payment
- invoice refund
- charge template สำหรับค่าบริการที่ใช้บ่อย

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
- บันทึก refund
- void invoice พร้อมเหตุผล
- สร้าง charge template เช่น ค่าตรวจ/ค่าหัตถการ
- ใช้หน้า Cashier เพื่อสร้าง invoice, รับชำระ, คืนเงิน และพิมพ์ใบเสร็จ
- ระบบคำนวณ paid amount, balance และ status เป็น `partially_paid` หรือ `paid`

## สิทธิ์การใช้งาน

- doctor/nurse/admin อ่าน invoice ได้
- admin สร้าง invoice, บันทึก payment/refund, void invoice และจัดการ charge template ได้

## Audit

ระบบบันทึก audit เมื่อ:

- สร้าง invoice
- รับชำระเงิน
- คืนเงิน
- void invoice
- เพิ่ม/แก้ charge template

## สิ่งที่ยังไม่ใช่รอบนี้

- ยังไม่มี multi-line invoice editor แบบเต็ม
- ยังไม่มีเลขใบเสร็จ/ใบกำกับภาษีตาม policy จริง
- ยังไม่มี auto charge capture จาก visit/procedure/prescription
- ยังไม่มี insurance claim workflow เต็มรูปแบบ

## สถานะ

Phase 3A cashier foundation พร้อมให้ทีมหน้าเคาน์เตอร์ทดสอบ flow invoice/payment/refund/void/receipt รอบแรก

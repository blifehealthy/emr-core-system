# Phase 3A UAT Checklist

ใช้ checklist นี้ทดสอบ billing/cashier foundation ชุดแรก

## ผู้เข้าร่วม

- เจ้าของคลินิก
- Admin clinic
- เจ้าหน้าที่การเงิน/หน้าเคาน์เตอร์
- ตัวแทนแพทย์หรือพยาบาล

## Invoice

- สร้าง invoice ให้ patient ได้
- ใส่ line item ประเภท visit ได้
- ใส่ line item ประเภท medication ได้
- subtotal/discount/tax/total ถูกต้อง
- ดู invoice เดิมได้
- list invoice ตาม status ได้
- สร้าง invoice จาก charge template ได้
- เปิดรายละเอียด invoice แล้วเห็น line items, payments, refunds

## Payment

- บันทึก cash payment ได้
- paid amount เพิ่มถูกต้อง
- balance amount ลดถูกต้อง
- invoice status เป็น `partially_paid` เมื่อยังจ่ายไม่ครบ
- invoice status เป็น `paid` เมื่อจ่ายครบ
- พิมพ์ใบเสร็จได้และเห็นยอด total/paid/refunded/balance

## Refund And Void

- บันทึก refund ได้
- refunded amount เพิ่มถูกต้อง
- paid/balance หลัง refund ถูกต้อง
- void invoice พร้อมเหตุผลได้
- voided invoice แสดง status `voided`

## Charge Templates

- admin เพิ่ม charge template ได้
- template ที่ active ถูกดึงมาใช้ในหน้า Cashier ได้

## Role And Audit

- admin สร้าง invoice ได้
- admin บันทึก payment ได้
- admin บันทึก refund และ void invoice ได้
- nurse/doctor อ่าน invoice ได้
- nurse/doctor สร้าง invoice ไม่ได้
- audit log มี invoice created
- audit log มี payment recorded
- audit log มี refund recorded
- audit log มี invoice voided

## Sign-Off

เลือกผลลัพธ์:

- ผ่าน พร้อมต่อ multi-line invoice/auto charge capture
- ผ่านแบบมีข้อสังเกต
- ไม่ผ่าน ต้องแก้ billing/cashier foundation ก่อนต่อยอด

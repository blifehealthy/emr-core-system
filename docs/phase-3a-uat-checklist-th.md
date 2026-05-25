# Phase 3A UAT Checklist

ใช้ checklist นี้ทดสอบ billing foundation ชุดแรก

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

## Payment

- บันทึก cash payment ได้
- paid amount เพิ่มถูกต้อง
- balance amount ลดถูกต้อง
- invoice status เป็น `partially_paid` เมื่อยังจ่ายไม่ครบ
- invoice status เป็น `paid` เมื่อจ่ายครบ

## Role And Audit

- admin สร้าง invoice ได้
- admin บันทึก payment ได้
- nurse/doctor อ่าน invoice ได้
- nurse/doctor สร้าง invoice ไม่ได้
- audit log มี invoice created
- audit log มี payment recorded

## Sign-Off

เลือกผลลัพธ์:

- ผ่าน พร้อมทำ cashier frontend
- ผ่านแบบมีข้อสังเกต
- ไม่ผ่าน ต้องแก้ billing foundation ก่อนต่อ UI

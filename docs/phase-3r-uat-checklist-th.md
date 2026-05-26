# Phase 3R UAT Checklist: Controlled Substance Register

## เตรียมข้อมูล

- มี inventory item ที่ตั้ง `isControlledSubstance = true`
- มี schedule/category เช่น `Schedule 4`
- มี lot receiving ของ item นั้น
- มี dispense ของ item นั้น
- มี transfer ของ item นั้น
- ผู้ทดสอบมีสิทธิ์ `audit_read`

## กรณีทดสอบ

- สร้างหรือแก้ inventory item ให้เป็น controlled substance
- รับ lot เข้าคลัง แล้วตรวจว่า report มี event type `receive`
- จ่ายยาจาก prescription แล้วตรวจว่า report มี event type `dispense`
- สร้าง transfer แล้วตรวจว่า report มี event type `transfer`
- เรียก `GET /api/reports/controlled-substances`
- ตรวจค่า `controlled_item_total`, `event_total`, `received_total`, `dispensed_total`, `transfer_total`
- เรียก `GET /api/reports/controlled-substances.csv`
- เปิด Operations dashboard แล้วตรวจว่า chart Controlled substances แสดงข้อมูล

## เกณฑ์ผ่าน

- JSON, CSV, และ dashboard แสดงตัวเลขตรงกับ event ที่สร้าง
- รายการล่าสุดมีชื่อยา lot/location และ quantity เพียงพอสำหรับ review
- ทีมคลินิกยืนยันได้ว่าข้อมูลนี้ใช้เป็นทะเบียนตรวจทานเบื้องต้นได้

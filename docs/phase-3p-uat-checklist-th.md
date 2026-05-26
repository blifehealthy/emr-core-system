# Phase 3P UAT Checklist: Pharmacy Override Review Report

## เตรียมข้อมูล

- มี dispense หรือ transfer ที่มี `expiryOverrideReason`
- มี dispense หรือ transfer ที่มี `fefoOverrideReason`
- ผู้ทดสอบมีสิทธิ์ `audit_read`

## กรณีทดสอบ

- เปิด Operations dashboard ด้วยช่วงวันที่ที่มี override
- ตรวจว่า chart Pharmacy overrides แสดงจำนวน
- เรียก `GET /api/reports/pharmacy-overrides`
- ตรวจค่า `override_total`, `dispense_override_total`, `transfer_override_total`
- ตรวจว่า `recent_events` มี item, lot, recommended lot, และเหตุผล override
- เรียก `GET /api/reports/pharmacy-overrides.csv`
- ตรวจว่า CSV มีค่า `override_total` และแถว aggregate

## เกณฑ์ผ่าน

- ตัวเลขใน dashboard และ API ตรงกับข้อมูล override ที่สร้างไว้
- CSV เปิดอ่านได้และใช้ review ได้
- ทีมคลินิกตกลงได้ว่าจะ review รายวันหรือรายสัปดาห์

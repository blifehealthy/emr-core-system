# Phase 3A Closure Summary

เอกสารนี้สรุปสถานะปิด implementation scope ของ Phase 3A Billing/Payment
Foundation สำหรับเจ้าของคลินิก ทีมหน้าเคาน์เตอร์ และทีมการเงิน

## สถานะ

Phase 3A implementation scope เสร็จแล้ว พร้อมเข้าสู่ UAT กับผู้ใช้งานจริง
กลุ่ม cashier/front desk

## สิ่งที่ระบบทำได้

- สร้าง invoice แบบหลาย line items
- ดึง charge อัตโนมัติจาก encounter และ prescription โดยใช้ charge template
- กำหนดเลข receipt และ tax invoice ใน invoice
- บันทึก payment
- บันทึก refund
- void invoice พร้อมเหตุผล
- สร้างและอัปเดต insurance claim เบื้องต้น
- พิมพ์ receipt จากหน้า Cashier
- ดูรายละเอียด invoice พร้อม line items, payments, refunds และ claims

## สิทธิ์

- doctor, nurse, admin อ่าน invoice/claim ได้
- admin จัดการ billing write actions ได้ เช่น สร้าง/แก้ invoice, รับเงิน,
  refund, void, charge template และ insurance claim

## Audit

ระบบบันทึก audit สำหรับ:

- invoice created/updated
- encounter charge captured
- payment recorded
- refund recorded
- invoice voided
- charge template created/updated
- insurance claim created/updated

## ข้อจำกัดที่ตั้งใจเหลือไว้หลัง Phase 3A

- ยังไม่มี sequence generator อัตโนมัติสำหรับ receipt/tax invoice number
- ยังไม่มีการเชื่อมต่อ payer/insurer จริง
- ยังไม่มี claim export/EDI
- charge capture จาก procedure/lab ต้องรอ module procedure/lab ใน phase ถัดไป

## Verification

- TypeScript check ผ่าน
- frontend syntax check ผ่าน
- unit/migration tests ผ่าน
- API smoke ผ่านกับ temporary PostgreSQL และ real HTTP API

## งานถัดไปที่แนะนำ

เริ่ม Phase 3B: billing reports, end-of-day cashier reconciliation,
receipt/tax invoice sequence policy, และ claim export/payer integration planning

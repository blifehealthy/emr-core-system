# Phase 3E Clinician Summary

Phase 3E เพิ่มงานจัดซื้อของห้องยาให้เชื่อมกับ stock ที่มีอยู่เดิม

## สิ่งที่เพิ่ม

- บันทึก supplier master ได้
- สร้าง purchase order สำหรับยา/เวชภัณฑ์ใน inventory ได้
- รับของจาก purchase order เข้า lot ได้
- ระบบเพิ่ม stock และสร้าง stock movement ให้อัตโนมัติ
- lot ที่รับจาก PO เก็บ supplier และเลข PO อ้างอิง
- หน้า Prescriptions มีแผง Pharmacy inventory สำหรับ supplier, PO, lot และ stock

## ประโยชน์ในการใช้งาน

- ห้องยารู้ว่า stock เข้าโดยมาจาก supplier/PO ใด
- ลดการรับ stock แบบไม่มีเอกสารอ้างอิง
- ตรวจย้อน stock movement ได้ดีขึ้น
- เตรียมฐานให้ทำ approval, barcode, หรือ multi-location ต่อในอนาคต

## ข้อจำกัดตอนนี้

- ยังไม่มี approval หลายชั้น
- ยังไม่เชื่อมบัญชีเจ้าหนี้หรือ payment ให้ supplier
- ยังไม่มี barcode scanning
- ยังไม่มี multi-location stock

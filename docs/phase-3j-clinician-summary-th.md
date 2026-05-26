# Phase 3J Clinician Summary

Phase 3J เพิ่มการ export label สำหรับเครื่องพิมพ์เฉพาะทาง และเก็บ audit ของ
งานพิมพ์

## สิ่งที่เพิ่ม

- ระบบสร้าง barcode print job ได้
- รองรับ export payload แบบ ZPL
- รองรับ export payload แบบ ESC/POS
- เก็บจำนวน label, ภาษา printer, payload, ผู้ขอพิมพ์, และเวลา
- หน้า Pharmacy inventory มีปุ่ม Export ZPL และ Export ESC/POS
- export เปิดเป็นหน้าข้อความสำหรับส่งต่อให้ printer utility หรือทีม IT

## ประโยชน์ในการใช้งาน

- เตรียมเชื่อมเครื่องพิมพ์ label จริง
- ตรวจสอบย้อนหลังได้ว่าเคยสร้างงานพิมพ์ label อะไร
- ลดช่องว่างระหว่าง label preview ใน browser กับ printer เฉพาะทาง

## ข้อจำกัดตอนนี้

- ยังไม่สั่งพิมพ์ตรงไปยัง USB/network printer
- ยังไม่มีระบบจัดการ printer หลายเครื่อง
- ยังไม่มี approval ก่อน reprint
- ยังไม่ parse GS1 barcode

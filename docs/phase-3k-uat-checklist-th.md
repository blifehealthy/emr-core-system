# Phase 3K UAT Checklist: Printer Profiles

## เตรียมข้อมูล

- มี clinic test พร้อม login สิทธิ์ admin/pharmacy
- มี inventory item หรือ lot ที่มี barcode
- มี label อย่างน้อย 1 รายการใน Pharmacy inventory panel

## ทดสอบหน้าคลังยา

- เปิดเวชระเบียนและไปที่แท็บ Prescriptions
- ตรวจว่า Pharmacy inventory แสดงจำนวน Printer profiles
- สร้าง printer profile ใหม่:
  - ชื่อ profile
  - language เป็น ZPL หรือ ESC/POS
  - connection เป็น browser, network, หรือ utility_bridge
  - endpoint/location ตามต้องการ
  - ตั้ง default ได้
- ตรวจว่า profile ใหม่แสดงในรายการ

## ทดสอบ export label

- เลือก printer profile ใน scanner panel
- กด Export ZPL
- ตรวจว่า payload ถูกสร้างและระบบแจ้งสำเร็จ
- ถ้าเลือก connection เป็น utility_bridge หรือ network ให้ตรวจว่าสถานะงานเป็น queued
- ทดสอบ Export ESC/POS อีกครั้ง

## ทดสอบ API โดยทีมเทคนิค

- `GET /api/inventory-printer-profiles?clinicId=...`
- `POST /api/inventory-printer-profiles`
- `PATCH /api/inventory-printer-profiles/:profileId`
- `POST /api/inventory-barcode-print-jobs` พร้อม `printerProfileId`

## เกณฑ์ผ่าน

- สร้างและเลือก printer profile ได้
- Print job audit เก็บ profile, connection, endpoint, delivery status ได้
- การ export แบบเดิมที่ไม่เลือก profile ยังทำงานได้

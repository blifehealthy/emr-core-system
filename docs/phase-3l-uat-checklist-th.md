# Phase 3L UAT Checklist: Inventory Locations

## เตรียมข้อมูล

- มี clinic test พร้อมสิทธิ์ admin/pharmacy
- มี inventory item อย่างน้อย 1 รายการ
- มีผู้ป่วยและ prescription สำหรับทดสอบจ่ายยา

## ทดสอบ Location

- เปิดเวชระเบียนและไปที่แท็บ Prescriptions
- ตรวจว่า Pharmacy inventory แสดงจำนวน Locations
- สร้าง location ใหม่ เช่น Main Pharmacy
- ตั้งเป็น default ได้
- ตรวจว่า location ใหม่แสดงในรายการ

## ทดสอบรับเข้า

- รับเข้า lot ใหม่
- เลือก location และกรอก bin
- ตรวจว่า lot card แสดง location/bin
- ตรวจว่า stock movement มี location

## ทดสอบจ่ายยา

- จ่ายยาจาก prescription โดยเลือก inventory item/lot/location
- ตรวจว่า dispense record สำเร็จ
- ตรวจว่า stock movement ของ dispense มี location เดียวกัน

## API ที่ควรตรวจ

- `GET /api/inventory-locations?clinicId=...`
- `POST /api/inventory-locations`
- `PATCH /api/inventory-locations/:locationId`
- `GET /api/inventory-lots?clinicId=...&inventoryLocationId=...`
- `GET /api/stock-movements?clinicId=...&inventoryLocationId=...`

## เกณฑ์ผ่าน

- Workflow เดิมยังทำงานได้ถ้าไม่เลือก location
- เมื่อเลือก location แล้ว lot, dispense, และ movement เก็บ location ถูกต้อง
- ทีมยาเข้าใจว่าเฟสนี้เป็น foundation ก่อนทำยอดคงเหลือต่อ location แบบเต็ม

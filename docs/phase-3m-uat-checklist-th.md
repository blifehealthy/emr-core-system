# Phase 3M UAT Checklist: Location Stock Ledger And Transfers

## เตรียมข้อมูล

- มี inventory item อย่างน้อย 1 รายการ
- มี inventory location อย่างน้อย 2 จุด
- มี lot ที่รับเข้า location แล้ว

## ทดสอบยอดคงเหลือต่อ Location

- รับเข้า lot โดยเลือก location/bin
- ตรวจว่า Location stock แสดง item/location/bin และจำนวนที่รับเข้า
- ปรับ stock เข้า/ออกโดยเลือก location/bin
- ตรวจว่ายอด location stock เปลี่ยนตาม

## ทดสอบจ่ายยา

- จ่ายยาจาก prescription โดยเลือก inventory item/lot/location
- ตรวจว่ายอด location stock ลดลง
- ตรวจว่า stock movement มี location

## ทดสอบ Transfer

- เลือก item
- เลือก from location/bin
- เลือก to location/bin
- ระบุจำนวน
- กดย้าย stock
- ตรวจว่า transfer card แสดงรายการ
- ตรวจว่ายอด from location ลดลง และ to location เพิ่มขึ้น

## API ที่ควรตรวจ

- `GET /api/inventory-location-stocks?clinicId=...`
- `GET /api/inventory-transfers?clinicId=...`
- `POST /api/inventory-transfers`

## เกณฑ์ผ่าน

- Transfer ไม่อนุญาตให้ยอด location ติดลบ
- Workflow เดิมที่ไม่เลือก location ยังทำงานได้
- ประวัติ movement และ transfer ตรวจย้อนหลังได้

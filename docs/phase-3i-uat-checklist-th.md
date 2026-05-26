# Phase 3I UAT Checklist

## Scanner UX

- [ ] เปิดหน้า Prescriptions แล้วเห็นช่อง scan barcode ใน Pharmacy inventory
- [ ] scan หรือพิมพ์ barcode ของ item แล้วระบบขึ้น matched
- [ ] scan หรือพิมพ์ barcode ของ lot แล้วระบบขึ้น matched
- [ ] scan barcode ที่ไม่มีในระบบแล้วระบบแจ้ง not matched
- [ ] audit scan ถูกบันทึกผ่าน API

## Label Printing

- [ ] กดพิมพ์ label จาก inventory item card ได้
- [ ] label แสดงชื่อ item, item code, barcode, และ quantity
- [ ] กดพิมพ์ lot label จาก lot card ได้
- [ ] lot label แสดงชื่อ item, lot number, barcode, expiry, และ quantity
- [ ] กดพิมพ์ labels ทั้งหมดได้

## Sign-off

- [ ] เภสัชกรยืนยันตำแหน่งช่อง scan ใช้งานสะดวก
- [ ] ทีมปฏิบัติการยืนยัน label พื้นฐานเพียงพอก่อนเลือก printer เฉพาะทาง
- [ ] ตัดสินใจงานถัดไป: ZPL/ESC/POS, GS1 parsing, หรือ multi-location bin label

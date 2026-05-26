# Phase 3H UAT Checklist

## Inventory Barcode

- [ ] สร้าง inventory item พร้อม barcode ได้
- [ ] inventory item card แสดง barcode และ barcode required ได้
- [ ] ค้น/scan barcode แล้วเจอ item ที่ถูกต้อง

## Receiving

- [ ] รับ stock เข้า lot พร้อม lot barcode ได้
- [ ] รับ stock เข้า lot พร้อม scanned barcode แล้ว `barcode_verified` เป็น true
- [ ] เมื่อบังคับ barcode verification และ scan ไม่ตรง ระบบไม่รับเข้า stock
- [ ] รับของจาก PO พร้อม scanned barcode ได้
- [ ] stock movement แสดง scanned barcode และ verification status

## Dispensing

- [ ] จ่ายยาพร้อม scanned barcode ได้
- [ ] dispense record แสดง barcode verification status
- [ ] เมื่อบังคับ barcode verification และ scan ไม่ตรง ระบบไม่จ่ายยา
- [ ] stock และ lot quantity ลดถูกต้องหลังจ่ายยา

## Sign-off

- [ ] เภสัชกร/ผู้ดูแลห้องยายืนยัน barcode flow ใช้งานได้กับงานจริง
- [ ] ตัดสินใจว่าจะต่อ label printing, scanner hardware, หรือ multi-location bin
  scanning เป็นงานถัดไป

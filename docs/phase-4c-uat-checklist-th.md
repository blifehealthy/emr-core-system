# Phase 4C UAT Checklist: GS1 Barcode Parsing

## เตรียมข้อมูล

- [ ] มี inventory item ที่เก็บ GTIN ในช่อง barcode
- [ ] มี lot number ที่ตรงกับ barcode GS1 ตัวอย่าง
- [ ] มีตัวอย่าง barcode GS1 จากกล่องยาหรือ simulator

## Scan Lookup

- [ ] scan barcode แบบ `(01)...(17)...(10)...`
- [ ] ระบบแสดง/คืนค่า GTIN
- [ ] ระบบแสดง/คืนค่า lot number
- [ ] ระบบแสดง/คืนค่า expiry date
- [ ] ระบบยัง match item/lot ได้ถ้า GTIN หรือ lot ตรง

## Receiving

- [ ] รับ stock ด้วย scanned GS1 barcode ได้
- [ ] ถ้า barcode required และ GTIN/lot ตรง ระบบบันทึก `barcode_verified`
- [ ] ถ้า GTIN/lot ไม่ตรง ระบบปฏิเสธการรับของ

## Dispensing

- [ ] จ่ายยาพร้อม scanned GS1 barcode ได้เมื่อ GTIN/lot ตรง
- [ ] ถ้า barcode required และ scan ไม่ตรง ระบบปฏิเสธการจ่ายยา
- [ ] manual barcode เดิมยังใช้ได้

## Sign-Off

- [ ] ห้องยายืนยันรูปแบบ barcode จากสินค้าจริง
- [ ] ทีม IT ระบุ scanner รุ่น/โหมด keyboard wedge ที่จะใช้จริง
- [ ] บันทึกตัวอย่าง barcode ที่ยัง parse ไม่ได้เพื่อทำ Phase 4D ถ้าจำเป็น

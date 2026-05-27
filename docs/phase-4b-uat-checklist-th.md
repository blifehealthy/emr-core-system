# Phase 4B UAT Checklist: Printer Bridge Queue

## เตรียมข้อมูล

- [ ] มี clinic สำหรับทดสอบ
- [ ] มี printer profile แบบ `utility_bridge` หรือ `network`
- [ ] มี item/lot ที่มี barcode
- [ ] สร้าง barcode print job ได้

## ทดสอบ Queue

- [ ] เรียก `GET /api/inventory-barcode-print-jobs?deliveryStatus=queued`
- [ ] เห็นงาน queued ที่มี payload สำหรับพิมพ์
- [ ] filter ด้วย `connectionType` ได้
- [ ] filter ด้วย `printerProfileId` ได้

## ทดสอบ Ack

- [ ] PATCH delivery เป็น `printing` ได้
- [ ] PATCH delivery เป็น `delivered` ได้
- [ ] `delivered_at` ถูกบันทึกเมื่อ delivered
- [ ] PATCH delivery เป็น `failed` พร้อม `deliveryError` ได้
- [ ] failed โดยไม่ใส่ `deliveryError` ถูกปฏิเสธ
- [ ] `delivery_attempt_count` เพิ่มตามจำนวนครั้งที่ ack

## Fallback

- [ ] ถ้า bridge ใช้งานไม่ได้ ยัง export/print ผ่าน browser/manual ได้
- [ ] ทีม IT รู้วิธีเปลี่ยน profile กลับเป็น browser fallback

## Sign-Off

- [ ] ห้องยายืนยัน queue/ack contract เพียงพอสำหรับทดสอบ bridge จริง
- [ ] ทีม IT ระบุว่าจะใช้ utility bridge หรือ network printer
- [ ] บันทึก printer รุ่น/endpoint ที่ต้องทดสอบจริงใน Phase 4C หรือ UAT

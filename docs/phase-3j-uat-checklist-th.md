# Phase 3J UAT Checklist

## Print Job Export

- [ ] กด Export ZPL จาก Pharmacy inventory ได้
- [ ] payload ที่เปิดขึ้นมามีคำสั่ง ZPL และ barcode ถูกต้อง
- [ ] กด Export ESC/POS จาก Pharmacy inventory ได้
- [ ] payload ที่เปิดขึ้นมามี barcode marker ถูกต้อง
- [ ] เมื่อไม่มี label ระบบแจ้งว่าไม่มี barcode สำหรับ export

## Audit

- [ ] API สร้าง print job พร้อม `label_count`
- [ ] API เก็บ `printer_language`
- [ ] API เก็บ `requested_by_user_id` เมื่อส่ง user id
- [ ] audit log มี entity `inventory_barcode_print_job`

## Sign-off

- [ ] ทีม IT/ห้องยายืนยัน ZPL payload ใช้ทดสอบกับ printer utility ได้
- [ ] ทีม IT/ห้องยายืนยัน ESC/POS payload เพียงพอสำหรับรอบ pilot
- [ ] ตัดสินใจงานถัดไป: direct printer integration, reprint approval, หรือ GS1 parsing

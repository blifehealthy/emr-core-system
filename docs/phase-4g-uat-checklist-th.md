# Phase 4G UAT Checklist

## เตรียมข้อมูล

- [ ] มี barcode print job หลายสถานะ เช่น queued, delivered, failed
- [ ] มีอย่างน้อย 1 งานที่ fallback หรือ retry จาก Phase 4F
- [ ] มี printer profile อย่างน้อย 1 รายการ

## ทดสอบ API

- [ ] เรียก `GET /api/reports/printer-bridge-health`
- [ ] ตรวจว่าเห็น `print_job_total`, `failed_total`, `fallback_total`
- [ ] ตรวจว่าเห็น `by_delivery_status`
- [ ] ตรวจว่าเห็น `by_printer_profile`
- [ ] เรียก `GET /api/reports/printer-bridge-health.csv`
- [ ] CSV เปิดอ่านได้และมี `print_job_total`

## ทดสอบ frontend

- [ ] Operations dashboard แสดง Printer bridge health chart
- [ ] เปลี่ยนช่วงวันที่แล้วตัวเลขเปลี่ยนตาม
- [ ] กด Printer CSV แล้วดาวน์โหลดไฟล์ได้
- [ ] ห้องยาดู recent problem jobs แล้วเข้าใจว่าต้อง fallback หรือ retry

## เกณฑ์ผ่าน

- [ ] IT ใช้ report ระบุ printer profile ที่มีปัญหาได้
- [ ] ห้องยาใช้ dashboard บอกสถานะ queue/failed/fallback ได้
- [ ] CSV ใช้เป็น evidence ของ printer drill ได้

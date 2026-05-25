# Phase 3B UAT Checklist

## Billing Summary

- [ ] เลือกคลินิกและโหลดหน้า Cashier ได้
- [ ] ยอด Today net ตรงกับ invoice ของวันนั้น
- [ ] ยอด Today cash ตรงกับ cash payment ของวันนั้น
- [ ] `GET /api/reports/billing-summary` ใช้ date range แล้วได้ข้อมูลถูกต้อง
- [ ] `GET /api/reports/billing-summary.csv` เปิดใน spreadsheet ได้

## Billing Number

- [ ] ตั้งเลขเอกสารชนิด receipt ได้
- [ ] ออกเลข receipt ได้ตาม prefix/padding
- [ ] ออกเลขครั้งถัดไปแล้วเลขเพิ่มขึ้น
- [ ] กรณียังไม่ตั้งเลข ระบบแจ้งว่าไม่มี active sequence

## Cashier Reconciliation

- [ ] เปิดรอบเงินสดด้วย opening cash ได้
- [ ] ปิดรอบเงินสดด้วย counted cash ได้
- [ ] expected cash = opening cash + cash payment ของวันนั้น
- [ ] variance = counted cash - expected cash
- [ ] รอบที่ปิดแล้วไม่ควรถูกปิดซ้ำ

## Sign-off

- [ ] ทีมหน้าเคาน์เตอร์ยืนยัน workflow ใช้งานได้
- [ ] ทีมบัญชียืนยัน CSV ใช้งานต่อได้
- [ ] ข้อความบนหน้าจอเข้าใจง่ายพอสำหรับ pilot

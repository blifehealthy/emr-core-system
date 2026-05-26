# Phase 3W UAT Checklist: Controlled Variance Approval

## เตรียมข้อมูล

- มี controlled inventory item ที่ active
- มีรอบตรวจนับ controlled drug จาก Phase 3V
- มี admin user หรือ role ที่มี `drug_catalog_write`

## กรณีทดสอบ

- เปิดรอบตรวจนับใหม่
- ปิดรอบด้วยยอดนับจริงเท่ากับ expected quantity
- ตรวจว่าสถานะเป็น `closed`
- เปิดรอบตรวจนับอีกวันที่หนึ่ง
- ปิดรอบด้วยยอดนับจริงต่างจาก expected quantity
- ตรวจว่าสถานะเป็น `pending_approval`
- เรียก `PATCH /api/controlled-substance-reconciliations/:id/approve`
- ใส่ `approvalNote`
- ตรวจว่าสถานะเปลี่ยนเป็น `closed`
- ตรวจว่ามี `approved_by_user_id`, `approved_at`, และ `approval_note`
- ตรวจ audit log action `approved`
- ทดสอบว่า role ที่ไม่มี `drug_catalog_write` approve ไม่ได้

## เกณฑ์ผ่าน

- Zero variance ปิดรอบได้ทันที
- Non-zero variance ต้องเข้า pending approval
- Approval เก็บผู้อนุมัติ เวลา และ note
- ทีมคลินิกเข้าใจว่า pending approval ยังไม่ควรถือว่าปิดส่วนต่างสมบูรณ์

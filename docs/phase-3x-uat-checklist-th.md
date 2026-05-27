# Phase 3X UAT Checklist: Approver Separation

## เตรียมข้อมูล

- มี controlled inventory item ที่ active
- มี user อย่างน้อย 2 คนที่สามารถทดสอบ workflow ได้
- มี role/admin ที่ใช้ปิดรอบและ approve ได้

## กรณีทดสอบ

- เปิด controlled reconciliation round ใหม่
- ปิดรอบด้วยยอดที่ต่างจาก expected quantity
- ตรวจว่าสถานะเป็น `pending_approval`
- ใช้ user คนเดิมที่ปิดรอบกด approve
- ตรวจว่าระบบตอบ `409` และไม่เปลี่ยนสถานะเป็น `closed`
- ใช้ user อีกคนที่มีสิทธิ์ approve
- ตรวจว่าสถานะเปลี่ยนเป็น `closed`
- ตรวจว่า `approved_by_user_id` เป็น user คนที่สอง
- ส่ง body ที่มี `approvedByUserId` ปลอม แล้วตรวจว่าระบบยังใช้ user จาก session จริง
- ตรวจ audit log action `approved`

## เกณฑ์ผ่าน

- ผู้ปิดรอบไม่สามารถ approve ส่วนต่างของตัวเองได้
- user อื่นที่มีสิทธิ์ approve ได้
- ระบบไม่เชื่อ approver ID จาก client body
- audit และข้อมูล approval อ่านย้อนกลับได้

# Phase 3U UAT Checklist: Role Permission Overrides

## เตรียมข้อมูล

- มี admin user สำหรับแก้ permission
- มี doctor/nurse/admin user สำหรับทดสอบ role
- มี clinic test ที่เปิด session auth หรือ OIDC actor resolution

## กรณีทดสอบ

- เปิดหน้า Admin แล้วตรวจว่ามี Role Permissions section
- โหลด `GET /api/role-permissions?clinicId=...` แล้วเห็น permission matrix
- เพิ่ม override ให้ nurse ใช้ `prescription_write = true`
- login เป็น nurse แล้วทดสอบ route ที่ต้องใช้ `prescription_write`
- เพิ่ม override ให้ doctor ใช้ `patient_read = false`
- login เป็น doctor แล้วทดสอบว่า patient detail ถูกปฏิเสธ
- ตรวจ audit log ว่ามี `role_permission_override` action `updated`
- ลบหรือกลับค่า override แล้วตรวจว่าพฤติกรรมกลับมาตาม default

## เกณฑ์ผ่าน

- ไม่มี override แล้วระบบใช้ค่า default เดิม
- override grant/deny มีผลกับ actor ที่ resolve จาก DB
- ทีมคลินิกเข้าใจว่าการแก้ permission ส่งผลกับทั้ง role ในคลินิกนั้น

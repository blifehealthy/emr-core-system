# สรุป Phase 2G สำหรับเจ้าของคลินิกและผู้ดูแลระบบ

Phase 2G เพิ่มความพร้อมด้าน operation ของระบบ identity โดยเน้น audit และ runbook สำหรับเหตุการณ์ login/token/permission ที่ผิดปกติ

## เป้าหมาย

- ให้ผู้ดูแลระบบเห็นเหตุการณ์ auth failure และ authorization failure ใน audit log
- มีแนวทางรับมือเมื่อ token, JWKS, MFA, หรือ permission มีปัญหา
- ทำให้การเตรียม pilot มีขั้นตอนตรวจสอบด้าน identity ชัดเจนขึ้น

## สิ่งที่ทำได้แล้ว

### Security Audit

ระบบจะบันทึก audit log ประเภท `security_event` เมื่อ API ตอบ:

- `401` เป็น action `auth_failed`
- `403` เป็น action `authorization_failed`

ข้อมูลที่เก็บใน metadata:

- method
- path
- status
- error
- OIDC subject ถ้ามี
- role ถ้ามี

### Login Audit เดิมยังอยู่

หน้า login/session ยังใช้ audit เฉพาะของตัวเอง:

- `session_created`
- `session_login_failed`

เพื่อแยกเหตุการณ์ login ออกจาก security event ระดับ API

### Runbook

เพิ่มเอกสาร:

- `docs/identity-security-operations-runbook.md`

ครอบคลุม:

- ตรวจ auth/authorization failure
- รับมือ JWKS หรือ key rotation
- รับมือ MFA claim ผิด
- ตรวจ readiness ก่อน pilot/production
- แนวทาง incident response เบื้องต้น

## ผลต่อคลินิก

ผู้ใช้ปลายทางไม่ต้องเปลี่ยนวิธีใช้งาน แต่ทีม admin/operator จะมีหลักฐานมากขึ้นเมื่อตรวจปัญหา เช่น:

- token หมดอายุ
- user ไม่มีสิทธิ์พอ
- provider ส่ง subject ผิด
- role ใน EMR ไม่ตรงกับงานที่ผู้ใช้พยายามทำ

## สถานะ

Phase 2G พร้อมให้ clinic owner, admin, และ deployment operator review

งานถัดไปที่แนะนำ:

- Run UAT checklist Phase 2A-2G รวมกัน
- ทดสอบกับ identity provider จริง
- ทำ pilot go/no-go summary
- แก้เฉพาะ UAT findings ก่อนปิด Phase 2

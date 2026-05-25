# Phase 2D UAT Checklist

ใช้ checklist นี้เพื่อตรวจ production identity readiness ก่อนเลือกหรือเชื่อม identity provider จริง

## ผู้เข้าร่วม

- เจ้าของคลินิก
- Admin clinic
- ผู้ดูแลระบบ deployment
- ตัวแทนแพทย์หรือพยาบาลที่ใช้ account จริง

## OIDC Subject Binding

- Admin เปิดหน้า clinic setup ได้
- Admin เห็น field `OIDC subject` ใน user form
- Admin เพิ่ม user พร้อม `OIDC subject` ได้
- Admin แก้ `OIDC subject` ของ user ได้
- Admin ล้าง `OIDC subject` ได้เมื่อผูกผิดบัญชี
- User list แสดง subject ที่ผูกไว้

## OIDC Bearer Access

- Token ที่มี issuer/audience ถูกต้องเข้า API ได้
- Token ที่ subject ตรงกับ `users.oidc_subject` resolve เป็น user ถูกต้อง
- Role ที่ใช้จริงมาจาก EMR user record
- User inactive ไม่สามารถใช้งาน token ได้
- Token ที่ issuer/audience/signature ไม่ถูกต้องถูกปฏิเสธ

## Login Failure Audit

- Login code ผิดสำหรับ user ที่มีอยู่แล้วเกิด audit action `session_login_failed`
- Audit metadata มี username, reason, lockedUntil ถ้ามี
- Admin สามารถค้น audit log ย้อนหลังของ user ได้

## Deployment Readiness

- `npm test` ผ่าน
- `npm run api:smoke` ผ่าน
- `npm run browser:api-workflow-smoke` ผ่าน
- `npm run db:test` ผ่าน
- `PRODUCTION_READINESS_STRICT=true npm run production:check` ผ่านเมื่อเปิด OIDC config
- Operator ยืนยันค่า:
  - `AUTH_OIDC_ISSUER`
  - `AUTH_OIDC_AUDIENCE`
  - `AUTH_OIDC_HS256_SECRET`

## Provider Decision

ก่อน production จริง ให้ตอบ:

- จะใช้ identity provider ตัวใด
- provider ใช้ signing algorithm อะไร
- ต้องใช้ JWKS URL หรือไม่
- role จะอยู่ใน EMR เท่านั้น หรือ sync จาก provider บางส่วน
- role admin ต้องบังคับ MFA หรือไม่

## Sign-Off

เลือกผลลัพธ์:

- ผ่าน พร้อมเลือก provider/เริ่ม integration จริง
- ผ่านแบบมีข้อสังเกต
- ไม่ผ่าน ต้องแก้ก่อนไปต่อ

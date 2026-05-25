# สรุป Phase 2D สำหรับเจ้าของคลินิกและผู้ดูแลระบบ

Phase 2D เน้นการเตรียมระบบสำหรับเชื่อมต่อ identity provider ภายนอก เช่น OIDC/SSO ในอนาคต

## เป้าหมาย

- ให้ระบบรับ bearer token จาก identity provider ได้
- Map identity ภายนอกกลับมาเป็น user ใน EMR
- ให้ role และ practitioner context ยังอ้างอิงจากฐานข้อมูล EMR
- ให้ admin สามารถผูกบัญชีภายนอกกับ user ในระบบได้
- เพิ่ม audit เมื่อ login code ผิดสำหรับ user ที่มีอยู่

## สิ่งที่ทำได้แล้ว

### OIDC Subject Mapping

ตาราง users มี field ใหม่:

- `oidc_subject`

ค่านี้ใช้ผูก user ใน EMR กับ subject จาก identity provider

ตัวอย่าง:

- EMR username: `doctor.smoke`
- OIDC subject: `oidc:doctor.smoke`

### OIDC-Compatible Bearer Token

API สามารถรับ token ได้ 3 แบบ:

- static technical `API_TOKEN`
- internal session token จาก Phase 2C
- OIDC-compatible bearer token

เมื่อเป็น OIDC token ระบบจะอ่าน subject แล้วหา user จาก `users.oidc_subject`

### Role จากฐานข้อมูล

แม้ token จะมาจาก identity provider ระบบยังไม่ใช้ role จาก token เป็นหลัก

ระบบจะใช้ user record ใน EMR เพื่อกำหนด:

- doctor
- nurse
- admin
- practitioner id
- active/inactive status

### Admin Binding

หน้า clinic setup สามารถเพิ่มหรือแก้ `OIDC subject` ใน user form ได้

### Failed Login Audit

ถ้า user ที่มีอยู่กรอก login code ผิด ระบบจะบันทึก audit action:

- `session_login_failed`

พร้อม reason และ lockedUntil ถ้ามี lockout

## ข้อจำกัด

- การ verify OIDC ใน repo ตอนนี้ใช้ HS256 เพื่อให้ทดสอบได้โดยไม่พึ่ง network/JWKS
- ก่อน production จริง ควรเลือก identity provider แล้วพิจารณา RS256/JWKS ตาม provider นั้น
- MFA ยังเป็นงานหลังเลือก provider

## สถานะ

Phase 2D พร้อมให้ operator/clinic owner review และทำ UAT ได้

งานหลัง UAT:

- เลือก identity provider
- ตัดสินใจ policy MFA
- ทำ RS256/JWKS ถ้าจำเป็น
- ติดตั้ง monitoring และ deployment config สำหรับ pilot จริง

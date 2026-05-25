# Phase 2C UAT Checklist

ใช้ checklist นี้เพื่อตรวจ login/session workflow ก่อน pilot

## ผู้เข้าร่วม

- แพทย์
- พยาบาลหรือเจ้าหน้าที่หน้าห้องตรวจ
- Admin clinic
- ผู้ดูแลระบบ deployment

## Login

- กรอก Clinic ID, Username, Login Code แล้ว login สำเร็จ
- หลัง login ช่อง API Token ถูกเติมด้วย session token
- หลัง login แสดงชื่อผู้ใช้ที่ถูกต้อง
- User ID, role, practitioner id ถูกเติมตามข้อมูลผู้ใช้
- Logout แล้ว token และ login code ถูกล้างจากหน้าเว็บ

## Role-Based Access

- Doctor เปิดเวชระเบียนและทำ SOAP/prescription ได้
- Nurse ใช้งาน queue/check-in/intake ได้ตามสิทธิ์
- Admin เปิดหน้า clinic setup ได้
- Doctor เข้า admin user management ไม่ได้
- User inactive ไม่สามารถใช้งาน session ได้

## Workflow หลัง Login

- เปิด patient detail ได้
- โหลด queue ได้
- รับเคสและเริ่มตรวจได้
- เปิดและแก้ SOAP ได้
- เช็ก prescription safety ได้
- บันทึก prescription ที่มี warning พร้อม override reason ได้
- Export daily operations CSV ได้
- Admin upload logo และบันทึก branding ได้

## Login Security

- Login code ผิดแล้ว login ไม่สำเร็จ
- Failed login count เพิ่มในฐานข้อมูลสำหรับ user ที่มีอยู่
- ผิดเกิน policy แล้ว user ถูก lock ชั่วคราว
- Login สำเร็จแล้ว `last_login_at` ถูกบันทึก
- Login สำเร็จแล้ว failed count reset

## Deployment Readiness

- `npm test` ผ่าน
- `npm run api:smoke` ผ่าน
- `npm run browser:api-workflow-smoke` ผ่าน
- `npm run db:test` ผ่าน
- `PRODUCTION_READINESS_STRICT=true npm run production:check` ไม่มี error
- Operator ยืนยันค่า `AUTH_SESSION_SECRET`, `AUTH_LOGIN_CODE`, และ `AUTH_SESSION_TTL_MINUTES`

## Sign-Off

เลือกผลลัพธ์:

- ผ่าน พร้อม pilot
- ผ่านแบบมีข้อสังเกต
- ไม่ผ่าน ต้องแก้ก่อน pilot

ควรบันทึก:

- role ที่ยังไม่ตรงกับ workflow จริง
- ขั้นตอน login ที่ทำให้เจ้าหน้าที่สับสน
- policy lockout ที่สั้นหรือยาวเกินไป
- ความต้องการ MFA/SSO จากเจ้าของคลินิก

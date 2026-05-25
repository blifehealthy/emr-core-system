# สรุป Phase 2E สำหรับเจ้าของคลินิกและผู้ดูแลระบบ

Phase 2E ทำให้ระบบ login/identity พร้อมต่อกับผู้ให้บริการ SSO/OIDC จริงมากขึ้น โดยเพิ่มการตรวจลายเซ็น token แบบ `RS256` ด้วย public key ของ provider

## เป้าหมาย

- ให้ระบบรองรับ token จาก identity provider ที่ใช้ public/private key
- ลดการพึ่ง secret ร่วมแบบ local test เมื่อเข้าใกล้ production
- ให้ production readiness ตรวจ config OIDC ได้ตรงกับสภาพใช้งานจริงมากขึ้น
- คงการ map user ผ่าน `users.oidc_subject` จาก Phase 2D

## สิ่งที่ทำได้แล้ว

### รองรับ RS256 OIDC Token

API สามารถ verify OIDC bearer token ได้ 2 แบบ:

- `HS256` ด้วย `AUTH_OIDC_HS256_SECRET` สำหรับ local/dev/smoke test
- `RS256` ด้วย `AUTH_OIDC_RS256_PUBLIC_KEY_PEM` สำหรับ provider-grade token

เมื่อ token ผ่านการ verify ระบบยัง resolve user จากฐานข้อมูล EMR เหมือนเดิม:

- subject ใน token ต้องตรงกับ `users.oidc_subject`
- role ใช้จาก EMR user record
- practitioner context ใช้จาก EMR user record
- user ที่ inactive ยังเข้าใช้งานไม่ได้

### Production Readiness

คำสั่ง `npm run production:check` รองรับ OIDC config แบบใหม่แล้ว

เมื่อเปิด `AUTH_OIDC_ENABLED=true` ต้องมี:

- `AUTH_OIDC_ISSUER`
- `AUTH_OIDC_AUDIENCE`
- อย่างน้อยหนึ่งค่า:
  - `AUTH_OIDC_RS256_PUBLIC_KEY_PEM`
  - `AUTH_OIDC_HS256_SECRET`

สำหรับ pilot/production จริง แนะนำใช้ `AUTH_OIDC_RS256_PUBLIC_KEY_PEM`

### Test Coverage

มี test ยืนยันว่า:

- token RS256 ที่ถูกต้องผ่านได้
- signature ผิดถูกปฏิเสธ
- issuer/audience ผิดถูกปฏิเสธ
- token หมดอายุถูกปฏิเสธ
- readiness strict mode ผ่านได้เมื่อใช้ RS256 public key config

## ผลต่อการใช้งานของคลินิก

ผู้ใช้ปลายทางยังใช้งานเหมือนเดิม แต่ระบบหลังบ้านพร้อมต่อ SSO/OIDC จริงมากขึ้น

Admin ยังต้องดูแล mapping ระหว่าง user ใน EMR กับ subject ของ identity provider ให้ถูกต้องก่อน pilot จริง

## ข้อจำกัด

- ตอนนี้รองรับ public key PEM ที่ตั้งผ่าน environment variable
- ยังไม่ดึง key อัตโนมัติจาก JWKS URL
- MFA policy ยังต้องกำหนดร่วมกับ identity provider ที่เลือกจริง
- ต้องเลือก provider ก่อนจะปิดงาน JWKS/MFA เชิง production ได้สมบูรณ์

## สถานะ

Phase 2E พร้อมให้เจ้าของคลินิกและ operator review ได้

งานถัดไปที่แนะนำ:

- เลือก identity provider จริง
- ขอ issuer, audience, public key หรือ JWKS URL จาก provider
- ตัดสินใจ MFA policy สำหรับ admin/doctor
- ทำ Phase 2F เป็น provider integration เฉพาะราย พร้อม JWKS cache และ MFA claim policy

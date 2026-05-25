# Phase 2E UAT Checklist

ใช้ checklist นี้เพื่อตรวจ readiness ของ OIDC/SSO signing ก่อนเลือกหรือเชื่อม provider จริง

## ผู้เข้าร่วม

- เจ้าของคลินิก
- Admin clinic
- ผู้ดูแล deployment
- ตัวแทนแพทย์หรือพยาบาลที่มี account จริง
- ตัวแทน vendor หรือผู้ดูแล identity provider ถ้ามี

## OIDC Config Review

- ยืนยันค่า `AUTH_OIDC_ISSUER`
- ยืนยันค่า `AUTH_OIDC_AUDIENCE`
- ยืนยันว่าจะใช้ `RS256` สำหรับ pilot/production
- ยืนยัน public key PEM หรือแนวทาง JWKS URL จาก provider
- ยืนยันว่า secret แบบ `HS256` ใช้เฉพาะ local/dev/smoke test

## Token Verification

- Token RS256 ที่ issuer/audience ถูกต้องเข้า API ได้
- Token ที่ subject ตรงกับ `users.oidc_subject` resolve เป็น user ถูกต้อง
- Token ที่ signature ผิดถูกปฏิเสธ
- Token ที่ issuer ผิดถูกปฏิเสธ
- Token ที่ audience ผิดถูกปฏิเสธ
- Token หมดอายุถูกปฏิเสธ
- User inactive ไม่สามารถใช้งาน token ได้

## User Mapping

- Admin ตรวจ `OIDC subject` ของ user สำคัญครบ
- Doctor account ผูก subject ถูกคน
- Nurse account ผูก subject ถูกคน
- Admin account ผูก subject ถูกคน
- ล้างหรือแก้ subject ที่ผูกผิดได้
- Role ที่ใช้จริงยังมาจาก EMR user record

## Production Readiness Gate

- `npm test` ผ่าน
- `npm run api:smoke` ผ่าน
- `PRODUCTION_READINESS_STRICT=true npm run production:check` ผ่านเมื่อเปิด OIDC config
- readiness ไม่ผ่านถ้าเปิด OIDC แต่ไม่มี issuer/audience
- readiness ไม่ผ่านถ้าเปิด OIDC แต่ไม่มีทั้ง RS256 public key และ HS256 secret

## MFA Policy Decision

ก่อน pilot จริง ให้ตอบ:

- Admin ต้องเปิด MFA ทุกคนหรือไม่
- Doctor ต้องเปิด MFA ทุกคนหรือเฉพาะนอกคลินิก
- Nurse/reception ต้องเปิด MFA หรือไม่
- Provider ส่ง MFA status claim ใดมาให้ระบบตรวจได้
- ถ้าไม่มี MFA claim จะให้ EMR reject token หรือใช้ policy ภายนอกเท่านั้น

## Sign-Off

เลือกผลลัพธ์:

- ผ่าน พร้อมเลือก provider และทำ JWKS/MFA integration ต่อ
- ผ่านแบบมีข้อสังเกต
- ไม่ผ่าน ต้องแก้ config หรือ mapping ก่อน pilot

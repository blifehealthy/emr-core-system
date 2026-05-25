# Phase 2F UAT Checklist

ใช้ checklist นี้ทดสอบ JWKS และ MFA claim policy ก่อน pilot/production

## ผู้เข้าร่วม

- เจ้าของคลินิก
- Admin clinic
- ผู้ดูแล deployment
- ผู้ดูแล identity provider หรือ vendor
- ตัวแทน doctor/admin account จริง

## JWKS Config

- ตั้ง `AUTH_OIDC_ISSUER` ถูกต้อง
- ตั้ง `AUTH_OIDC_AUDIENCE` ถูกต้อง
- ตั้ง `AUTH_OIDC_JWKS_URL` เป็น HTTPS
- ตั้ง `AUTH_OIDC_JWKS_CACHE_TTL_SECONDS` ในช่วง 60-86400 วินาที
- API start ได้และโหลด JWKS สำเร็จ
- Token ที่มี `kid` ตรงกับ JWKS ผ่านได้
- Token ที่ `kid` ไม่รู้จักถูกปฏิเสธ

## MFA Claim Policy

- ยืนยันชื่อ claim ที่ provider ส่ง เช่น `acr` หรือ `amr`
- ยืนยันค่าที่แปลว่าผ่าน MFA เช่น `urn:mfa` หรือ `mfa`
- ตั้ง `AUTH_OIDC_MFA_REQUIRED=true` เมื่อต้องการบังคับ
- ตั้ง `AUTH_OIDC_MFA_CLAIM`
- ตั้ง `AUTH_OIDC_MFA_VALUES`
- Token ที่ผ่าน MFA เข้า API ได้
- Token ที่ login ด้วย password อย่างเดียวถูกปฏิเสธเมื่อเปิด policy

## User Mapping

- Doctor account มี `OIDC subject` ตรงกับ provider
- Admin account มี `OIDC subject` ตรงกับ provider
- User inactive ถูกปฏิเสธแม้ token ถูกต้อง
- Role ที่ใช้จริงยังมาจาก EMR user record

## Production Readiness

- `npm test` ผ่าน
- `npm run api:smoke` ผ่าน
- `PRODUCTION_READINESS_STRICT=true npm run production:check` ผ่าน
- readiness fail เมื่อ JWKS URL ไม่ใช่ HTTPS
- readiness fail เมื่อเปิด MFA required แต่ไม่มี claim/value config

## Sign-Off

เลือกผลลัพธ์:

- ผ่าน พร้อมทำ provider deployment runbook
- ผ่านแบบมีข้อสังเกต
- ไม่ผ่าน ต้องแก้ provider config, mapping, หรือ MFA policy ก่อน pilot

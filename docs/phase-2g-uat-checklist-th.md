# Phase 2G UAT Checklist

ใช้ checklist นี้ตรวจ security operations ก่อน pilot

## ผู้เข้าร่วม

- เจ้าของคลินิก
- Admin clinic
- ผู้ดูแล deployment
- ผู้ดูแล identity provider หรือ vendor
- ตัวแทน doctor/nurse/admin account จริง

## Security Audit

- เรียก API โดยไม่มี bearer token แล้วได้ `401`
- Audit log มี `entity_type=security_event`
- Audit action เป็น `auth_failed`
- Metadata มี method, path, status, error
- เรียก API ด้วย role ที่ไม่มีสิทธิ์ แล้วได้ `403`
- Audit action เป็น `authorization_failed`
- Metadata มี role และ path ที่ถูกปฏิเสธ
- หน้า audit lookup สามารถค้น security event ได้

## Identity Provider Incidents

- Token หมดอายุถูกปฏิเสธและมี audit
- Token ที่ `kid` ไม่รู้จักถูกปฏิเสธและมี audit
- User inactive ถูกปฏิเสธและมี audit
- MFA claim ไม่ผ่านถูกปฏิเสธและมี audit

## Operator Runbook

- Operator เปิด `docs/identity-security-operations-runbook.md` ได้
- Operator อธิบายขั้นตอนตรวจ JWKS/key rotation ได้
- Operator อธิบายขั้นตอนตรวจ MFA claim ได้
- Operator อธิบายขั้นตอนตรวจ repeated 401/403 ได้
- Operator รู้ว่าใครเป็น incident owner และ provider contact

## Go / No-Go

- `npm test` ผ่าน
- `npm run api:smoke` ผ่าน
- `PRODUCTION_READINESS_STRICT=true npm run production:check` ผ่าน
- Provider UAT ผ่านหรือมีรายการแก้ชัดเจน
- มี downtime/manual fallback สำหรับวัน pilot

## Sign-Off

เลือกผลลัพธ์:

- ผ่าน พร้อมเข้าสู่ Phase 2 pilot closure
- ผ่านแบบมีข้อสังเกต
- ไม่ผ่าน ต้องแก้ audit, provider config, หรือ operator runbook ก่อน pilot

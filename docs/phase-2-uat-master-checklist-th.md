# Phase 2 Master UAT Checklist

ใช้เอกสารนี้เป็น checklist รวมสำหรับ Phase 2A-2G ก่อนตัดสินใจ pilot

## ผู้เข้าร่วม

- แพทย์เจ้าของ flow ตรวจ
- พยาบาลหรือเจ้าหน้าที่หน้าห้องตรวจ
- เจ้าหน้าที่ลงทะเบียน/หน้าเคาน์เตอร์
- Admin clinic
- Deployment operator
- Identity provider/vendor contact ถ้าใช้ SSO/OIDC

## Clinic Flow

- ลงทะเบียน patient ใหม่ได้
- ค้น patient เดิมได้
- สร้าง appointment ได้
- reschedule appointment ได้
- check-in appointment แล้วเกิด visit/queue ได้
- claim/reassign queue ได้
- เริ่ม encounter/SOAP จาก queue ได้
- เปิด patient record จาก queue ได้
- update encounter status ได้ตาม rule
- finalize/sign note ได้ตาม role

## Clinical Documentation

- กรอก SOAP ได้
- เปิด SOAP เดิมได้
- แก้ SOAP เดิมได้
- ใช้ SOAP template ได้
- เพิ่ม diagnosis ได้
- เพิ่ม vital signs ได้
- ดู patient timeline ได้
- soft delete clinical child records ได้เมื่อจำเป็น

## Medication Safety

- เลือกยาจาก drug catalog ได้
- allergy warning แสดงถูกต้อง
- interaction warning แสดงถูกต้อง
- override reason ถูกบังคับเมื่อยังสั่งยาต่อ
- warning snapshot ถูกเก็บกับ prescription
- prescription print/export แสดง branding ถูกต้อง

## Clinic Admin

- เพิ่ม/แก้/deactivate user ได้
- เพิ่ม/แก้/deactivate practitioner ได้
- duplicate user/practitioner แสดงข้อความเข้าใจง่าย
- ตั้งค่า clinic branding ได้
- upload/link logo ได้
- ค้น audit log ได้
- สร้าง/แก้/deactivate SOAP template ได้
- จัดการ drug catalog และ interaction rules ได้

## Reports

- daily operations report แสดง visit totals ได้
- provider workload อ่านได้
- room workload อ่านได้
- top diagnosis อ่านได้
- CSV export เปิดใช้งานได้

## Identity And Access

- pilot session login ใช้งานได้
- invalid login code ถูกบันทึก audit
- inactive user เข้าไม่ได้
- OIDC subject mapping ถูกต้อง
- RS256/JWKS token ผ่านได้เมื่อ config ถูกต้อง
- unknown `kid` ถูก reject
- MFA claim policy reject token ที่ไม่ผ่าน MFA
- `401`/`403` เกิด `security_event` audit

## Deployment Readiness

- `npm test` ผ่าน
- `npm run api:smoke` ผ่าน
- `npm run browser:api-workflow-smoke` ผ่านเมื่อ environment รองรับ
- `npm run storage:check` ผ่าน
- `PRODUCTION_READINESS_STRICT=true npm run production:check` ผ่าน
- backup plan มี owner
- restore drill ผ่าน
- identity incident owner ถูกกำหนด
- downtime/manual fallback ถูกตกลง

## Sign-Off Result

เลือกหนึ่งข้อ:

- ผ่าน พร้อม pilot
- ผ่านแบบมีข้อสังเกต แต่ไม่มี blocker
- ไม่ผ่าน ต้องแก้ blocker ก่อน pilot

บันทึกผลไว้ใน:

- `docs/phase-2-pilot-go-no-go-th.md`

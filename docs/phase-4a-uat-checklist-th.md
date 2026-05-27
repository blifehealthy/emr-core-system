# Phase 4A UAT Checklist: Production Readiness And Ops Drill

## ผู้ทดสอบ

- Operator/IT
- Clinic owner/admin
- Pharmacy lead
- Cashier/accounting lead
- Lead doctor

## Automated Checks

- [ ] `npm test` ผ่าน
- [ ] `npm run storage:check` ผ่าน
- [ ] `PRODUCTION_READINESS_STRICT=true npm run production:check` ผ่าน
- [ ] `npm run frontend:workflow-smoke` ผ่าน
- [ ] `npm run api:smoke` ผ่าน
- [ ] `npm run ops:check` ผ่านใน strict mode หลังบันทึก evidence

## Manual Drills

- [ ] Restore database backup ใน non-production ได้
- [ ] Restore file storage ใน non-production ได้
- [ ] เปิด sample patient จาก restored environment ได้
- [ ] Download sample file asset จาก restored storage ได้
- [ ] Rollback deployment ใน non-production ได้
- [ ] Security incident tabletop เสร็จ
- [ ] Monitoring owner รับทราบ alert path
- [ ] Backup owner รับทราบ backup/restore path
- [ ] Incident owner รับทราบ escalation path
- [ ] Deployment owner รับทราบ go/no-go และ rollback authority

## Go-Live Evidence

| Evidence | Owner | Result | Link/Notes |
| --- | --- | --- | --- |
| Production readiness check | TBD | TBD | TBD |
| Storage check | TBD | TBD | TBD |
| API smoke | TBD | TBD | TBD |
| Frontend smoke | TBD | TBD | TBD |
| Backup restore drill | TBD | TBD | TBD |
| Rollback drill | TBD | TBD | TBD |
| Security incident drill | TBD | TBD | TBD |
| Go-live window | TBD | TBD | TBD |

## เกณฑ์ผ่าน

- ไม่มี error จาก strict readiness หรือ ops drill check
- Restore drill มีหลักฐานและเวลาที่ใช้
- Rollback drill มี owner และขั้นตอนชัดเจน
- Incident drill ระบุคนตัดสินใจและช่องทางสื่อสาร
- Clinic owner ยอมรับ known risk ก่อน pilot

# Pilot Launch Checklist

ใช้ตรวจความพร้อมก่อนเริ่ม pilot, ระหว่างวันแรก, และหลังจบวันแรก

## 3-5 วันก่อน Pilot

| Checklist | Owner | Result | Note |
| --- | --- | --- | --- |
| UAT execution checklist ผ่านตาม exit criteria | UAT lead | | |
| ไม่มี blocker ค้าง | Owner | | |
| High severity มี fix หรือ accepted workaround | Owner | | |
| Go/no-go decision ถูกบันทึก | Owner | | |
| Production readiness strict ผ่าน | IT | | |
| Storage check ผ่านกับ persistent path | IT | | |
| API/browser smoke ผ่านใน target-like environment | IT | | |
| Backup/restore drill มีหลักฐาน | IT | | |
| Rollback drill มีหลักฐาน | IT | | |
| Incident tabletop มีหลักฐาน | IT/Owner | | |
| คู่มือผู้ใช้ถูกส่งให้ทุก role | UAT lead | | |

## 1 วันก่อน Pilot

| Checklist | Owner | Result | Note |
| --- | --- | --- | --- |
| ยืนยัน commit/build สุดท้าย | IT | | |
| database backup ก่อนเริ่ม | IT | | |
| file assets backup ก่อนเริ่ม | IT | | |
| users/roles พร้อม | Admin | | |
| printer/scanner พร้อมหรือมี fallback | IT/Pharmacy | | |
| defect tracker เปิดใช้งาน | UAT lead | | |
| ช่องทางสื่อสาร incident พร้อม | Owner/IT | | |
| manual fallback forms/process พร้อม | Clinic lead | | |

## วัน Pilot

| Checklist | Owner | Result | Note |
| --- | --- | --- | --- |
| IT/Ops standby | IT | | |
| Clinical lead standby | Doctor lead | | |
| Pharmacy lead standby | Pharmacy | | |
| Billing lead standby | Billing | | |
| Monitoring/log review รอบแรก | IT | | |
| Backup health checked | IT | | |
| Printer bridge health checked | IT/Pharmacy | | |
| Defect triage รอบกลางวัน | UAT lead | | |
| Defect triage ก่อนปิดวัน | UAT lead | | |

## หลังจบวันแรก

| Checklist | Owner | Result | Note |
| --- | --- | --- | --- |
| สรุป defect by severity | UAT lead | | |
| ตรวจ billing/cashier totals | Billing | | |
| ตรวจ pharmacy stock/controlled logs | Pharmacy | | |
| ตรวจ audit log spot check | Admin/IT | | |
| ตรวจ backup หลังใช้งาน | IT | | |
| ตัดสิน continue/pause/rollback | Owner | | |

## Continue Criteria

- ไม่มี blocker ใหม่
- billing และ stock ไม่มี discrepancy สำคัญ
- clinical workflow ไม่ block การตรวจ
- IT ยืนยัน backup/monitoring/rollback ยังพร้อม
- role owner เห็นด้วยให้ไปต่อ

## Pause Or Rollback Criteria

- เปิด/บันทึกเวชระเบียนไม่ได้
- SOAP/note/signing ทำให้ workflow ตรวจหยุด
- billing/payment ผิดโดยไม่มี workaround
- pharmacy stock หรือ controlled-drug audit ผิด
- auth/privacy incident
- backup/restore path ไม่พร้อม
- printer/scanner ล่มและ fallback ใช้ไม่ได้

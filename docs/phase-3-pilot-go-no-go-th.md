# Phase 3 Pilot Go/No-Go

เอกสารนี้ใช้ตัดสินใจหลัง Phase 3 UAT

## Decision Summary

| Item | Value |
| --- | --- |
| Decision date | TBD |
| Clinic/site | TBD |
| Decision | TBD |
| Approver | TBD |
| Notes | TBD |

Decision options:

- `Go`: พร้อม pilot
- `Conditional Go`: พร้อม pilot โดยมีเงื่อนไขและ fallback
- `No-Go`: ต้องแก้ blocker ก่อน

## Required Evidence

- Phase 3 Master UAT checklist completed
- Billing/cashier workflow signed off
- Pharmacy inventory workflow signed off
- Controlled drug governance signed off
- Admin/permission workflow signed off
- API smoke passed in target-like environment
- Frontend workflow smoke passed
- Production readiness check passed
- Backup/restore drill reviewed
- Known risks accepted by clinic owner

## Go Criteria

- ไม่มี blocker ที่กระทบความปลอดภัยคนไข้
- ไม่มี blocker ที่ทำให้ยอดเงิน/สต็อกผิดโดยไม่มีทางตรวจย้อน
- Controlled drug workflow มีผู้รับผิดชอบ review ชัดเจน
- ผู้ใช้หลักเข้าใจ workflow และ fallback
- Operator รู้วิธี backup, restore, monitor, และ rollback

## Conditional Go Criteria

ใช้ได้เมื่อมี issue ที่ไม่ปิดกั้น pilot เช่น:

- ต้องปรับ wording บางจุด
- ต้องเพิ่ม report export เพิ่มเติมภายหลัง
- ต้องมี printer bridge จริงใน Phase 4 แต่ยังใช้ export/manual print ได้
- ต้องทำ integration accounting/payer ภายหลัง แต่ workflow manual ยังรองรับ

## No-Go Criteria

หยุด pilot ถ้ามีข้อใดข้อหนึ่ง:

- ข้อมูลคนไข้หรือ prescription แสดงผิด role/clinic
- Payment/refund/void ตรวจย้อนยอดไม่ได้
- Stock movement ผิดและแก้ audit ไม่ได้
- Controlled drug dispense/reconciliation ไม่ผ่าน review
- Login/authorization มีช่องให้ role ที่ไม่ควรเข้าถึงข้อมูลสำคัญ
- Backup/restore ยังไม่พร้อมใน target environment

## Open Risks

| Risk | Severity | Owner | Mitigation | Decision |
| --- | --- | --- | --- | --- |
| TBD | TBD | TBD | TBD | TBD |

## Phase 4 Candidates

รายการต่อไปนี้ไม่ควรยัดกลับเข้า Phase 3 เว้นแต่ UAT ระบุเป็น blocker:

- per-lot controlled reconciliation count
- controlled reconciliation witness/re-auth
- multi-step variance approval
- direct printer bridge
- GS1 barcode parsing
- accounting export
- payer/insurer export
- supplier payment handoff
- notification integration
- production monitoring alert integration

## Final Sign-off

| Role | Name | Sign-off | Date |
| --- | --- | --- | --- |
| Clinic owner | TBD | TBD | TBD |
| Lead doctor | TBD | TBD | TBD |
| Pharmacy lead | TBD | TBD | TBD |
| Cashier/accounting lead | TBD | TBD | TBD |
| Operator/IT | TBD | TBD | TBD |

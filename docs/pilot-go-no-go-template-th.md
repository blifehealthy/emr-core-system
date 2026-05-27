# Pilot Go/No-Go Decision Template

ใช้หลัง UAT/drill จริงเสร็จ เพื่อบันทึกการตัดสินใจ pilot

## ข้อมูลการตัดสินใจ

| รายการ | ค่า |
| --- | --- |
| Decision date | |
| Clinic/site | |
| Environment/build | |
| Commit | |
| Pilot window | |
| Decision owner | |
| Clinical owner | |
| Pharmacy owner | |
| Billing owner | |
| IT/Ops owner | |

## Decision

เลือกหนึ่งข้อ:

- [ ] Go
- [ ] Conditional Go
- [ ] No-Go

เหตุผล:

```text

```

## Evidence Summary

| Area | Result | Evidence link/note |
| --- | --- | --- |
| Clinical workflow | | |
| Pharmacy/inventory | | |
| Billing/cashier | | |
| Controlled substances | | |
| Barcode/scanner/printer | | |
| Security/privacy | | |
| Production readiness | | |
| Backup/restore drill | | |
| Rollback drill | | |
| Incident tabletop | | |

## Defect Summary

| Severity | Open | Accepted/deferred | Closed |
| --- | --- | --- | --- |
| Blocker | | | |
| High | | | |
| Medium | | | |
| Low | | | |

## Conditions For Pilot

| Condition | Owner | Due date | Status |
| --- | --- | --- | --- |
| | | | |

## Rollback Trigger

ให้ rollback หรือ pause pilot ถ้าเกิดอย่างใดอย่างหนึ่ง:

- clinical documentation ใช้งานไม่ได้ระหว่างตรวจจริง
- billing/payment total ผิดและไม่มี workaround
- pharmacy stock/controlled drug audit ผิด
- auth/security incident ที่กระทบข้อมูลผู้ป่วย
- backup/restore หรือ rollback process ใช้งานไม่ได้
- hardware printer/scanner failure ไม่มี manual fallback

## Sign-Off

| Role | Name | Decision | Date |
| --- | --- | --- | --- |
| Clinic owner | | | |
| Doctor lead | | | |
| Nurse/front desk lead | | | |
| Pharmacy lead | | | |
| Cashier/accounting lead | | | |
| IT/Ops lead | | | |

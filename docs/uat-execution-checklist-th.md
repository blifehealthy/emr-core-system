# UAT Execution Checklist

ใช้ checklist นี้ในวันทดสอบ UAT จริง ตั้งแต่ Phase 1 ถึง Phase 4G  
ผลที่ใช้ได้: `Pass`, `Fail`, `Blocked`, `Not tested`

## ข้อมูลรอบทดสอบ

| รายการ | ค่า |
| --- | --- |
| วันที่ทดสอบ | |
| Environment | |
| Commit/build | |
| Clinic/site | |
| UAT lead | |
| Clinical lead | |
| Pharmacy lead | |
| Billing lead | |
| IT/Ops lead | |

## ก่อนเริ่ม UAT

| Checklist | Owner | Result | Evidence/Note |
| --- | --- | --- | --- |
| ยืนยัน commit/build ที่จะทดสอบ | IT | | |
| Database และ file storage เป็น environment ทดสอบ/target-like | IT | | |
| Test users แยกตาม role พร้อมใช้งาน | IT/Admin | | |
| Test patients และ test inventory พร้อม | Admin/Pharmacy | | |
| Printer/scanner พร้อมหรือมี simulator/fallback | IT/Pharmacy | | |
| เปิด defect tracker | UAT lead | | |
| ตกลง severity และ go/no-go criteria | UAT lead/Owner | | |

## Clinical Workflow

| Scenario | Owner | Result | Evidence/Note |
| --- | --- | --- | --- |
| Login ด้วย user role หมอ/พยาบาลได้ | Clinical | | |
| ลงทะเบียนผู้ป่วยใหม่ได้ | Front desk | | |
| ค้นหา patient record ด้วย HN ได้ | Clinical | | |
| เห็น flags/allergies/conditions/medications ถูกต้อง | Doctor/Nurse | | |
| สร้าง appointment ได้ | Front desk | | |
| Check-in appointment แล้วเกิด visit/queue | Front desk | | |
| Claim/reassign queue ได้ | Nurse/Doctor | | |
| Start encounter จาก queue ได้ | Doctor | | |
| เขียน SOAP ใหม่ได้ | Doctor | | |
| เปิดและแก้ SOAP เดิมได้ | Doctor | | |
| เพิ่ม diagnosis/vital sign ได้ | Doctor/Nurse | | |
| Finalize/sign note ได้ | Doctor | | |
| ปิด encounter/visit ได้ | Doctor/Nurse | | |
| Daily operations report แสดงตัวเลขเข้าใจได้ | Admin/Owner | | |

## Pharmacy & Inventory

| Scenario | Owner | Result | Evidence/Note |
| --- | --- | --- | --- |
| Drug catalog ค้นหา/สร้าง/แก้ไขได้ | Pharmacy | | |
| Allergy/interaction warning แสดงตอนสั่งยา | Doctor/Pharmacy | | |
| Override reason ถูกบังคับเมื่อมี warning | Doctor | | |
| Dispense prescription แล้ว stock ลด | Pharmacy | | |
| Receive stock เข้า lot/expiry ได้ | Pharmacy | | |
| Location/bin stock แสดงถูกต้อง | Pharmacy | | |
| Transfer stock approve/receive/cancel ได้ตามสิทธิ์ | Pharmacy/Admin | | |
| FEFO/expiry guard block ตามกฎ | Pharmacy | | |
| Pharmacy override report แสดงเหตุผล override | Pharmacy/Owner | | |
| Controlled item flag ใช้งานได้ | Pharmacy | | |
| Controlled dispense ต้องมี witness/re-auth | Pharmacy | | |
| Controlled reconciliation close/approve ได้ | Pharmacy/Owner | | |
| Approver separation ใช้งานจริง | Pharmacy/Owner | | |

## Barcode, Scanner, Printer

| Scenario | Owner | Result | Evidence/Note |
| --- | --- | --- | --- |
| Scan barcode ปกติแล้ว match item/lot | Pharmacy | | |
| Scan GS1 แล้วเห็น GTIN/expiry/lot/serial | Pharmacy | | |
| Scanner keep focus/clear-after-scan ใช้งานได้ | Pharmacy | | |
| สร้าง label template ได้ | Pharmacy/Admin | | |
| Export ZPL/ESC/POS ได้ | Pharmacy/IT | | |
| Printer profile สร้างและเลือกได้ | IT/Pharmacy | | |
| Bridge queue list งาน queued ได้ | IT | | |
| Bridge ack printing/delivered ได้ | IT | | |
| Bridge ack failed พร้อม error ได้ | IT | | |
| Browser/manual fallback ใช้งานได้ | Pharmacy/IT | | |
| Retry queue หลัง printer กลับมาได้ | Pharmacy/IT | | |
| Printer bridge health report/CSV อ่านได้ | IT/Owner | | |

## Billing & Cashier

| Scenario | Owner | Result | Evidence/Note |
| --- | --- | --- | --- |
| สร้าง invoice จาก encounter ได้ | Cashier | | |
| เพิ่ม/แก้ line item ได้ | Cashier | | |
| Payment ทำให้ยอด paid/balance ถูกต้อง | Cashier | | |
| Refund บันทึกยอดและ audit ถูกต้อง | Cashier | | |
| Void invoice ต้องมีเหตุผล | Cashier/Admin | | |
| Receipt/tax invoice number ถูกต้อง | Cashier/Accounting | | |
| Cashier reconciliation ใช้งานได้ | Cashier/Accounting | | |
| Billing summary CSV เปิดใน spreadsheet ได้ | Accounting | | |

## Admin, Security, Privacy

| Scenario | Owner | Result | Evidence/Note |
| --- | --- | --- | --- |
| User/practitioner CRUD ใช้งานได้ | Admin | | |
| Deactivate/reactivate user ได้ | Admin | | |
| Role permission override ใช้งานได้ | Admin/Owner | | |
| Audit log ค้นหา action สำคัญได้ | Admin/IT | | |
| Clinic settings/logo บันทึกได้ | Admin | | |
| API token/session secret ตั้งใน target env | IT | | |
| File upload MIME/size policy ถูกต้อง | IT | | |
| Report/export access จำกัดตาม role | Admin/Owner | | |
| Incident owner และ escalation path ชัดเจน | IT/Owner | | |

## Ops & Deployment Drill

| Scenario | Owner | Result | Evidence/Note |
| --- | --- | --- | --- |
| `PRODUCTION_READINESS_STRICT=true npm run production:check` ผ่าน | IT | | |
| `npm run storage:check` ผ่านกับ persistent storage | IT | | |
| `npm run api:smoke` ผ่านกับ target-like DB/API | IT | | |
| Browser smoke/manual browser checklist ผ่าน | IT/UAT lead | | |
| Backup database สำเร็จ | IT | | |
| Restore database สำเร็จ | IT | | |
| Backup/restore file assets สำเร็จ | IT | | |
| Rollback drill สำเร็จ | IT | | |
| Security incident tabletop สำเร็จ | IT/Owner | | |
| Monitoring/backup/incident/deployment owners ถูกกำหนด | Owner | | |

## Defect Review

| Severity | Open count | Must fix before pilot? | Owner/Decision |
| --- | --- | --- | --- |
| Blocker | | Yes | |
| High | | Yes or accepted workaround | |
| Medium | | Case by case | |
| Low | | No | |

## UAT Exit Decision

เลือกหนึ่งข้อ:

- [ ] Ready for pilot
- [ ] Conditional pilot after listed fixes
- [ ] Not ready

เหตุผล:

```text

```

## Sign-Off

| Role | Name | Decision | Date | Signature/Note |
| --- | --- | --- | --- | --- |
| Clinic owner | | | | |
| Doctor lead | | | | |
| Nurse/front desk lead | | | | |
| Pharmacy lead | | | | |
| Billing/accounting lead | | | | |
| IT/Ops lead | | | | |

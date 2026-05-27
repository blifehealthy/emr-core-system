# Pilot UAT Pack

ใช้เอกสารนี้เป็นชุดทดสอบ UAT จริงสำหรับ Phase 1 ถึง Phase 4G หลังจาก
simulated review ผ่านแล้ว

## วิธีใช้

1. กำหนดวันทดสอบ, ผู้รับผิดชอบ, และ clinic/test environment
2. ให้แต่ละ role ทดสอบเฉพาะส่วนของตน
3. บันทึกผลเป็น `Pass`, `Fail`, `Blocked`, หรือ `Not tested`
4. ถ้าพบปัญหาให้บันทึกใน `docs/pilot-defect-tracker-th.md`
5. หลัง retest ให้สรุป go/no-go ใน `docs/pilot-go-no-go-template-th.md`

## ข้อมูลก่อนเริ่ม

| รายการ | ค่า |
| --- | --- |
| วันที่ UAT | |
| Environment | |
| Clinic ID | |
| Build/commit | |
| ผู้ประสานงาน | |
| ผู้ตัดสินใจ go/no-go | |

## หมอ/พยาบาล

| Scenario | Expected result | Result | Note |
| --- | --- | --- | --- |
| Login และเปิด patient record | เห็นข้อมูลผู้ป่วยถูกคน | | |
| ลงทะเบียนผู้ป่วยใหม่ | สร้าง HN/ข้อมูลพื้นฐานครบ | | |
| ค้นหา patient detail | เห็น flags/allergies/conditions/medications | | |
| สร้าง appointment | appointment อยู่ใน timeline/list | | |
| Check-in appointment | visit/queue ถูกสร้างและ status ถูกต้อง | | |
| Claim/reassign queue | provider/room แสดงถูกต้อง | | |
| Start encounter/SOAP | encounter และ SOAP note ถูกสร้าง | | |
| แก้ SOAP เดิม | subjective/objective/assessment/plan บันทึกได้ | | |
| Finalize/sign note | note status เปลี่ยนถูกต้อง | | |
| End encounter/visit | status ปิด workflow ได้ | | |
| Daily operations report | ตัวเลข visit/Dx/Rx พอใช้ตรวจงานรายวัน | | |

## เภสัช/ห้องยา

| Scenario | Expected result | Result | Note |
| --- | --- | --- | --- |
| สร้าง/แก้ drug catalog | รายการยา active และค้นหาได้ | | |
| Prescribe พร้อม allergy/interaction warning | warning แสดงและต้องมี override reason เมื่อจำเป็น | | |
| Dispense prescription | stock ลดและ dispense audit ถูกสร้าง | | |
| Receive stock เป็น lot/expiry | lot และ movement แสดงถูกต้อง | | |
| Transfer stock ระหว่าง location/bin | approve/receive/cancel ทำงานตามสิทธิ์ | | |
| FEFO/expiry guard | lot หมดอายุหรือไม่ FEFO ถูก block เว้นมี reason | | |
| Controlled dispense witness/re-auth | witness คนละคนและ login code ถูกตรวจ | | |
| Controlled reconciliation | close/approve แยกคนตาม rule | | |
| Scan barcode ปกติ | matched/not matched ถูกต้อง | | |
| Scan GS1 barcode | GTIN/expiry/lot/serial แสดงถูกต้อง | | |
| Label template | layout เหมาะกับ item/lot/bin จริง | | |
| Printer bridge queue | queued/printing/delivered/failed ถูกต้อง | | |
| Print fallback/retry | browser/manual fallback และ retry audit ถูกต้อง | | |
| Printer health report | เห็น failed/fallback/retry และ export CSV ได้ | | |

## บัญชี/แคชเชียร์

| Scenario | Expected result | Result | Note |
| --- | --- | --- | --- |
| สร้าง invoice จาก encounter | line items และยอดรวมถูกต้อง | | |
| เพิ่ม/แก้ line item | subtotal/discount/tax/net ถูกต้อง | | |
| Record payment | paid/balance status ถูกต้อง | | |
| Record refund | refund audit และยอดคงเหลือถูกต้อง | | |
| Void invoice | void reason/audit ถูกต้อง | | |
| Receipt/tax invoice number | เลขเอกสารตรงตาม workflow | | |
| Cashier reconciliation | expected/counted/variance ถูกต้อง | | |
| Billing summary CSV | เปิด spreadsheet ได้และ field เพียงพอ | | |

## Admin/Clinic Owner

| Scenario | Expected result | Result | Note |
| --- | --- | --- | --- |
| User/practitioner CRUD | เพิ่ม/แก้/deactivate/reactivate ได้ | | |
| Role permission overrides | grant/deny มีผลตาม route | | |
| Clinic settings/logo | branding ใช้ใน print/export | | |
| Audit lookup | เห็น action สำคัญพร้อม actor | | |
| Go/no-go review | ตัดสินได้จาก evidence และ defect tracker | | |

## IT/Ops

| Scenario | Expected result | Result | Note |
| --- | --- | --- | --- |
| Target env variables | production readiness strict ผ่าน | | |
| Storage config | persistent/private storage path ถูกต้อง | | |
| API smoke | ผ่านกับ target-like DB/API | | |
| Browser smoke | ผ่านกับ browser runtime | | |
| Backup/restore drill | restore DB/file assets ได้จริง | | |
| Rollback drill | rollback deployment ได้ตาม runbook | | |
| Security incident tabletop | มี owner และ action log | | |
| Printer bridge simulator/adapter | polling/ack/fallback/retry/report ทำงาน | | |

## Exit Criteria

- ไม่มี blocker ค้าง
- high severity มี owner และแผนแก้ก่อน pilot
- หมอ/พยาบาล/เภสัช/บัญชี/IT ลงผลทดสอบครบ
- production readiness strict ผ่านใน target environment
- backup/restore และ rollback drill มีหลักฐาน
- เจ้าของคลินิกลง go/no-go decision

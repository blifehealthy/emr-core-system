# Phase 3 Master UAT Checklist

เอกสารนี้ใช้ตรวจ Phase 3 ทั้งก้อนก่อนตัดสินใจ pilot/go-no-go

## กลุ่มผู้ทดสอบ

- แพทย์
- พยาบาล/หน้าห้องตรวจ
- ห้องยา
- cashier/front desk
- บัญชีหรือผู้ดูรายงานการเงิน
- clinic owner/admin
- IT/operator

## 1. Billing และ cashier

- สร้าง invoice จาก encounter/prescription ได้
- เพิ่ม/แก้ line item ก่อนรับเงินได้
- รับ payment หลายช่องทางได้
- ทำ refund ได้
- void invoice พร้อม reason ได้
- ออกเลข invoice/receipt/tax invoice ตาม sequence ได้
- ปิดรอบเงินสดและเห็น variance ได้
- Export billing summary CSV ได้

เกณฑ์ผ่าน: cashier อธิบาย workflow เงินสดประจำวันได้และตัวเลขในรายงานตรงกับรายการตัวอย่าง

## 2. Pharmacy inventory

- เพิ่ม inventory item และผูก drug catalog ได้
- รับ stock เข้า lot พร้อม expiry ได้
- จ่ายยาจาก prescription แล้ว stock ลดถูกต้อง
- เห็น low stock/reorder point
- ดู stock movement audit ได้
- ใช้ barcode scan lookup ได้
- พิมพ์/สร้าง label payload ได้

เกณฑ์ผ่าน: ห้องยาสามารถรับเข้า จ่ายออก และตรวจย้อน stock movement ของยาทดสอบได้

## 3. Procurement และ PO approval

- สร้าง supplier ได้
- สร้าง purchase order ได้
- submit PO เพื่อ approval ได้
- approve/reject ตาม policy ได้
- PO ที่ยังไม่ approve รับของไม่ได้
- PO ที่ approve แล้วรับเข้า lot ได้

เกณฑ์ผ่าน: pharmacy manager/owner เข้าใจสถานะ PO และจุดควบคุมก่อนรับของ

## 4. Location/bin และ transfer

- ตั้ง location/bin ได้
- รับ stock เข้า location ที่ถูกต้อง
- ดู stock แยก location ได้
- ขอ transfer lot-specific ได้
- approve transfer ได้
- receive transfer ที่ปลายทางได้
- cancel transfer ตามสิทธิ์ได้

เกณฑ์ผ่าน: ห้องยาแยก stock ต้นทาง/ปลายทางและตรวจ movement ได้

## 5. FEFO/expiry guard และ override review

- ระบบบล็อก lot หมดอายุเมื่อไม่มี override reason
- ระบบเตือน non-FEFO lot เมื่อไม่มี override reason
- บันทึก reason เมื่อ override
- รายงาน pharmacy override แสดงรายการ dispense/transfer override ได้
- Export override CSV ได้

เกณฑ์ผ่าน: หัวหน้าห้องยาตรวจ override รายวัน/รายสัปดาห์จากระบบได้

## 6. Controlled drug governance

- ทำเครื่องหมาย controlled substance ที่ inventory item ได้
- Controlled substance register แสดง receiving, dispensing, transfer ได้
- Controlled dispensing ต้องมี witness
- Witness ต้อง re-auth ด้วย login code
- เปิด reconciliation round ได้
- ปิด reconciliation round ด้วย counted quantity ได้
- Zero variance ปิดเป็น `closed`
- Non-zero variance เป็น `pending_approval`
- ผู้ปิดรอบ approve variance ของตัวเองไม่ได้
- User อื่นที่มีสิทธิ์ approve ได้

เกณฑ์ผ่าน: clinic owner/pharmacy lead ตรวจ controlled-drug activity และ variance approval ย้อนหลังได้

## 7. Role permission override

- Admin ดู permission matrix ได้
- Grant permission ให้ role ระหว่าง UAT ได้
- Deny permission ให้ role ระหว่าง UAT ได้
- Audit log บันทึกการแก้ permission ได้

เกณฑ์ผ่าน: admin เข้าใจว่า override มีผลกับทั้ง role ภายใน clinic

## 8. Frontend workflow

- Registration สร้างคนไข้ได้
- Queue load/filter/update ได้
- Appointment/check-in ใช้งานได้
- Encounter/SOAP สร้างและแก้ได้
- SOAP finalize/sign ได้
- Prescription print/export ใช้งานได้
- Billing workspace ใช้งานได้
- Pharmacy inventory controls ใช้งานได้
- Operations dashboard เห็นรายงานและ controlled reconciliation ได้
- Admin workspace จัดการ user/practitioner/permission ได้

เกณฑ์ผ่าน: ผู้ใช้แต่ละ role ทำ workflow ของตัวเองโดยไม่ต้องใช้ API manual

## 9. Technical verification

- `npm test` ผ่าน
- `npm run api:smoke` ผ่าน
- `npm run frontend:workflow-smoke` ผ่าน
- Production readiness check ผ่านใน target environment
- Backup/restore drill ผ่านใน target environment

## UAT Result

| Area | Owner | Result | Notes |
| --- | --- | --- | --- |
| Billing/cashier | TBD | TBD | TBD |
| Pharmacy inventory | TBD | TBD | TBD |
| Procurement/PO | TBD | TBD | TBD |
| Location/transfer | TBD | TBD | TBD |
| FEFO/override | TBD | TBD | TBD |
| Controlled drug | TBD | TBD | TBD |
| Admin/permission | TBD | TBD | TBD |
| Frontend workflow | TBD | TBD | TBD |
| Technical readiness | TBD | TBD | TBD |

## Decision

- [ ] Pass
- [ ] Pass with conditions
- [ ] Blocked

ถ้า blocked ให้บันทึก blocker และย้ายไป Phase 4 หรือ hotfix ตามความเสี่ยง

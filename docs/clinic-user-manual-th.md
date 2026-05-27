# Clinic User Manual

คู่มือย่อสำหรับผู้ใช้คลินิกในช่วง UAT/pilot

## เข้าระบบ

1. เปิดหน้า frontend
2. ใส่ API token หรือ login ตาม configuration ของ pilot
3. ตรวจว่าชื่อ role/สิทธิ์ตรงกับผู้ใช้
4. ถ้าเข้าไม่ได้ ให้แจ้ง IT พร้อมเวลาที่เกิดปัญหา

## Front Desk / พยาบาล

งานหลัก:

1. ลงทะเบียนผู้ป่วย
2. ค้นหา HN
3. สร้าง appointment
4. Check-in
5. ดู queue board
6. ส่งผู้ป่วยเข้าห้อง/แพทย์

สิ่งที่ต้องระวัง:

- ตรวจ HN และชื่อก่อนแก้ข้อมูล
- ถ้า check-in ผิดคน ให้บันทึก defect ทันที
- ถ้า queue ไม่ refresh ให้ reload และแจ้ง IT

## หมอ

งานหลัก:

1. เปิด patient record
2. ตรวจ flags/allergies/conditions/medications
3. เปิด encounter หรือเริ่มตรวจจาก queue
4. เขียน SOAP
5. เพิ่ม diagnosis/vital/prescription ตาม workflow
6. finalize/sign note เมื่อพร้อม

สิ่งที่ต้องระวัง:

- ตรวจ allergy warning ก่อนสั่งยา
- ถ้ามี warning แต่ยังต้องสั่งยา ต้องใส่ override reason
- อย่า sign note ถ้ายังไม่ตรวจเนื้อหา

## เภสัช

งานหลัก:

1. ดู prescription
2. ตรวจ warning/override
3. dispense ยา
4. รับ stock และ lot/expiry
5. โอน stock ระหว่าง location/bin
6. scan barcode
7. พิมพ์ label
8. ทำ controlled-drug workflow ถ้ามี

สิ่งที่ต้องระวัง:

- ตรวจ lot/expiry ก่อน dispense
- ถ้าเลือก lot ที่หมดอายุหรือไม่ FEFO ต้องมีเหตุผล
- controlled drug ต้องมี witness/re-auth ตาม workflow
- ถ้า printer ล่ม ให้ใช้ Print recovery และบันทึก fallback

## แคชเชียร์/บัญชี

งานหลัก:

1. สร้าง invoice จาก encounter
2. ตรวจ line items
3. รับ payment
4. ออก receipt/tax invoice number
5. refund หรือ void ตามสิทธิ์
6. ตรวจ billing summary และ cashier reconciliation

สิ่งที่ต้องระวัง:

- ตรวจยอดก่อนบันทึก payment
- void/refund ต้องมีเหตุผล
- export CSV แล้วให้บัญชีตรวจ field ก่อนใช้จริง

## Admin

งานหลัก:

1. จัดการ users/practitioners
2. ตั้ง clinic settings/logo
3. ดู audit logs
4. ตั้ง role permission overrides ถ้าจำเป็น
5. ช่วยสรุป defect และ UAT result

สิ่งที่ต้องระวัง:

- ไม่ใช้ shared admin account
- deactivate user เมื่อไม่ใช้งาน
- role override ต้องมีเหตุผลและผู้อนุมัติ

## IT/Ops

งานหลัก:

1. ตั้ง environment
2. ตรวจ production readiness
3. ตรวจ storage
4. รัน smoke tests
5. ทำ backup/restore drill
6. ทำ rollback drill
7. support printer/scanner

สิ่งที่ต้องระวัง:

- อย่าใช้ storage path ชั่วคราวใน pilot จริง
- เก็บ backup evidence ทุกครั้ง
- ถ้าเกิด incident ให้บันทึก timeline และ owner

## เมื่อพบปัญหา

บันทึกใน `docs/pilot-defect-tracker-th.md` หรือระบบ defect ที่คลินิกใช้ โดยต้องมี:

- เวลาเกิดปัญหา
- role/ผู้พบ
- HN หรือ test case ที่เกี่ยวข้อง
- ขั้นตอนที่ทำ
- expected result
- actual result
- screenshot หรือ note ถ้ามี
- severity ที่เสนอ

## Manual Fallback

ถ้าระบบหรือ hardware มีปัญหาระหว่าง UAT/pilot:

- clinical: ใช้แบบฟอร์มจดชั่วคราวและ backfill เมื่อระบบกลับมา
- billing: ออกใบรับเงิน manual ตาม policy แล้ว reconcile ภายหลัง
- pharmacy: จ่ายยาตามกระบวนการ manual ที่เภสัชอนุมัติ และบันทึก stock correction
- printer: ใช้ browser fallback/manual print และบันทึกเหตุผล
- scanner: พิมพ์ barcode/manual entry และบันทึก defect

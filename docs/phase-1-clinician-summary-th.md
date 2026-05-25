# สรุป Phase 1 สำหรับแพทย์

เอกสารนี้สรุปสถานะระบบ EMR Core หลังปิด Phase 1 ในภาษาสำหรับแพทย์และทีมคลินิก ใช้เพื่อ review แนวทางการใช้งานจริง ตัดสินใจว่า scope Phase 1 เพียงพอหรือไม่ และเตรียมเลือกทิศทาง Phase 2

## ภาพรวม

Phase 1 ทำให้ระบบมีแกนเวชระเบียนที่ใช้งานเป็น workflow คลินิกพื้นฐานได้แล้ว ตั้งแต่ลงทะเบียนผู้ป่วย ค้นหาเวชระเบียน ดูข้อมูลสำคัญก่อนตรวจ สร้างนัดหมาย check-in เริ่ม encounter เขียน SOAP บันทึก diagnosis/vital/prescription และลงนาม note

ระบบนี้ยังไม่ใช่ production-ready EMR เต็มรูปแบบ แต่เป็น foundation ที่มีข้อมูลหลัก โครง workflow และ audit trail พอสำหรับให้แพทย์ทดลอง flow, ตรวจ terminology, และให้ feedback ก่อนขยายเป็น Phase 2

## สิ่งที่ทำได้แล้ว

### 1. ลงทะเบียนและค้นหาเวชระเบียน

- ลงทะเบียนผู้ป่วยใหม่ด้วย HN/MRN, ชื่อ, เพศกำเนิด, เบอร์โทร และข้อมูลพื้นฐาน
- ค้นหาผู้ป่วยจาก clinic และ HN/MRN
- เปิดหน้าเวชระเบียนผู้ป่วยเพื่อดูข้อมูลทางคลินิกที่เกี่ยวข้อง

### 2. Patient Clinical Profile

หน้าเวชระเบียนรองรับข้อมูลพื้นฐานที่แพทย์และทีมคลินิกมักต้องดูก่อนตรวจ:

- flags หรือสัญญาณเตือน เช่น critical/caution/info
- allergies
- conditions/problem list
- medications เดิมของผู้ป่วย
- appointments
- encounters
- diagnoses
- vital signs
- prescriptions
- clinical notes และ SOAP notes

ข้อมูลหลายกลุ่มสามารถเพิ่ม แก้ไข และ soft delete ได้ เพื่อรองรับการแก้รายการที่บันทึกผิดโดยไม่ลบประวัติออกจากระบบทันที

### 3. Appointment, Check-in, และเริ่มตรวจ

ระบบมี workflow หน้าคลินิกพื้นฐาน:

- สร้างนัดหมายผู้ป่วย
- แก้ไขหรือเลื่อนนัด
- เปลี่ยนสถานะนัดหมายตามลำดับที่กำหนด
- check-in ด้วยสถานะ `checked_in`
- จากนัดที่ check-in แล้ว สามารถเริ่ม encounter/visit ได้

สถานะนัดหมายถูก guard ฝั่ง backend แล้ว เช่น:

- `pending -> confirmed/cancelled`
- `confirmed -> checked_in/cancelled/no_show`
- `checked_in -> completed`
- สถานะปลายทางจะไม่ให้เปลี่ยนต่อแบบผิดลำดับ

หมายเหตุ: Phase 1 ยังไม่มีตาราง check-in แยกต่างหาก check-in ถูกแทนด้วยสถานะของ appointment

### 4. Encounter และ SOAP Note

แพทย์สามารถเริ่ม encounter พร้อม SOAP note ได้ โดยรองรับ:

- chief complaint
- triage summary
- attending practitioner
- encounter class
- started/ended time
- Subjective
- Objective
- Assessment
- Plan
- diagnosis เบื้องต้น
- vital signs เบื้องต้น

หลังสร้างแล้วสามารถ:

- เปิด SOAP เดิมจากแท็บ Notes
- แก้ Subjective/Objective/Assessment/Plan
- finalize note
- sign note

สถานะ encounter ถูก guard ฝั่ง backend แล้ว เช่น:

- `draft -> in_progress/cancelled`
- `in_progress -> completed/cancelled`
- `completed -> signed`

### 5. Diagnoses, Vitals, Prescriptions

ระบบรองรับข้อมูลทางคลินิกหลักใน encounter:

- diagnoses พร้อมสถานะ เช่น active/resolved/entered_in_error
- vital signs
- prescriptions พร้อม dosage/frequency/status

รายการเหล่านี้มี API สำหรับอ่าน เพิ่ม แก้ และ soft delete แล้ว และแสดงรวมในหน้าเวชระเบียนผู้ป่วย

### 6. User, Practitioner, และ Clinic Admin

มีหน้า admin สำหรับจัดการทีมคลินิก:

- เพิ่ม/แก้ไข users
- เพิ่ม/แก้ไข practitioners
- ผูก practitioner กับ user
- เปิด/ปิดการใช้งาน user/practitioner
- ค้นหา/filter active/inactive
- pagination สำหรับรายการผู้ใช้และแพทย์/บุคลากร
- error message อ่านง่ายเมื่อข้อมูลซ้ำ เช่น username หรือ practitioner code ซ้ำ

### 7. Audit Log

ระบบเริ่มมี audit trail สำหรับการเปลี่ยนแปลงสำคัญแล้ว และมี UI ให้ค้น audit log ในหน้า admin โดยระบุ:

- entity type
- entity id
- limit จำนวนรายการ

Audit log แสดง action, actor, เวลา และ metadata เพื่อให้ trace ได้ว่าใครทำอะไรกับข้อมูลชุดใด

## บทบาทผู้ใช้

Phase 1 มี role หลัก:

- doctor
- nurse
- admin

สิทธิ์ถูกกำหนดระดับ route/API แล้ว เช่น doctor สามารถอ่าน/เขียนข้อมูลทางคลินิกและ sign note ได้ ขณะที่ admin จัดการ user/practitioner และอ่าน audit ได้ รายละเอียดเชิงเทคนิคอยู่ใน `docs/role-permission-matrix.md`

## Flow การใช้งานตัวอย่าง

1. เจ้าหน้าที่ลงทะเบียนผู้ป่วยหรือค้น HN เดิม
2. เจ้าหน้าที่สร้าง appointment
3. ผู้ป่วยมาถึงคลินิกและถูก check-in
4. แพทย์เปิดเวชระเบียน เห็น flags/allergies/conditions/medications เดิม
5. แพทย์เริ่ม encounter จาก appointment ที่ check-in แล้ว
6. แพทย์เขียน SOAP และบันทึก diagnosis/vitals/prescription
7. แพทย์แก้ SOAP เพิ่มเติมถ้าจำเป็น
8. แพทย์ finalize/sign clinical note
9. Admin หรือผู้มีสิทธิ์ตรวจ audit log ได้ภายหลัง

## ข้อจำกัดของ Phase 1

สิ่งต่อไปนี้ยังไม่ควรถูกมองว่าเสร็จสำหรับ production:

- ยังไม่มี billing/claims
- ยังไม่มี lab integration
- ยังไม่มี pharmacy dispensing workflow
- ยังไม่มี imaging/PACS integration
- ยังไม่มี queue board หรือ room management เต็มรูปแบบ
- ยังไม่มี template clinical note แบบเฉพาะโรคหรือเฉพาะแผนก
- ยังไม่มีระบบ consent/document upload ที่ทำเป็น user-facing workflow เต็ม
- ยังไม่มี reporting/dashboard สำหรับผู้บริหารหรือแพทย์
- ยังไม่มี MFA, session management, หรือ production-grade identity provider
- มี browser smoke test แบบ headless Chrome สำหรับ flow คิวตรวจและพิมพ์ใบสั่งยาแล้ว รวมถึงชุดที่ยิงผ่าน API จริงกับฐานข้อมูลทดสอบ แต่ยังไม่ใช่ Playwright suite เต็มรูปแบบ
- check-in ยังใช้ appointment status แทน dedicated check-in record

## ประเด็นที่ควรให้แพทย์ช่วย review

### Clinical terminology

- คำว่า encounter, visit, clinical note, SOAP ใช้ตรงกับ workflow คลินิกหรือไม่
- ต้องการชื่อไทยหรือชื่อย่อใน UI อย่างไร
- problem list ควรเรียกว่า conditions, chronic diseases, diagnoses เดิม หรือคำอื่น

### SOAP workflow

- แพทย์ต้องการแยก note draft/final/sign แบบนี้หรือไม่
- การแก้ SOAP หลัง finalize/sign ควรถูกจำกัดมากกว่านี้หรือไม่
- ต้องการ co-sign หรือ supervisor sign หรือไม่

### Appointment/check-in workflow

- สถานะ appointment ที่มีอยู่พอหรือไม่
- ควรเพิ่ม waiting, in_room, with_doctor, discharged หรือไม่
- check-in ควรเป็น record แยกต่างหากใน Phase 2 หรือใช้ appointment status ต่อไป

### Patient safety

- flags ควรมีประเภท predefined หรือเปิดให้พิมพ์ free text ต่อไป
- allergy severity/status ที่มีอยู่พอหรือไม่
- medication list ควรแยก current medication กับ prescription ใหม่อย่างไร

### Prescription workflow

- ต้องการ drug catalog หรือรหัสยาใน Phase 2 หรือไม่
- ต้องการ allergy/drug interaction warning หรือไม่
- ต้องการ print/export ใบสั่งยาหรือไม่

## สถานะการทดสอบ

Phase 1 มี automated checks หลัก:

- unit/API/migration tests ผ่าน
- API smoke test ผ่านกับ PostgreSQL จริงใน Docker
- frontend dev proxy smoke test ผ่าน
- TypeScript compile check ผ่าน
- frontend JavaScript syntax check ผ่าน

หมายเหตุ: การทดสอบเหล่านี้ช่วยยืนยัน flow หลัก แต่ยังไม่แทนที่ UAT โดยแพทย์และทีมคลินิก

## ข้อเสนอการ sign off Phase 1

Phase 1 ควรถูก sign off ถ้าแพทย์เห็นว่า:

- โครงสร้างเวชระเบียนหลักถูกต้อง
- flow ลงทะเบียน นัดหมาย check-in เริ่มตรวจ เขียน SOAP และ sign note สมเหตุสมผล
- ข้อมูลสำคัญก่อนตรวจแสดงครบพอสำหรับ MVP
- ข้อจำกัดข้างต้นรับได้และสามารถเลื่อนไป Phase 2

ถ้ายังไม่ sign off ควรระบุเป็นรายการสั้น ๆ ว่า blocker คืออะไร เช่น terminology ไม่ตรง, workflow check-in ไม่พอ, หรือ SOAP/signing rule ยังไม่ถูกต้อง

## ข้อเสนอ Phase 2

หลัง Phase 1 แนะนำให้เลือก focus หลักเพียง 1-2 ทางก่อน:

1. Clinical usability: note templates, faster order/prescription entry, better patient timeline
2. Clinic operations: queue board, room status, visit lifecycle, staff task flow
3. Reporting: daily visits, diagnoses, prescriptions, practitioner workload
4. Billing/claims: charge capture, invoice, insurer/claim workflow
5. Integrations: lab, pharmacy, imaging, LINE/telemedicine

ข้อเสนอเริ่มต้น: ถ้าต้องการให้แพทย์ใช้จริงเร็วที่สุด ให้เริ่ม Phase 2 ด้วย clinical usability และ clinic operations ก่อน billing หรือ external integrations

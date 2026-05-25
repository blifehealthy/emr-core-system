# สรุป Phase 2A สำหรับแพทย์และทีมคลินิก

เอกสารนี้สรุป Phase 2A ในภาษาสำหรับแพทย์ พยาบาล เจ้าหน้าที่หน้าคลินิก และผู้บริหารคลินิก ใช้เพื่อ review ว่า flow หน้าคลินิกหลัง Phase 1 พร้อมทดลองใช้งานจริงระดับ UAT หรือยัง

## ภาพรวม

Phase 2A ขยายระบบจากเวชระเบียนหลักไปสู่การทำงานประจำวันของคลินิกมากขึ้น โดยเน้น 3 เรื่อง:

- queue และ visit lifecycle สำหรับหน้าห้องตรวจ
- ความคล่องตัวของแพทย์ในการเปิดเวชระเบียน เริ่มตรวจ เขียน SOAP และพิมพ์ใบสั่งยา
- เครื่องมือ admin/reporting สำหรับดูภาพรวมคลินิกและตรวจสอบ audit

สถานะปัจจุบันคือ dev scope ของ Phase 2A เสร็จสำหรับนำไปทำ clinician UAT แล้ว แต่ยังต้องให้ทีมคลินิกช่วยยืนยันคำเรียก ขั้นตอน และรูปแบบรายงานก่อนถือว่า sign off เชิง product/clinical

## สิ่งที่เพิ่มจาก Phase 1

### 1. Queue Board และ Visit Lifecycle

มีแท็บ Queue Board สำหรับติดตามผู้ป่วยที่เข้ารับบริการในวันนั้น โดย visit มีสถานะหลัก:

- waiting
- in room
- with doctor
- completed
- discharged
- cancelled

เจ้าหน้าที่หรือแพทย์สามารถ:

- ดูคิวที่กำลังรอหรืออยู่ระหว่างตรวจ
- filter ตาม practitioner และห้อง
- claim หรือระบุผู้ดูแลคิว
- เริ่ม encounter/SOAP จากคิว
- เปิดเวชระเบียนผู้ป่วยจากคิวที่มี encounter แล้ว

### 2. Appointment Check-in ที่สร้าง Visit จริง

เมื่อผู้ป่วยมาถึงคลินิก การ check-in จาก appointment จะสร้าง visit record แยกจาก appointment แล้วจึงเปลี่ยนสถานะ appointment เป็น `checked_in`

ผลคือระบบเริ่มแยกความหมายของ:

- appointment: นัดหมายล่วงหน้า
- visit: การมารับบริการจริงในวันนั้น
- encounter: การตรวจรักษาและบันทึกข้อมูลทางคลินิก

### 3. เปิดเวชระเบียนและเริ่ม SOAP จากคิว

จาก Queue Board สามารถเริ่มตรวจได้เร็วขึ้น:

- เลือกคิวผู้ป่วย
- เริ่ม encounter/SOAP
- บันทึก chief complaint, triage summary, diagnosis, vital signs และ SOAP
- ระบบผูก encounter กลับไปที่ visit เพื่อให้เปิดต่อจากคิวได้

### 4. Patient Timeline

หน้าเวชระเบียนผู้ป่วยมี timeline แบบย่อ เพื่อช่วยให้แพทย์เห็นเหตุการณ์สำคัญของผู้ป่วยได้เร็วขึ้น เช่น encounter, appointment, note, diagnosis, vital, prescription และรายการ profile สำคัญ

### 5. SOAP Templates

ระบบมี clinic-managed SOAP templates:

- admin/ทีมคลินิกเพิ่มหรือแก้ template ได้
- แพทย์เลือก template ตอนเริ่ม SOAP
- ถ้ายังไม่มี template ระบบมี starter fallback ให้ใช้งานก่อน

เป้าหมายคือช่วยลดเวลาพิมพ์ note และเปิดทางให้ทำ template เฉพาะคลินิกหรือเฉพาะโรคใน phase ต่อไป

### 6. เปิดและแก้ SOAP เดิม

ในแท็บ Notes ถ้า note เป็น SOAP จะมีปุ่มเปิด SOAP เพื่อดูและแก้:

- Subjective
- Objective
- Assessment
- Plan

หลังบันทึก ระบบ refresh เวชระเบียนและกลับมาที่แท็บ Notes

### 7. ใบสั่งยาแบบมี Branding คลินิก

Prescription cards รองรับ print/export view ที่ดึงข้อมูล branding จาก clinic settings เช่น:

- ชื่อคลินิก
- ที่อยู่
- เบอร์โทร
- footer note
- โลโก้คลินิก

คลินิกสามารถ upload/download/list logo asset และเลือกโลโก้ที่ใช้ในเอกสารได้

### 8. Daily Operations Reporting

มีรายงาน daily operations สำหรับดูภาพรวมการทำงานของคลินิกตามช่วงวันที่:

- จำนวน visit
- จำนวน diagnosis
- จำนวน prescription
- workload ตาม provider
- workload ตามห้อง
- workload ตาม prescriber
- top diagnoses
- export CSV
- charts แบบเบาใน frontend

รายงานนี้เหมาะสำหรับเริ่ม review ภาพรวมงานประจำวัน แต่ชื่อกราฟและหมวดหมู่ควรให้ทีมคลินิกช่วยตรวจจากข้อมูลจริงอีกครั้ง

### 9. Admin Team Management และ Audit Lookup

หน้า admin รองรับ workflow สำคัญมากขึ้น:

- เพิ่ม/แก้/ปิดใช้งาน user
- เพิ่ม/แก้/ปิดใช้งาน practitioner
- search, filter active/inactive, pagination
- ตรวจ audit log ตาม entity type และ entity id

เหมาะสำหรับให้ admin clinic ตรวจสอบการเปลี่ยนแปลงข้อมูลสำคัญย้อนหลังได้ในระดับ MVP

## Flow การใช้งานตัวอย่าง

1. เจ้าหน้าที่สร้าง appointment หรือค้นผู้ป่วยเดิม
2. ผู้ป่วยมาถึงคลินิกและถูก check-in
3. ระบบสร้าง visit และแสดงใน Queue Board
4. เจ้าหน้าที่ assign ห้องหรือ practitioner ถ้าจำเป็น
5. แพทย์เปิดคิวและเริ่ม encounter/SOAP
6. แพทย์ดู timeline, profile, allergies, conditions และ medication เดิม
7. แพทย์เขียน SOAP โดยเลือก template ได้
8. แพทย์บันทึก diagnosis, vital signs และ prescription
9. พิมพ์หรือ export ใบสั่งยาที่มี branding คลินิก
10. ปรับสถานะ visit จนจบ flow เช่น completed หรือ discharged
11. ผู้บริหารหรือ admin ดูรายงาน daily operations และ audit log ภายหลัง

## สถานะการทดสอบ

Phase 2A มี automated checks ครอบคลุม flow หลักแล้ว:

- unit/API/migration tests ผ่าน
- TypeScript compile check ผ่าน
- frontend JavaScript syntax check ผ่าน
- API smoke test ผ่านกับ PostgreSQL จริงใน Docker
- frontend workflow smoke ผ่าน
- headless Chrome smoke สำหรับ queue และ prescription print ผ่าน
- API-backed headless Chrome smoke ผ่าน real API, frontend proxy และ temporary PostgreSQL โดยครอบคลุม queue, prescription print, appointment check-in, SOAP edit, report CSV export, clinic branding/logo upload, admin user/practitioner CRUD และ audit lookup

หมายเหตุ: automated tests ช่วยลด regression แต่ยังไม่แทน UAT โดยแพทย์ พยาบาล และเจ้าหน้าที่หน้าคลินิก

## เรื่องที่ควรให้ทีมคลินิกช่วย Review

### Queue และ Visit

- สถานะ waiting, in room, with doctor, completed, discharged, cancelled ตรงกับ flow จริงหรือไม่
- ต้องแยกสถานะพยาบาลคัดกรองกับพบแพทย์ละเอียดกว่านี้หรือไม่
- การ claim practitioner/room เพียงพอสำหรับหน้าห้องตรวจหรือไม่

### SOAP และ Template

- template ที่ต้องใช้จริงควรมีชุดใดบ้าง
- การแก้ SOAP เดิมควรถูกจำกัดตามสถานะ finalize/sign มากขึ้นหรือไม่
- คำเรียกในหน้าจอควรเป็นไทย อังกฤษ หรือใช้คำย่อเฉพาะคลินิก

### Prescription Print

- layout ใบสั่งยาพอสำหรับใช้งานจริงหรือไม่
- ต้องมีเลขที่ใบสั่งยา ลายเซ็นแพทย์ หรือข้อมูลใบประกอบวิชาชีพเพิ่มหรือไม่
- footer/branding ตรงกับเอกสารคลินิกจริงหรือไม่

### Reporting

- กราฟ daily operations ใช้คำเรียกและหมวดหมู่เข้าใจง่ายหรือไม่
- provider workload, room workload, prescriber workload ควรปรับชื่อหรือ grouping อย่างไร
- ต้องการ export เพิ่มเติม เช่น PDF หรือแยกตามแผนกหรือไม่

## ข้อจำกัดที่ยังไม่ใช่ Production Ready

- ยังไม่มี billing/claims
- ยังไม่มี lab, pharmacy dispensing, imaging/PACS integration
- Phase 2B เริ่มมี drug catalog, allergy warning และ interaction warning foundation แล้ว แต่ยังไม่มี inventory/pharmacy dispensing เต็มรูปแบบ
- ยังไม่มี MFA/session management/identity provider ระดับ production
- ยังไม่มี Playwright suite เต็มรูปแบบ แม้มี browser smoke ครอบคลุม flow สำคัญแล้ว
- ยังต้อง harden audit, permission, backup, monitoring และ deployment ตามสภาพแวดล้อมจริง

## ข้อเสนอการ Sign Off Phase 2A

Phase 2A ควรถูก sign off เชิง product/clinical ถ้าทีมคลินิกเห็นว่า:

- queue และ visit lifecycle สะท้อนการทำงานหน้าคลินิกได้พอสำหรับ MVP
- แพทย์เริ่มตรวจจากคิวและเขียน SOAP ได้ไม่ติดขั้นตอนสำคัญ
- prescription print/export มีข้อมูลพอสำหรับทดลองใช้งานจริง
- admin สามารถจัดการทีมและตรวจ audit ได้ในระดับที่ยอมรับได้
- daily operations report ให้ภาพรวมที่มีประโยชน์ แม้ยังต้องปรับ label จากข้อมูลจริง

ถ้ายังไม่ sign off ควรระบุ blocker ให้ชัด เช่น สถานะคิวไม่ตรงจริง, template ยังไม่พอ, ใบสั่งยาขาดข้อมูลบังคับ, หรือรายงานใช้คำที่ทีมคลินิกตีความผิด

## ข้อเสนอ Phase 2B

หลัง Phase 2A แนะนำให้เลือกทิศทางหลักตาม feedback จาก UAT:

1. Production readiness: auth/session/MFA, deployment, monitoring, backup, audit hardening
2. Clinical depth: drug catalog, allergy/interactions, disease-specific templates, structured orders
3. Operations depth: task board, nurse workflow, room scheduling, queue display
4. Reporting depth: PDF reports, department grouping, trend dashboards, financial/operational KPIs
5. Integrations: lab, pharmacy, imaging, LINE/telemedicine

ข้อเสนอเริ่มต้น: ถ้าต้องการ pilot ในคลินิกจริง ให้ให้ความสำคัญกับ production readiness และ clinical safety ก่อนเพิ่ม integration ใหญ่ โดย Phase 2B เริ่มวาง foundation ของ drug catalog, allergy warning และ interaction warning แล้วใน `docs/phase-2b-plan.md`

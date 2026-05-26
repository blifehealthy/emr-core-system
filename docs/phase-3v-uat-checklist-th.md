# Phase 3V UAT Checklist: Controlled Substance Reconciliation

## เตรียมข้อมูล

- มี inventory item ที่ตั้ง `isControlledSubstance = true`
- item นั้น active และมี `quantityOnHand`
- มี admin user สำหรับเปิดและปิดรอบตรวจนับ
- มีข้อมูลรับเข้า/จ่าย/โอนยา controlled drug เพื่อเทียบกับ register

## กรณีทดสอบ

- เปิดหน้า Operations แล้วโหลดข้อมูลคลินิก
- ตรวจ controlled substance panel ว่าเห็นปุ่มเปิดรอบตรวจนับ
- เปิดรอบตรวจนับด้วยวันที่วันนี้
- เรียก `GET /api/controlled-substance-reconciliations?clinicId=...&status=open`
- ตรวจว่ายอด expected quantity ตรงกับยอด controlled item ในระบบ ณ ตอนเปิดรอบ
- ปิดรอบด้วยยอดนับจริงเท่ากับ expected quantity
- ตรวจว่าสถานะเป็น `closed` และ variance เป็น `0`
- เปิดรอบใหม่ในวันทดสอบอื่น แล้วปิดด้วยยอดที่ต่างจาก expected quantity
- กรอกเหตุผลส่วนต่าง
- ตรวจ audit log ของ entity `controlled_substance_reconciliation`
- ทดสอบว่า role ที่ไม่มี `drug_catalog_write` เปิด/ปิดรอบไม่ได้

## เกณฑ์ผ่าน

- เปิดรอบซ้ำ clinic/date เดิมไม่ได้
- รอบที่เปิดแล้ว list เห็นใน Operations dashboard
- ปิดรอบแล้วระบบคำนวณ counted/variance ถูกต้อง
- เหตุผลส่วนต่างถูกเก็บเมื่อมี variance
- สิทธิ์การเปิด/ปิดรอบจำกัดเฉพาะ role ที่ได้รับอนุญาต

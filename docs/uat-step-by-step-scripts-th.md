# UAT Step-By-Step Scripts

ใช้เอกสารนี้ให้คนทดสอบทำตามทีละขั้นตอน  
ทุก script ต้องบันทึกผลใน `docs/uat-execution-checklist-th.md`

## Script 1: Registration To Encounter

ผู้ทดสอบ: Front desk, Nurse, Doctor

1. Login เป็น front desk/nurse
2. เปิดหน้า registration
3. สร้างผู้ป่วย `UAT-P001`
4. ค้นหา HN ที่สร้าง
5. สร้าง appointment วันนี้
6. กด check-in
7. เปิด queue board
8. claim visit ให้ provider
9. Login/สลับเป็น doctor
10. start encounter จาก queue
11. เขียน SOAP สั้น ๆ
12. เพิ่ม diagnosis
13. finalize/sign note
14. ปิด encounter/visit

Expected result:

- patient record เปิดถูกคน
- appointment เป็น checked-in
- visit แสดงใน queue
- encounter/SOAP ถูกสร้างและเปิดซ้ำได้
- note finalize/sign ได้

## Script 2: Prescription Safety

ผู้ทดสอบ: Doctor, Pharmacy

1. เปิดผู้ป่วย `UAT-P002`
2. ยืนยันว่ามี allergy ต่อ test drug
3. สั่งยา Amoxicillin
4. ตรวจ warning ที่แสดง
5. ลองบันทึกโดยไม่ใส่ override reason
6. ใส่ override reason และบันทึก
7. ให้ Pharmacy เปิด prescription
8. ตรวจ warning/override snapshot

Expected result:

- warning แสดงก่อนบันทึก
- ระบบ block เมื่อไม่มี override reason
- override reason ถูกเก็บใน prescription

## Script 3: Inventory, Lot, FEFO

ผู้ทดสอบ: Pharmacy

1. เปิด Pharmacy inventory
2. รับ stock Paracetamol เข้า `LOT-PARA-GOOD`
3. รับ stock Paracetamol เข้า `LOT-PARA-OLD`
4. ลอง dispense จาก lot หมดอายุ
5. ลอง dispense จาก non-FEFO lot
6. ใส่ expiry/FEFO override reason
7. ตรวจ stock movement
8. เปิด pharmacy override report

Expected result:

- expired/non-FEFO lot ถูก block ถ้าไม่มี reason
- เมื่อใส่ reason แล้วบันทึกได้
- override report แสดง event

## Script 4: Controlled Substance

ผู้ทดสอบ: Pharmacy, Witness, Owner

1. เปิด controlled item Diazepam
2. รับ stock เข้า `LOT-DIAZ-CTRL`
3. สร้าง/เปิด prescription สำหรับ Diazepam
4. dispense โดยไม่ใส่ witness
5. dispense โดยใส่ witness คนเดียวกับ dispenser
6. dispense โดยใส่ witness คนละคนและ login code
7. เปิด controlled substance register
8. เปิด reconciliation round
9. close round ด้วย variance
10. approve variance ด้วย user คนอื่น

Expected result:

- controlled dispense ต้องมี witness
- dispenser และ witness ต้องต่างกัน
- re-auth metadata ถูกเก็บ
- variance ต้อง pending approval
- closer approve เองไม่ได้

## Script 5: Barcode And Printer

ผู้ทดสอบ: Pharmacy, IT

1. เปิด scanner panel
2. scan barcode item ที่รู้จัก
3. scan barcode lot ที่รู้จัก
4. scan GS1 barcode
5. scan unknown barcode
6. สร้าง label template item/lot
7. export ZPL
8. export ESC/POS
9. สร้าง utility bridge printer profile
10. ส่ง job เข้า queue
11. ack printing
12. ack failed พร้อม error
13. ใช้ browser fallback
14. retry queue
15. เปิด printer bridge health report และ CSV

Expected result:

- scan result matched/not matched ถูกต้อง
- GS1 fields แสดง
- label template ถูกใช้ใน payload
- queue/fallback/retry มี audit/status ถูกต้อง
- printer health report เห็น failed/fallback/retry

## Script 6: Billing And Cashier

ผู้ทดสอบ: Cashier, Accounting

1. เปิด encounter ที่ completed
2. สร้าง invoice from encounter
3. เพิ่ม line item manual
4. บันทึก partial payment
5. บันทึก full payment
6. บันทึก refund
7. void invoice ทดสอบพร้อมเหตุผล
8. สร้าง receipt/tax invoice number
9. ทำ cashier reconciliation
10. export billing summary CSV

Expected result:

- totals คำนวณถูก
- invoice status ถูกต้อง
- refund/void มี audit/reason
- CSV เปิดใน spreadsheet ได้

## Script 7: Admin, Audit, Security

ผู้ทดสอบ: Admin, IT, Owner

1. สร้าง user ใหม่
2. แก้ role หรือ active status
3. deactivate user
4. ตรวจว่า inactive user ใช้ไม่ได้
5. สร้าง practitioner
6. ตั้ง clinic logo/settings
7. ค้น audit log ของ action สำคัญ
8. ตั้ง role permission override test
9. ตรวจ route ที่ถูก deny/grant

Expected result:

- user/practitioner CRUD ทำงาน
- audit log เห็น actor/action
- role override มีผลจริง

## Script 8: Ops Drill

ผู้ทดสอบ: IT/Ops

1. ตั้ง target env variables
2. รัน `PRODUCTION_READINESS_STRICT=true npm run production:check`
3. รัน `npm run storage:check`
4. รัน `npm run api:smoke`
5. รัน browser smoke ถ้ามี Chrome/Docker
6. backup database
7. restore database ไป test target
8. backup/restore file assets
9. rollback deployment
10. security incident tabletop
11. บันทึก owners และ pilot window

Expected result:

- strict checks ผ่าน
- restore/rollback มีหลักฐาน
- incident owner และ escalation ชัดเจน

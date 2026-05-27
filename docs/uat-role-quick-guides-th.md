# UAT Role Quick Guides

เอกสารนี้เป็นคู่มือสั้นสำหรับคนทดสอบ แยกตามบทบาท  
อ่านส่วนของตนก่อนเริ่ม UAT และบันทึกปัญหาใน defect tracker

## หมอ

เป้าหมาย: ยืนยันว่าเวชระเบียน, encounter, SOAP, diagnosis, prescription,
note finalize/sign ใช้งานจริงในห้องตรวจได้

ทำอะไรบ้าง:

1. Login ด้วย role หมอ
2. เปิด patient record จาก HN ทดสอบ
3. ตรวจ flags/allergies/conditions/medications
4. เปิด encounter จาก queue
5. เขียน SOAP ใหม่
6. เปิด SOAP เดิมแล้วแก้ไข
7. เพิ่ม diagnosis และ prescription
8. ตรวจ allergy/interaction warning
9. finalize/sign clinical note
10. ปิด encounter

ต้องแจ้งทันทีถ้า:

- เปิดเวชระเบียนผิดคน
- warning ยาไม่แสดงหรือแสดงผิด
- SOAP บันทึกแล้วข้อมูลหาย
- sign/finalize แล้ว status ไม่ถูกต้อง

## พยาบาล / Front Desk

เป้าหมาย: ยืนยันว่า flow หน้าคลินิกตั้งแต่ลงทะเบียนถึงส่งเข้าห้องตรวจทำได้จริง

ทำอะไรบ้าง:

1. ลงทะเบียนผู้ป่วยใหม่
2. ค้นหา HN
3. สร้าง appointment
4. check-in appointment
5. ดู queue board
6. claim/reassign queue
7. เปลี่ยน room/provider/status
8. เปิด patient record จาก queue

ต้องแจ้งทันทีถ้า:

- queue ไม่ขึ้นหลัง check-in
- status เปลี่ยนผิดลำดับ
- provider/room แสดงผิด
- appointment หายหรือซ้ำ

## เภสัช

เป้าหมาย: ยืนยันว่างานยา stock barcode controlled drug และ printer fallback ใช้ได้

ทำอะไรบ้าง:

1. ตรวจ drug catalog
2. รับ stock เข้า lot/expiry
3. ตรวจ location/bin stock
4. dispense prescription
5. ทดสอบ FEFO/expiry guard
6. ทดสอบ controlled dispense พร้อม witness/re-auth
7. ทำ controlled reconciliation
8. scan barcode ปกติและ GS1
9. สร้าง label template
10. export label และทดสอบ printer queue/fallback/retry

ต้องแจ้งทันทีถ้า:

- stock ลด/เพิ่มไม่ถูก
- lot/expiry ผิด
- controlled drug ไม่บังคับ witness
- barcode scan match ผิด
- label หรือ printer recovery ใช้งานไม่ได้

## แคชเชียร์ / บัญชี

เป้าหมาย: ยืนยันว่า invoice, payment, refund, void, receipt/tax invoice,
cashier reconciliation และ CSV ใช้ส่งบัญชีได้

ทำอะไรบ้าง:

1. สร้าง invoice จาก encounter
2. เพิ่ม/แก้ line item
3. บันทึก payment
4. บันทึก refund
5. void invoice พร้อมเหตุผล
6. ตรวจ receipt/tax invoice number
7. ทำ cashier reconciliation
8. export billing summary CSV

ต้องแจ้งทันทีถ้า:

- ยอดรวม/ยอดคงเหลือผิด
- payment/refund ไม่ถูก audit
- void แล้ว invoice ยังใช้งานต่อได้
- CSV field ไม่พอสำหรับบัญชี

## Admin / Clinic Owner

เป้าหมาย: ยืนยันว่า admin controls, audit, role permission และ go/no-go
พร้อมใช้ก่อน pilot

ทำอะไรบ้าง:

1. สร้าง/แก้/deactivate/reactivate user
2. สร้าง/แก้ practitioner
3. ตรวจ audit logs
4. ตรวจ clinic settings/logo
5. ตรวจ role permission overrides
6. อ่าน defect summary
7. ตัดสิน go/no-go

ต้องแจ้งทันทีถ้า:

- user inactive ยังเข้าได้
- audit ไม่บันทึก action สำคัญ
- role override ไม่ทำงาน
- ไม่มี owner สำหรับ blocker

## IT / Ops

เป้าหมาย: ยืนยันว่า environment, backup, restore, rollback, incident,
storage, printer bridge พร้อมสำหรับ pilot

ทำอะไรบ้าง:

1. ตั้ง environment variables จริง
2. รัน strict production readiness
3. รัน storage check กับ persistent storage
4. รัน API/browser smoke ใน target-like environment
5. ทำ backup/restore drill
6. ทำ rollback drill
7. ทำ security incident tabletop
8. ทดสอบ printer bridge adapter หรือ simulator
9. ตรวจ printer bridge health report

ต้องแจ้งทันทีถ้า:

- strict readiness มี error
- restore ไม่สำเร็จ
- rollback ทำไม่ได้
- storage ยังเป็น temp path
- bridge ไม่มี fallback/retry ที่พิสูจน์ได้

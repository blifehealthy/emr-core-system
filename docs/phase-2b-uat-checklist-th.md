# Phase 2B UAT Checklist

ใช้ checklist นี้กับข้อมูลทดสอบก่อนเริ่ม pilot clinic จริง

## ผู้เข้าร่วม UAT

- แพทย์
- พยาบาลหรือเจ้าหน้าที่หน้าห้องตรวจ
- Admin clinic
- ผู้ดูแลระบบ deployment

## Drug Catalog

- Admin เปิดดูรายการยาได้
- Admin เพิ่มยาใหม่ได้
- Admin แก้ไขชื่อยา, generic name, strength, form, route ได้
- Admin ปิดใช้งานยาที่ไม่ต้องการใช้ต่อได้
- แพทย์หรือพยาบาลเห็นรายการยาที่ active ในฟอร์มสั่งยา
- ค้นหายาแล้วเจอผลลัพธ์ที่ตรงกับการใช้งานจริง

## Allergy Warning

- เพิ่ม allergy active ให้ผู้ป่วยได้
- สั่งยาที่ไม่ชน allergy แล้วไม่มี warning ผิดพลาด
- สั่งยาที่ชน allergy แล้วเห็น warning ชัดเจน
- Warning แสดงข้อมูลที่ช่วยตัดสินใจ เช่น allergen, severity, reaction ถ้ามี
- ถ้ามี warning แล้วไม่กรอก override reason ระบบไม่ให้บันทึก prescription
- เมื่อกรอก override reason แล้วสามารถบันทึก prescription ได้
- เปิดดู prescription ย้อนหลังแล้วเห็น warning snapshot และ override reason

## Drug Interaction Warning

- Admin เพิ่ม interaction rule ได้
- Admin แก้ไข interaction rule ได้
- Admin ปิดใช้งาน rule ได้
- สั่งยาที่ชนกับ active medication แล้วเห็น interaction warning
- สั่งยาที่ชนกับ active prescription เดิมแล้วเห็น interaction warning
- สั่งยาที่ไม่ชน rule แล้วไม่เกิด warning ผิดพลาด
- ข้อความ recommendation อ่านเข้าใจและใช้ตัดสินใจได้

## Prescription Workflow

- เลือก encounter หรือ clinical note ที่เกี่ยวข้องได้ถูกต้อง
- กรอก medication name, dosage, route, frequency, duration, instructions ได้
- กด safety check ก่อนบันทึกได้
- บันทึก prescription แล้ว patient detail refresh ถูกต้อง
- Prescription card แสดงข้อมูลยาและ warning snapshot ถูกต้อง
- Print/export prescription ยังทำงานหลังเพิ่ม safety fields

## Role And Permission

- Doctor สั่งยาได้
- Nurse อ่านรายการยาและ warning ได้ตามสิทธิ์ที่กำหนด
- Admin จัดการ drug catalog และ interaction rules ได้
- ผู้ใช้ที่ไม่มีสิทธิ์ถูกปฏิเสธด้วย error ที่เข้าใจได้

## Deployment Readiness

- `npm test` ผ่าน
- `npm run api:smoke` ผ่าน
- `npm run browser:api-workflow-smoke` ผ่านถ้ามี Chrome และ Docker Postgres
- `npm run storage:check` แสดง storage config ถูกต้อง
- `PRODUCTION_READINESS_STRICT=true npm run production:check` ไม่มี error
- Database backup และ file storage backup มีเจ้าของงานชัดเจน
- มี manual downtime process สำหรับการตรวจและการสั่งยา

## UAT Sign-Off

ให้ทีม UAT ระบุผลลัพธ์:

- ผ่าน
- ผ่านแบบมีข้อสังเกต
- ไม่ผ่าน ต้องแก้ก่อน pilot

ประเด็นที่ควรบันทึกทุกครั้ง:

- warning ที่ทำให้แพทย์ลังเลหรือไม่มั่นใจ
- ยาที่ค้นหาไม่เจอหรือชื่อไม่ตรงกับการใช้งานจริง
- override reason ที่กรอกยากหรือไม่สะท้อนเหตุผลจริง
- interaction rule ที่ควรเพิ่มก่อนเริ่ม pilot
- workflow ที่ทำให้หน้าห้องตรวจช้าลง

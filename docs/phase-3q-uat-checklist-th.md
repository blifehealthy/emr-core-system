# Phase 3Q UAT Checklist: Pharmacy Role Separation

## เตรียมข้อมูล

- มี prescription ที่พร้อม dispense
- มี inventory lot ที่ใช้ทดสอบ FEFO/expiry override ได้
- มี inventory transfer สถานะ `pending`
- มี inventory transfer สถานะ `in_transit`
- ผู้ทดสอบมี role doctor, nurse, และ admin

## กรณีทดสอบ

- Doctor จ่ายยาปกติโดยไม่มี override reason ได้
- Doctor จ่ายยาพร้อม `fefoOverrideReason` แล้วต้องได้ 403
- Admin จ่ายยาพร้อม `expiryOverrideReason` หรือ `fefoOverrideReason` ได้
- Nurse approve transfer แล้วต้องได้ 403
- Admin approve transfer ได้
- Nurse receive transfer สถานะ `in_transit` ได้
- Nurse cancel transfer แล้วต้องได้ 403
- Admin cancel transfer ได้

## เกณฑ์ผ่าน

- สิทธิ์ตรงตาม role-permission matrix
- Override ที่ admin ทำยังถูกบันทึกใน pharmacy override report
- ทีมคลินิกยืนยันได้ว่า flow อนุมัติและรับโอนยาตรงกับงานหน้าห้องยา

# Phase 3S UAT Checklist: Controlled Dispense Witness

## เตรียมข้อมูล

- มี inventory item ที่ตั้ง `isControlledSubstance = true`
- มี prescription ที่พร้อมจ่ายยาจาก item นั้น
- มี user คนจ่ายยาและ user witness คนละคน
- มี lot/location ที่มี stock เพียงพอ

## กรณีทดสอบ

- จ่ายยาทั่วไปโดยไม่กรอก witness แล้วต้องสำเร็จ
- จ่ายยาควบคุมโดยไม่กรอก `witnessUserId` แล้วต้องถูกปฏิเสธ
- จ่ายยาควบคุมโดยใช้ user เดียวกับ `dispensedByUserId` และ `witnessUserId` แล้วต้องถูกปฏิเสธ
- จ่ายยาควบคุมโดยใช้ witness คนละ user แล้วต้องสำเร็จ
- ตรวจ dispense row ว่ามี `witness_user_id`, `witnessed_at`, `witness_note`
- เปิด controlled substance register แล้วตรวจว่า recent dispense event มี witness metadata

## เกณฑ์ผ่าน

- ระบบไม่ยอมบันทึก controlled dispense ที่ไม่มี witness
- ระบบไม่ยอมให้คนจ่ายเป็น witness เอง
- ทีมคลินิกยืนยันว่าขั้นตอน witness ตรงกับ workflow ห้องยา

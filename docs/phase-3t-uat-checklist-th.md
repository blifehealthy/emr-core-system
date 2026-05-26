# Phase 3T UAT Checklist: Controlled Witness Re-authentication

## เตรียมข้อมูล

- มี inventory item ที่ตั้ง `isControlledSubstance = true`
- มี prescription ที่พร้อมจ่ายยาจาก item นั้น
- มี user คนจ่ายยาและ user witness คนละคน
- witness user ต้อง active และอยู่คลินิกเดียวกัน
- ตั้งค่า witness login code ในระบบทดสอบ

## กรณีทดสอบ

- จ่ายยาทั่วไปโดยไม่กรอก witness login code แล้วต้องสำเร็จ
- จ่ายยาควบคุมโดยไม่กรอก `witnessLoginCode` แล้วต้องถูกปฏิเสธ
- จ่ายยาควบคุมด้วย login code ผิด แล้วต้องถูกปฏิเสธ
- จ่ายยาควบคุมโดยใช้ witness ที่ inactive หรือคนละคลินิก แล้วต้องถูกปฏิเสธ
- จ่ายยาควบคุมด้วย witness คนละ user และ login code ถูกต้อง แล้วต้องสำเร็จ
- ตรวจ dispense row ว่ามี `witness_reauth_method`, `witness_reauthenticated_at`, `witness_signature_hash`
- เปิด controlled substance register แล้วตรวจว่า recent dispense event มี re-auth metadata

## เกณฑ์ผ่าน

- controlled dispense ไม่มีทางผ่านได้ด้วย witness user id อย่างเดียว
- ระบบไม่เปิดเผยหรือบันทึก login code ดิบ
- ทีมคลินิกยืนยันว่าขั้น re-auth ไม่ทำให้ workflow ห้องยาสะดุดเกินไป

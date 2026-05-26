# สรุปสำหรับคลินิก: Phase 3U ปรับสิทธิ์ตามคลินิก

Phase 3U เพิ่มฐานข้อมูลสำหรับปรับ permission ราย role ต่อคลินิก จากเดิมที่สิทธิ์ถูกกำหนดคงที่ในโค้ดทั้งหมด

## สิ่งที่เปลี่ยน

- ค่า default role permission ยังเหมือนเดิม
- admin สามารถดู permission matrix ของคลินิกได้
- admin สามารถ override permission ราย role ได้ เช่น เปิด `prescription_write` ให้ nurse ระหว่าง UAT
- ระบบโหลด override ตอน resolve actor จาก session/OIDC
- route authorization ใช้ override ก่อน fallback ไปค่า default
- มี audit log เมื่อแก้ permission override

## ประโยชน์กับคลินิก

- ปรับ workflow ตามคลินิกจริงได้โดยไม่ต้องแก้โค้ดทุกครั้ง
- รองรับ UAT ที่พบว่าบางบทบาทต้องทำงานมากกว่าค่า default
- เป็นฐานสำหรับ governance ที่ละเอียดขึ้น เช่น per-user permission หรือ approval workflow

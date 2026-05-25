# สรุป Phase 2C สำหรับแพทย์ เจ้าของคลินิก และผู้ดูแลระบบ

เอกสารนี้สรุป Phase 2C ซึ่งเน้นเรื่องการเข้าสู่ระบบและความปลอดภัยก่อนใช้งาน pilot

## เป้าหมายของ Phase 2C

Phase 2C ลดการพึ่งพา header ที่กรอกเองระหว่างทดสอบ และเริ่มขยับระบบไปสู่การระบุตัวตนแบบ production มากขึ้น

เป้าหมายหลัก:

- ให้ผู้ใช้ login จากหน้าเว็บได้
- ให้ API รู้ว่า user เป็นใครจาก session token
- ให้ role และ practitioner ถูกดึงจากฐานข้อมูล ไม่ใช่เชื่อค่าที่ frontend ส่งมาอย่างเดียว
- เพิ่มร่องรอยด้านความปลอดภัย เช่น last login และ failed login count

## สิ่งที่ระบบทำได้แล้ว

### Login Session

หน้าเว็บมีส่วนเข้าสู่ระบบโดยใช้:

- Clinic ID
- Username
- Login Code ที่ operator ตั้งไว้

เมื่อ login สำเร็จ ระบบจะได้ bearer session token และใช้ token นี้กับ workflow เดิม เช่น คิวตรวจ เวชระเบียน ใบสั่งยา และหน้า admin

### Database-Resolved Role

Session token เก็บเฉพาะ user id เท่านั้น

เมื่อเรียก API ระบบจะนำ user id ไป resolve จากฐานข้อมูลเพื่อดู:

- role เช่น doctor, nurse, admin
- practitioner id ถ้ามี
- active/inactive status

ถ้า user ถูกปิดใช้งาน ระบบจะไม่ resolve actor ให้

### Login Security State

ตาราง users เพิ่มข้อมูล:

- `last_login_at`
- `failed_login_count`
- `locked_until`

เมื่อ login สำเร็จ ระบบจะ reset failed count และบันทึก last login

ถ้าใส่ login code ผิดหลายครั้ง ระบบสามารถ lock user ชั่วคราวได้

### Production Readiness

คำสั่ง readiness check ตรวจค่าใหม่:

- `AUTH_SESSION_SECRET`
- `AUTH_LOGIN_CODE`
- `AUTH_SESSION_TTL_MINUTES`

ก่อน pilot ควรตั้งค่าเหล่านี้ให้เป็น secret จริง ไม่ใช้ค่า dev

## สิ่งที่แพทย์และทีมคลินิกควรลอง

- Login เป็น doctor แล้วเปิดเวชระเบียนได้
- Login เป็น nurse แล้วใช้ workflow หน้าห้องตรวจได้
- Login เป็น admin แล้วเข้าเมนูตั้งค่าคลินิกได้
- Login ด้วย role ที่ไม่มีสิทธิ์แล้วระบบปฏิเสธอย่างถูกต้อง
- Logout แล้ว token ถูกล้างจากหน้าเว็บ
- ใช้ workflow สำคัญหลัง login เช่น queue, SOAP, prescription safety, report export

## ข้อจำกัดที่ต้องเข้าใจ

- Phase 2C ยังไม่ใช่ระบบ username/password/MFA เต็มรูปแบบ
- Login code ยังเป็นรหัสกลางที่ operator ดูแล
- ก่อน production ที่ใช้งานวงกว้าง ควรเปลี่ยนเป็น identity provider, OIDC, MFA หรือ credential ราย user
- API token แบบ technical ยังมีอยู่สำหรับ smoke test และ operator workflow

## สถานะ

Phase 2C พร้อมให้ทีมคลินิกและ operator review/UAT แล้ว

งานถัดไปหลัง UAT คือเลือกระหว่าง:

- ทำ OIDC/MFA production auth ต่อ
- ขยาย medication governance/clinical safety ต่อ
- ทำ deployment pilot จริงพร้อม monitoring และ backup drills

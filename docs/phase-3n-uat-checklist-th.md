# Phase 3N UAT Checklist: ย้ายสต็อกแบบมีอนุมัติ

## เตรียมข้อมูล

- มี inventory item อย่างน้อย 1 รายการ
- มี lot และ quantity ที่ location/bin ต้นทาง
- มี location/bin ปลายทาง
- ผู้ทดสอบมีสิทธิ์อ่านและแก้ไข drug catalog/inventory

## กรณีทดสอบหลัก

- สร้าง transfer แบบไม่ติ๊ก approval แล้วตรวจว่า status เป็น `completed`
- ตรวจว่า stock ต้นทางลด และปลายทางเพิ่มทันที
- สร้าง transfer แบบติ๊ก `Approval required`
- ตรวจว่า status เป็น `pending` และ stock ยังไม่เปลี่ยน
- กดอนุมัติ transfer
- ตรวจว่า status เป็น `in_transit` และ stock ต้นทางลด
- กดรับเข้าปลายทาง
- ตรวจว่า status เป็น `completed` และ stock ปลายทางเพิ่ม
- สร้าง transfer แบบ approval อีกครั้ง แล้วกดยกเลิกตอน `pending`
- สร้าง transfer แบบ approval อีกครั้ง อนุมัติ แล้วกดยกเลิกตอน `in_transit`
- ตรวจว่า cancellation reason ถูกบันทึก และ stock ต้นทางถูกคืนเมื่อยกเลิกตอน `in_transit`

## API ที่เกี่ยวข้อง

- `GET /api/inventory-transfers?clinicId=...&status=all`
- `POST /api/inventory-transfers`
- `POST /api/inventory-transfers/:transferId/approve`
- `POST /api/inventory-transfers/:transferId/receive`
- `POST /api/inventory-transfers/:transferId/cancel`

## เกณฑ์ผ่าน

- เจ้าหน้าที่สามารถอธิบายสถานะ pending, in transit, completed, cancelled ได้
- จำนวน stock ตาม location/bin ถูกต้องหลังแต่ละ action
- รายการ transfer แสดง lot, ต้นทาง, ปลายทาง, quantity, status, และเวลาสำคัญ
